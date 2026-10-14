#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { loadSession } from './session.js';
import { runEvaluation, readResult, validateCases } from './eval.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const HOSTS = { codex: '.agents/skills', claude: '.claude/skills' };
const AGENT_HOSTS = { codex: '.codex/agents', claude: '.claude/agents' };
const ROLES = {
  'web-planner': 'plan', 'web-architect': 'design', 'ux-ui': 'design',
  frontend: 'implementation', backend: 'implementation', database: 'implementation', reviewer: 'review',
  'web-qa': 'review', 'web-security': 'review', deployment: 'release', 'service-operations': 'release',
};
const readJSON = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const encodeJSON = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const digest = data => createHash('sha256').update(data).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const stat = p => { try { return fs.lstatSync(p); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } };

function resolveRoot(p) {
  let cursor = path.resolve(p);
  const suffix = [];
  while (!stat(cursor)) { suffix.unshift(path.basename(cursor)); cursor = path.dirname(cursor); }
  return path.join(fs.realpathSync(cursor), ...suffix);
}

function checkAncestors(p) {
  for (let cursor = path.resolve(p); ; cursor = path.dirname(cursor)) {
    const info = stat(cursor);
    if (info?.isSymbolicLink()) throw new Error(`Symlink/junction destination refused: ${cursor}`);
    if (info && !info.isDirectory()) throw new Error(`Destination ancestor is not a directory: ${cursor}`);
    if (path.dirname(cursor) === cursor) break;
  }
}

export function safePath(root, relative) {
  if (!relative || relative.includes('\\') || relative.includes(':') || path.posix.isAbsolute(relative) || relative.split('/').includes('..')) {
    throw new Error(`Invalid relative path: ${relative}`);
  }
  const result = path.resolve(root, relative);
  checkAncestors(path.dirname(result));
  if (stat(result)?.isSymbolicLink()) throw new Error(`Symlink/junction destination refused: ${result}`);
  return result;
}

export function sourceFiles() {
  const files = new Map();
  function walk(folder) {
    for (const entry of fs.readdirSync(path.join(ROOT, folder), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      if (entry.name.startsWith('.') || entry.name === '__pycache__' || (folder.startsWith('evals/') && ['results', 'VERIFY.md'].includes(entry.name))) continue;
      const name = `${folder}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`Symlink source refused: ${name}`);
      if (entry.isDirectory()) walk(name);
      else if (entry.isFile() && (name.endsWith('.md') || name.startsWith('evals/verify-documentation/') || /^(?:skills|evals)\/[^/]+\/assets\//.test(name))) files.set(name, fs.readFileSync(path.join(ROOT, name)));
    }
  }
  walk('skills'); walk('shared'); walk('hosts');
  if (stat(path.join(ROOT, 'evals'))) for (const entry of fs.readdirSync(path.join(ROOT, 'evals'), { withFileTypes: true })) {
    if (entry.name.startsWith('verify-') && entry.isDirectory()) walk(`evals/${entry.name}`);
  }
  return files;
}

const linkPattern = /\]\(([^)]+)\)/g;
function linkTarget(name, ref) {
  return path.posix.normalize(path.posix.join(path.posix.dirname(name), ref.split('#')[0]));
}

export function validateBundle(files) {
  for (const [name, data] of files) {
    if (!name.endsWith('.md')) continue;
    const body = data.toString('utf8');
    if (name.endsWith('/SKILL.md')) {
      const match = body.match(/^---\r?\nname: ([a-z0-9-]+)\r?\ndescription: (.+)\r?\n(?:license: [^\r\n]+\r?\n)?---\r?\n/);
      if (!match || match[1] !== path.posix.basename(path.posix.dirname(name)) || typeof JSON.parse(match[2]) !== 'string') throw new Error(`Invalid skill manifest: ${name}`);
    }
    for (const [, ref] of body.matchAll(linkPattern)) {
      if (ref.includes('://') || ref.startsWith('#')) continue;
      if (!files.has(linkTarget(name, ref))) throw new Error(`Missing or escaping link in ${name}: ${ref}`);
    }
  }
}

function destinationForSource(name) {
  return name.replace(/^(?:skills|evals)\//, '');
}

export function bundle(host, { includeEvals = false } = {}) {
  if (!Object.hasOwn(HOSTS, host)) throw new Error(`Unknown host: ${host}`);
  const all = sourceFiles(), sources = new Map();
  const queue = [...all.keys()].filter(n => includeEvals || n.startsWith('skills/'));
  while (queue.length) {
    const name = queue.shift(); if (sources.has(name)) continue;
    if (!includeEvals && name.startsWith('evals/')) throw new Error(`Installable skill depends on an evaluation candidate: ${name}`);
    const data = all.get(name); if (!data) throw new Error(`Missing source: ${name}`);
    sources.set(name, data);
    if (name.endsWith('.md')) for (const [, ref] of data.toString('utf8').matchAll(linkPattern)) {
      if (!ref.includes('://') && !ref.startsWith('#')) queue.push(linkTarget(name, ref));
    }
  }
  const mapping = new Map([...sources.keys()].map(n => [n, destinationForSource(n)]));
  if (new Set(mapping.values()).size !== mapping.size) throw new Error('Duplicate bundled path across skill groups');
  return new Map([...sources].map(([name, data]) => {
    const destination = mapping.get(name);
    if (name.endsWith('.md')) data = Buffer.from(data.toString('utf8').replace(linkPattern, (whole, ref) => {
      if (ref.includes('://') || ref.startsWith('#')) return whole;
      const target = mapping.get(linkTarget(name, ref));
      if (!target) throw new Error(`Missing source link in ${name}: ${ref}`);
      const anchor = ref.includes('#') ? ref.slice(ref.indexOf('#')) : '';
      return `](${path.posix.relative(path.posix.dirname(destination), target)}${anchor})`;
    }));
    return [destination, data];
  }));
}

export function managedPlan(root, input, renames = new Map(), retire = []) {
  checkAncestors(root);
  const manifest = safePath(root, '.zzzystack-manifest.json');
  const previous = stat(manifest) ? readJSON(manifest) : { files: {} };
  if (!object(previous) || !object(previous.files)) throw new Error(`Invalid manifest: ${manifest}`);
  const hashes = new Map(Object.entries(previous.files));
  for (const [name, hash] of hashes) {
    const p = safePath(root, name), info = stat(p);
    if (info && (!info.isFile() || digest(fs.readFileSync(p)) !== hash)) throw new Error(`Locally modified managed file: ${p}`);
  }
  const files = new Map(input), retired = [];
  const names = new Set([...retire, ...[...renames].filter(([old, next]) => files.has(next) && old !== next).map(([old]) => old)]);
  for (const name of [...names].sort()) {
    if (!hashes.has(name) || files.has(name)) continue;
    const p = safePath(root, name);
    if (stat(p)) files.set(`.zzzystack-renamed/${name}.bak`, fs.readFileSync(p));
    retired.push(name);
  }
  const changes = [];
  for (const [name, data] of files) {
    const p = safePath(root, name), info = stat(p);
    if (info) {
      if (!info.isFile()) throw new Error(`Destination is not a file: ${p}`);
      if (fs.readFileSync(p).equals(data)) continue;
      if (!hashes.has(name)) throw new Error(`Existing unowned file: ${p}`);
    }
    changes.push([p, data]);
  }
  for (const name of retired) {
    const p = safePath(root, name);
    if (stat(p)) changes.push([p, null]);
    hashes.delete(name);
  }
  for (const [name, data] of files) hashes.set(name, digest(data));
  const data = encodeJSON({ version: fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim(), files: Object.fromEntries(hashes) });
  if (!stat(manifest) || !fs.readFileSync(manifest).equals(data)) changes.push([manifest, data]);
  return changes;
}

export function hostPlan(target, host) {
  const files = bundle(host); validateBundle(files);
  const renames = new Map();
  for (const old of ['zzzystack/assets/delegation.md', 'zzzystack/references/delegation.md', 'zzzystack/references/templates/delegation.md', 'zzzystack/references/principles/delegation.md']) {
    renames.set(old, 'shared/delegation-execution.md');
  }
  for (const name of files.keys()) if (name.startsWith('implementation/')) {
    const suffix = name.slice('implementation/'.length);
    renames.set(`build/${suffix}`, name);
    renames.set(`zzz-build/${suffix}`, name);
  }
  renames.set('zzzystack/references/workflows/build.md', 'implementation/SKILL.md');
  for (const name of files.keys()) if (name.endsWith('/SKILL.md')) {
    renames.set(`zzz-${name}`, name);
    renames.set(`zzzystack/references/workflows/${name.split('/')[0]}.md`, name);
  }
  for (const [role, owner] of Object.entries(ROLES)) renames.set(`zzzystack/references/agents/${role}.md`, `${owner}/references/${role}.md`);
  // Keep legacy asset migrations independent of the removed project initializer.
  for (const [name, destination] of Object.entries({
    'feature-map.md': 'feature-map/assets/feature-map.md',
    'task.md': 'implementation/assets/task.md', 'design.md': 'design/assets/design.md',
    'review.md': 'review/assets/review.md', 'handoff.md': 'handoff/assets/handoff.md',
  })) renames.set(`zzzystack/references/templates/${name}`, destination);
  renames.set('zzzystack/assets/feature-map.md', 'feature-map/assets/feature-map.md');
  for (const old of ['zzzystack/references/core.md', 'zzzystack/references/principles/core.md']) renames.set(old, 'shared/core.md');
  renames.set('zzzystack/references/delegation-execution.md', 'shared/delegation-execution.md');
  renames.set('zzzystack/references/github.md', 'github/references/github.md');
  for (const name of ['claude-code', 'codex']) {
    for (const folder of ['adapters', 'hosts']) renames.set(`zzzystack/references/${folder}/${name}.md`, `hosts/${name}.md`);
  }
  for (const [name, destination] of [['delegation', 'shared/delegation-execution.md'], ['github', 'github/references/github.md']]) {
    for (const folder of ['adapters', 'hosts']) renames.set(`zzzystack/references/${folder}/${name}.md`, destination);
  }
  for (const name of ['programming', 'statistics', 'economics']) renames.set(`onboard/references/domains/${name}.md`, `onboard/references/${name}.md`);
  for (const name of ['domain', 'explanation']) renames.set(`onboard/references/${name}.md`, 'onboard/SKILL.md');
  // Retire only known, unchanged package resources; never touch project records.
  const retiredResources = [
    ...['workflow', 'zzzystack/workflow', 'zzzystack/workflows'].flatMap(folder => [
      `${folder}/README.md`, `${folder}/common/README.md`,
    ]),
    ...['project.md', 'decisions.md', 'report.md'].flatMap(name => [
      `zzzystack/assets/${name}`, `zzzystack/references/templates/${name}`,
    ]),
    'zzzystack/assets/project.example.json',
    'zzzystack/references/configuration.md', 'zzzystack/references/lifecycle.md',
    'zzzystack/workflows/common/feature.md',
    'zzzystack/workflow/common/feature.md',
    'zzzystack/SKILL.md', 'zzz-zzzystack/SKILL.md',
    'zzzystack/references/routing.md', 'zzzystack/references/workflows/routing.md',
    'zzzystack/references/roles.md', 'zzzystack/references/agents/index.md',
    'zzzystack/workflow/companies/insstek/README.md',
    'zzzystack/workflows/companies/insstek/README.md',
  ];
  // Retire only manifest-owned resources removed from the current install bundle.
  // managedPlan checks their hashes, preserves a backup and refuses local edits.
  const skillRoot = safePath(target, HOSTS[host]);
  const oldManifest = safePath(skillRoot, '.zzzystack-manifest.json');
  if (stat(oldManifest)) for (const name of Object.keys(readJSON(oldManifest).files ?? {})) {
    if (!files.has(name) && !name.startsWith('.zzzystack-renamed/')) retiredResources.push(name);
  }
  const changes = managedPlan(skillRoot, files, renames, retiredResources);
  const agentRoot = safePath(target, AGENT_HOSTS[host]);
  if (stat(safePath(agentRoot, '.zzzystack-manifest.json'))) {
    const ext = host === 'codex' ? 'toml' : 'md';
    const retired = Object.keys(ROLES).flatMap(role => [`${role}.${ext}`, `zzz-${role}.${ext}`]);
    changes.push(...managedPlan(agentRoot, new Map(), new Map(), retired));
  }
  return changes;
}

export function applyChanges(changes, dryRun = false) {
  if (!dryRun) for (const [p, data] of changes) {
    if (data === null) fs.unlinkSync(p);
    else { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); }
  }
  return changes.length;
}

export function install(target, hosts, dryRun = false) {
  return applyChanges(hosts.flatMap(host => hostPlan(resolveRoot(target), host)), dryRun);
}

const STATES = { development: '개발중', testing: '테스트 중', verified: '검증 완료' };

export function skillCatalog() {
  return Object.fromEntries([...sourceFiles().keys()].filter(n => n.endsWith('/SKILL.md') && !n.includes('/references/')).map(n => [path.posix.basename(path.posix.dirname(n)), path.posix.dirname(n)]));
}

// Hash all owned resources plus transitive Markdown links. Shared references and
// binary assets invalidate evidence too; nested helper SKILL.md is not a skill entry.
export function skillSnapshot(name, host = 'codex') {
  const files = bundle(host, { includeEvals: true }), selected = new Map();
  if (!files.has(`${name}/SKILL.md`) || !Object.hasOwn(skillCatalog(), name)) throw new Error(`Unknown skill: ${name}`);
  const queue = [...files.keys()].filter(n => n.startsWith(`${name}/`));
  while (queue.length) {
    const file = queue.shift(); if (selected.has(file)) continue;
    const data = files.get(file); if (!data) throw new Error(`Missing dependency: ${file}`);
    selected.set(file, data);
    if (file.endsWith('.md')) for (const [, ref] of data.toString('utf8').matchAll(linkPattern)) {
      if (!ref.includes('://') && !ref.startsWith('#')) queue.push(linkTarget(file, ref));
    }
  }
  const hashes = Object.fromEntries([...selected].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([n, data]) => [n, digest(data)]));
  return { fingerprint: digest(JSON.stringify(hashes)), files: hashes, context: [...selected].filter(([n]) => n.endsWith('.md')).map(([n, data]) => `Resource: ${n}\n${data.toString('utf8').replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')}`).join('\n\n') };
}

export function readRegistry() {
  const registry = readJSON(path.join(ROOT, 'skill-registry.json'));
  if (registry.schemaVersion !== 1 || !object(registry.skills)) throw new Error('Invalid skill registry');
  const catalog = skillCatalog();
  for (const [name, entry] of Object.entries(registry.skills)) {
    if (!Object.hasOwn(catalog, name) || entry.path !== catalog[name] || !Object.hasOwn(STATES, entry.status) || !Array.isArray(entry.history) || !Array.isArray(entry.cases)) throw new Error(`Invalid registry entry: ${name}`);
    if (entry.cases.length) validateCases(entry.cases);
  }
  return registry;
}

function saveRegistry(registry, dryRun) {
  applyChanges([[safePath(ROOT, 'skill-registry.json'), encodeJSON(registry)]], dryRun);
}

export function currentStatus(entry, snapshot) {
  const stale = Boolean(entry.fingerprint && entry.fingerprint !== snapshot.fingerprint) || (entry.status === 'verified' && (!entry.fingerprint || entry.lastEvaluation?.suiteHash !== digest(JSON.stringify(entry.cases)) || entry.lastEvaluation?.harnessHash !== evaluatorHash()));
  return { status: stale ? 'development' : entry.status, stale };
}

const evaluatorHash = () => digest(fs.readFileSync(path.join(ROOT, 'setup/eval.js')));
const activationPath = scope => safePath(scope, '.zzzystack/activation.json');
function readActivation(scope) {
  const file = activationPath(scope);
  const data = stat(file) ? readJSON(file) : { schemaVersion: 1, hosts: {} };
  if (data.schemaVersion !== 1 || !object(data.hosts)) throw new Error('Invalid activation configuration');
  for (const [host, value] of Object.entries(data.hosts)) if (!Object.hasOwn(HOSTS, host) || !object(value) || !object(value.skills)) throw new Error('Invalid activation host');
  return data;
}

export function activationPlan(scope, host, name, mode, snapshot) {
  if (!Object.hasOwn(HOSTS, host)) throw new Error('Choose one --host codex|claude');
  const activation = readActivation(scope);
  const entry = activation.hosts[host] ?? { skills: {} };
  if (mode === 'off') delete entry.skills[name];
  else {
    if (!['always', 'manual'].includes(mode)) throw new Error('Choose --mode always|manual');
    for (const [file, hash] of Object.entries(snapshot.files)) if (digest(fs.readFileSync(safePath(scope, `${HOSTS[host]}/${file}`))) !== hash) throw new Error(`Install current skills before enabling: ${file}`);
    entry.skills[name] = { mode, fingerprint: snapshot.fingerprint, files: snapshot.files, enabledAt: new Date().toISOString() };
  }
  const settingsFile = safePath(scope, host === 'codex' ? '.codex/hooks.json' : '.claude/settings.json');
  const settings = stat(settingsFile) ? readJSON(settingsFile) : {};
  if (!object(settings) || (settings.hooks !== undefined && !object(settings.hooks)) || (settings.hooks?.SessionStart !== undefined && !Array.isArray(settings.hooks.SessionStart))) throw new Error('Malformed host hooks; left unchanged');
  const existing = settings.hooks?.SessionStart ?? [];
  // Remove only our previously registered exact command, preserving foreign hooks.
  const hooks = existing.flatMap(group => {
    if (!object(group) || !Array.isArray(group.hooks)) throw new Error('Malformed SessionStart group');
    const remaining = group.hooks.filter(h => !entry.hookCommand || h.command !== entry.hookCommand);
    return remaining.length ? [{ ...group, hooks: remaining }] : [];
  });
  const changes = [];
  if (Object.values(entry.skills).some(s => s.mode === 'always')) {
    const runtime = safePath(scope, '.zzzystack/runtime/session.mjs');
    const data = fs.readFileSync(path.join(ROOT, 'setup/session.js'));
    if (stat(runtime) && entry.runtimeHash !== digest(fs.readFileSync(runtime)) && !fs.readFileSync(runtime).equals(data)) throw new Error('Locally modified or unowned session runtime');
    const source = `import {loadSession} from ${JSON.stringify(pathToFileURL(runtime).href)};try{const context=loadSession(${JSON.stringify(scope)},${JSON.stringify(host)});if(context)console.log(JSON.stringify({hookSpecificOutput:{hookEventName:'SessionStart',additionalContext:context}}));}catch(e){console.error('zzzystack session: '+e.message)}`;
    // node must be on the host PATH. A bare executable works in sh, cmd and
    // PowerShell; all user paths are inside base64, never shell interpolation.
    entry.hookCommand = `node -e "import('data:text/javascript;base64,${Buffer.from(source).toString('base64')}')"`;
    entry.runtimeHash = digest(data);
    hooks.push({ matcher: 'startup|resume|clear|compact', hooks: [{ type: 'command', command: entry.hookCommand, timeout: 10 }] });
    if (!stat(runtime) || !fs.readFileSync(runtime).equals(data)) changes.push([runtime, data]);
  } else { delete entry.hookCommand; }
  if (hooks.length || settings.hooks?.SessionStart !== undefined) {
    settings.hooks ??= {};
    if (hooks.length) settings.hooks.SessionStart = hooks; else delete settings.hooks.SessionStart;
    const data = encodeJSON(settings);
    if (!stat(settingsFile) || !fs.readFileSync(settingsFile).equals(data)) changes.push([settingsFile, data]);
  }
  activation.hosts[host] = entry;
  changes.push([activationPath(scope), encodeJSON(activation)]);
  return changes;
}

async function manage(command, action, name, values) {
  const options = command === 'skills' ? {
    list: ['project'], sync: ['dry-run'], status: ['set', 'dry-run'], verify: ['run', 'session-evidence', 'dry-run'],
    enable: ['host', 'project', 'mode', 'experimental', 'dry-run'], disable: ['host', 'project', 'dry-run'], check: ['host', 'project'],
  } : { run: ['host', 'model', 'effort', 'trials', 'budget-usd', 'timeout', 'allow-unmetered', 'dry-run'], report: ['run'] };
  if (!Object.hasOwn(options, action)) throw new Error(`Unknown ${command} action: ${action}`);
  for (const key of Object.keys(values)) if (!options[action].includes(key)) throw new Error(`--${key} is not supported by ${command} ${action}`);
  const registry = readRegistry(), scope = resolveRoot(values.project ?? os.homedir());
  if (command === 'skills' && action === 'list') {
    const activation = readActivation(scope);
    console.table(Object.entries(registry.skills).map(([skill, entry]) => {
      const state = currentStatus(entry, skillSnapshot(skill));
      return { skill, location: entry.path.startsWith('evals/') ? 'evals' : 'skills', status: STATES[state.status], recheck: state.stale, cases: entry.cases.length, evaluation: entry.lastEvaluation?.id ?? '-', codex: activation.hosts.codex?.skills[skill]?.mode ?? 'off', claude: activation.hosts.claude?.skills[skill]?.mode ?? 'off' };
    })); return 0;
  }
  if (command === 'skills' && action === 'sync') {
    for (const [skill, source] of Object.entries(skillCatalog())) {
      registry.skills[skill] ??= { path: source, status: 'development', cases: [], history: [], lastEvaluation: null };
      const entry = registry.skills[skill], snapshot = skillSnapshot(skill), state = currentStatus(entry, snapshot);
      if (state.stale) { entry.history.push({ at: new Date().toISOString(), status: 'development', reason: 'source or evaluation definition changed', previousFingerprint: entry.fingerprint }); entry.status = 'development'; }
      entry.fingerprint = snapshot.fingerprint;
    }
    saveRegistry(registry, values['dry-run']); console.log('Registry synchronized (previous evidence retained).'); return 0;
  }
  const entry = registry.skills[name]; if (!entry) throw new Error(`Unregistered skill: ${name}. Run skills sync.`);
  const snapshot = skillSnapshot(name), state = currentStatus(entry, snapshot);
  if (command === 'eval') {
    if (action === 'report') {
      const report = readResult(process.cwd(), values.run ?? entry.lastEvaluation?.id ?? '');
      if (report.skill !== name) throw new Error('Evaluation belongs to another skill');
      console.log(JSON.stringify({ id: report.id, status: report.status, host: report.host, model: report.model, costUsd: report.costUsd, ...report.summary, error: report.error, nativeSession: report.nativeSession }, null, 2)); return 0;
    }
    if (action !== 'run') throw new Error('Use eval run|report');
    const report = await runEvaluation({ root: process.cwd(), name, cases: entry.cases, ...snapshot, harnessHash: evaluatorHash(), host: values.host, model: values.model, effort: values.effort, trials: Number(values.trials ?? 3), budget: Number(values['budget-usd'] ?? 5), timeoutMs: Number(values.timeout ?? 180) * 1000, allowUnmetered: values['allow-unmetered'], dryRun: values['dry-run'], progress: console.log, started: result => {
      entry.status = 'testing'; entry.fingerprint = snapshot.fingerprint;
      entry.lastEvaluation = { id: result.id, host: result.host, model: result.model, fingerprint: result.fingerprint, suiteHash: result.suiteHash, harnessHash: result.harnessHash, passed: false, status: 'running' };
      entry.history.push({ at: new Date().toISOString(), status: 'testing', evaluation: entry.lastEvaluation });
      saveRegistry(registry, false);
    } });
    if (!values['dry-run']) {
      entry.status = 'testing'; entry.fingerprint = snapshot.fingerprint;
      entry.lastEvaluation = { id: report.id, host: report.host, model: report.model, fingerprint: snapshot.fingerprint, suiteHash: report.suiteHash, harnessHash: report.harnessHash, passed: report.summary.passed, status: report.status };
      entry.history.push({ at: new Date().toISOString(), status: 'testing', evaluation: entry.lastEvaluation });
      saveRegistry(registry, false);
    }
    console.log(JSON.stringify(values['dry-run'] ? report : { id: report.id, status: report.status, ...report.summary, error: report.error }, null, 2));
    return report.status === 'failed' || report.summary?.passed === false ? 1 : 0;
  }
  if (action === 'status') {
    if (!['development', 'testing'].includes(values.set)) throw new Error('--set development|testing; use skills verify for verified');
    entry.status = values.set; entry.fingerprint = snapshot.fingerprint;
    entry.history.push({ at: new Date().toISOString(), status: entry.status });
    saveRegistry(registry, values['dry-run']); console.log(`${name}: ${STATES[entry.status]}`);
  } else if (action === 'verify') {
    const report = readResult(process.cwd(), values.run ?? '');
    if (report.provenance !== 'cli' || report.status !== 'completed' || report.skill !== name || report.fingerprint !== snapshot.fingerprint || report.suiteHash !== digest(JSON.stringify(entry.cases)) || report.harnessHash !== evaluatorHash() || !report.summary.passed || report.trials < 3) throw new Error('Verification requires a current, complete, passing CLI evaluation with at least 3 trials');
    if (!values['session-evidence']?.trim()) throw new Error('--session-evidence TEXT is required: record the host/version and actual new-session load check. Hook preview alone is insufficient.');
    entry.status = 'verified'; entry.fingerprint = snapshot.fingerprint;
    entry.lastEvaluation = { id: report.id, fingerprint: report.fingerprint, suiteHash: report.suiteHash, harnessHash: report.harnessHash, host: report.host, model: report.model, passed: true, sessionEvidence: values['session-evidence'], sessionEvidenceType: 'manual' };
    entry.history.push({ at: new Date().toISOString(), status: 'verified', evaluation: entry.lastEvaluation });
    saveRegistry(registry, values['dry-run']); console.log(`${name}: 검증 완료 (${report.host}/${report.model}; native session evidence is manually attested)`);
  } else if (action === 'enable' || action === 'disable') {
    if (action === 'enable' && entry.path.startsWith('evals/')) throw new Error('Evaluation candidates are not installed. Evaluate them by source path; promote explicitly before enabling.');
    if (!['codex', 'claude'].includes(values.host)) throw new Error('Choose one --host codex|claude');
    const mode = action === 'disable' ? 'off' : values.mode ?? 'manual';
    if (mode === 'always' && (state.status !== 'verified' || entry.lastEvaluation?.host !== values.host) && !values.experimental) throw new Error('Always-on requires verification for this host, or explicit --experimental for development/testing');
    const changes = activationPlan(scope, values.host, name, mode, snapshot);
    applyChanges(changes, values['dry-run']);
    console.log(`${values['dry-run'] ? 'Would set' : 'Set'} ${name}: ${mode} (${values.host}, ${scope}). ${mode === 'always' ? 'Restart the host; review/trust the registered hook if requested. Native loading is not yet verified.' : mode === 'manual' ? 'Invoke the installed skill explicitly.' : 'Future sessions will not receive this skill from the managed hook. Start a new session to clear existing context.'}`);
  } else if (action === 'check') {
    if (!['codex', 'claude'].includes(values.host)) throw new Error('Choose one --host codex|claude');
    const context = loadSession(scope, values.host);
    console.log(context || 'No always-on skills loaded.');
    console.log('\nHook preview only; this does not prove native host loading.');
  } else throw new Error('Use skills list|sync|status|verify|enable|disable|check');
  return 0;
}

const HELP = `zzzystack setup (Node.js 22+)
  setup [install] [--host codex|claude|both] [--project PATH | --user] [--dry-run]
  setup validate
  setup build
  setup skills list [--project PATH]
  setup skills sync [--dry-run]
  setup skills status NAME --set development|testing [--dry-run]
  setup skills verify NAME --run ID --session-evidence TEXT [--dry-run]
  setup skills enable NAME --host codex|claude --mode manual|always [--experimental] [--project PATH] [--dry-run]
  setup skills disable NAME --host codex|claude [--project PATH] [--dry-run]
  setup skills check NAME --host codex|claude [--project PATH]
  setup eval run NAME --host codex|claude --model MODEL [--effort medium] [--trials 3] [--budget-usd 5] [--timeout 180] [--allow-unmetered] [--dry-run]
  setup eval report NAME --run ID

Default: install for the current user, both hosts. --project installs only in that project.
Legacy --target PATH is an alias for --project PATH.
From a checkout: npm run setup -- <arguments>, or node setup/cli.js <arguments>.
`;

export async function main(argv = process.argv.slice(2)) {
  let args;
  try {
    let command = 'install';
    if (argv[0] && !argv[0].startsWith('-')) [command, ...argv] = argv;
    const allowed = {
      install: ['host', 'project', 'target', 'user', 'dry-run'], validate: [], build: [],
      skills: ['host', 'project', 'set', 'run', 'session-evidence', 'mode', 'experimental', 'dry-run'],
      eval: ['host', 'model', 'effort', 'trials', 'budget-usd', 'timeout', 'allow-unmetered', 'run', 'dry-run'],
    };
    if (!Object.hasOwn(allowed, command)) throw new Error(`Unknown command: ${command}`);
    const options = Object.fromEntries([...allowed[command], 'help'].map(n => [n, { type: ['help', 'user', 'dry-run', 'experimental', 'allow-unmetered'].includes(n) ? 'boolean' : 'string', ...(n === 'help' ? { short: 'h' } : {}) }]));
    const { values, positionals } = parseArgs({ args: argv, options, allowPositionals: true, strict: true });
    if (values.help) { console.log(HELP); return 0; }
    const count = ['skills', 'eval'].includes(command) ? (command === 'skills' && ['list', 'sync'].includes(positionals[0]) ? 1 : 2) : 0;
    if (positionals.length !== count) throw new Error('Unexpected or missing positional argument');
    if (values.project !== undefined && values.target !== undefined) throw new Error('Choose --project or --target, not both');
    const project = values.project ?? values.target;
    if (values.user && project !== undefined) throw new Error('--user and --project/--target are mutually exclusive');
    if (project !== undefined && !project.trim()) throw new Error('Project path must not be empty');
    if (values.host !== undefined && !['codex', 'claude', 'both'].includes(values.host)) throw new Error(`Unknown host: ${values.host}`);
    args = { command, values, project, pack: positionals[0], name: positionals[1] };
  } catch (e) { console.error(`setup: ${e.message}\nUse --help for usage.`); return 2; }
  try {
    const { command, values, project, pack } = args;
    if (['skills', 'eval'].includes(command)) return await manage(command, pack, args.name, values);
    if (command === 'validate') {
      validateBundle(sourceFiles());
      const registry = readRegistry();
      for (const name of Object.keys(skillCatalog())) if (!Object.hasOwn(registry.skills, name)) throw new Error(`Unregistered skill: ${name}. Run skills sync.`);
      for (const host of Object.keys(HOSTS)) validateBundle(bundle(host));
      if (readJSON(path.join(ROOT, 'package.json')).version !== fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim()) throw new Error('package.json and VERSION disagree');
      console.log('Validated skills, references, both host bundles, links and package version.');
    } else if (command === 'build') {
      const changes = Object.keys(HOSTS).flatMap(host => hostPlan(path.resolve('dist', host), host));
      console.log(`Built dist/: ${applyChanges(changes)} files changed.`);
    } else if (command === 'install') {
      const target = path.resolve(project ?? os.homedir());
      const hosts = !values.host || values.host === 'both' ? Object.keys(HOSTS) : [values.host];
      console.log(`Scope: ${project === undefined ? 'user' : 'project'}`);
      for (const host of hosts) console.log(`${host}: ${path.join(target, HOSTS[host])}`);
      const count = install(target, hosts, values['dry-run']);
      console.log(`${values['dry-run'] ? 'Would change' : 'Changed'} ${count} files. Host policies and project records untouched.`);
    }
    return 0;
  } catch (e) { console.error(`setup: ${e.message}`); return 1; }
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) process.exitCode = await main();
