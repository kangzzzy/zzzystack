// Installed-package checks, run by CI without using the source checkout at runtime.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const cli = path.resolve(process.argv[2] ?? 'setup/cli.js');
const api = await import(pathToFileURL(cli));
const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'zzzystack verify ')));
const home = path.join(temp, 'user home');
const env = { ...process.env, HOME: home, USERPROFILE: home };
const snapshot = root => {
  const result = {};
  function walk(p) {
    if (!fs.existsSync(p)) return;
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      const file = path.join(p, e.name);
      if (e.isDirectory()) walk(file);
      else result[path.relative(root, file)] = fs.readFileSync(file).toString('base64');
    }
  }
  walk(root); return result;
};
function run(args, code = 0) {
  const r = spawnSync(process.execPath, [cli, ...args], { cwd: temp, env, encoding: 'utf8' });
  assert.equal(r.status, code, JSON.stringify({ args, stdout: r.stdout, stderr: r.stderr, error: r.error }));
  return r.stdout;
}
try {
  run(['--help']); run(['validate']);
  assert.deepEqual(Object.keys(api.readRegistry().skills).sort(), Object.keys(api.skillCatalog()).sort());
  for (const resource of ['zzzystack', 'shared', 'workflow']) assert(!Object.hasOwn(api.skillCatalog(), resource));
  const catalog = api.skillCatalog();
  assert.deepEqual(Object.keys(catalog).filter(n => catalog[n].startsWith('skills/')).sort(), ['i-have-adhd', 'requirements']);
  assert.equal(Object.keys(catalog).filter(n => catalog[n].startsWith('evals/')).length, 21);
  assert(Object.keys(catalog).filter(n => catalog[n].startsWith('evals/')).every(n => n.startsWith('verify-')));
  assert(Object.hasOwn(api.skillSnapshot('verify-plan').files, 'shared/core.md'));
  assert(Object.hasOwn(api.skillSnapshot('verify-design').files, 'verify-design/assets/database-design.xlsx'));
  assert(!Object.hasOwn(catalog, 'docx'), 'Nested helper is not an independent skill');
  assert(!Object.keys(api.skillSnapshot('verify-readme').files).some(n => n.includes('/results/')));
  run(['--dry-run']); assert(!fs.existsSync(home));
  assert.match(run(['--host', 'codex']), /Scope: user/);
  assert(!fs.existsSync(path.join(home, '.claude')));
  assert.match(run(['--host', 'codex']), /Changed 0 files/);
  run([]);
  for (const host of ['codex', 'claude']) {
    const installed = path.join(home, api.HOSTS[host]);
    const files = api.bundle(host);
    assert.deepEqual([...files.keys()].filter(n => n.endsWith('/SKILL.md')).sort(), ['i-have-adhd/SKILL.md', 'requirements/SKILL.md']);
    assert(![...files.keys()].some(n => n.startsWith('verify-') || n.startsWith('evals/')));
    for (const [name, data] of files) assert(fs.readFileSync(path.join(installed, name)).equals(data), name);
    assert(fs.existsSync(path.join(installed, 'requirements/assets/requirements.xlsx')));
    assert(!fs.existsSync(path.join(installed, 'plan/SKILL.md')));
  }
  const userBefore = snapshot(home);
  // Older managed candidates are backed up on upgrade; unrelated files survive.
  const cleanup = path.join(temp, 'candidate cleanup');
  const retired = ['plan/SKILL.md', 'documentation/references/docx/scripts/comment.py', 'feature-map/assets/feature-map.md', 'shared/delegation-execution.md', 'hosts/codex.md', 'zzzystack/assets/project.example.json'];
  for (const host of ['codex', 'claude']) {
    const legacy = new Map(api.bundle(host));
    for (const name of retired) legacy.set(name, Buffer.from('legacy ' + name));
    api.applyChanges(api.managedPlan(path.join(cleanup, api.HOSTS[host]), legacy));
    fs.mkdirSync(path.join(cleanup, api.HOSTS[host], 'unowned'), { recursive: true });
    fs.writeFileSync(path.join(cleanup, api.HOSTS[host], 'unowned/SKILL.md'), 'user skill');
  }
  const records = path.join(cleanup, '.zzzystack');
  fs.mkdirSync(records); fs.writeFileSync(path.join(records, 'project.md'), 'user project');
  const recordsBefore = snapshot(records);
  const editedOld = path.join(cleanup, api.HOSTS.claude, retired[0]);
  fs.writeFileSync(editedOld, 'user modification');
  const conflictBefore = snapshot(cleanup);
  run(['--project', cleanup], 1); assert.deepEqual(snapshot(cleanup), conflictBefore);
  fs.writeFileSync(editedOld, 'legacy ' + retired[0]);
  const dryBefore = snapshot(cleanup);
  run(['--project', cleanup, '--dry-run']); assert.deepEqual(snapshot(cleanup), dryBefore);
  run(['--project', cleanup]);
  for (const host of ['codex', 'claude']) {
    const root = path.join(cleanup, api.HOSTS[host]);
    for (const name of retired) {
      assert(!fs.existsSync(path.join(root, name)));
      assert.equal(fs.readFileSync(path.join(root, '.zzzystack-renamed', name + '.bak'), 'utf8'), 'legacy ' + name);
    }
    assert.equal(fs.readFileSync(path.join(root, 'unowned/SKILL.md'), 'utf8'), 'user skill');
  }
  assert.deepEqual(snapshot(records), recordsBefore);
  assert.match(run(['--project', cleanup]), /Changed 0 files/);
  for (const host of ['codex', 'claude', 'both']) {
    const project = `${host} project`, target = path.join(temp, project);
    const args = ['--project', project, '--host', host];
    run([...args, '--dry-run']); assert(!fs.existsSync(target));
    assert.match(run(args), /Scope: project/);
    assert.equal(fs.existsSync(path.join(target, '.agents/skills')), host !== 'claude');
    assert.equal(fs.existsSync(path.join(target, '.claude/skills')), host !== 'codex');
    assert.match(run(args), /Changed 0 files/);
    assert.deepEqual(snapshot(home), userBefore);
    assert(!fs.existsSync(path.join(target, '.zzzystack')));
    // Existing product records are user data, including old initializer output.
    fs.mkdirSync(path.join(target, '.zzzystack'));
    fs.writeFileSync(path.join(target, '.zzzystack/config.json'), '{"legacy":"preserve"}');
    fs.writeFileSync(path.join(target, '.zzzystack/feature-map.md'), 'existing feature IDs');
    const before = snapshot(target);
    run(args);
    for (const removed of ['init', 'check-project', 'automation']) run([removed, '--project', project], 2);
    assert.deepEqual(snapshot(target), before);
    const location = host === 'claude' ? '.claude/skills' : '.agents/skills';
    fs.writeFileSync(path.join(target, location, 'requirements/SKILL.md'), 'user edit');
    const edited = snapshot(target); run(args, 1); assert.deepEqual(snapshot(target), edited);
  }
  run(['install', '--target', 'legacy alias', '--host', 'codex']);
  assert(fs.existsSync(path.join(temp, 'legacy alias/.agents/skills')));
  for (const args of [['--host', 'bad'], ['--project', ''], ['--user', '--project', '.'], ['init', '--name', 'missing path'], ['--unknown']]) {
    const before = snapshot(temp); run(args, 2); assert.deepEqual(snapshot(temp), before);
  }
  // A second-host conflict must prevent writes to the first host.
  const conflict = path.join(temp, 'conflict/.claude/skills/requirements');
  fs.mkdirSync(conflict, { recursive: true }); fs.writeFileSync(path.join(conflict, 'SKILL.md'), 'unowned');
  const before = snapshot(temp); run(['--project', 'conflict'], 1); assert.deepEqual(snapshot(temp), before);
  // Reject traversal and junction destinations before mutation.
  assert.throws(() => api.safePath(temp, '../outside'));
  const outside = path.join(temp, 'outside'), linked = path.join(temp, 'linked');
  fs.mkdirSync(outside); fs.mkdirSync(linked);
  let junctionAvailable = false;
  try { fs.symlinkSync(outside, path.join(linked, '.agents'), process.platform === 'win32' ? 'junction' : 'dir'); junctionAvailable = true; }
  catch (error) { if (process.platform !== 'win32' || error.code !== 'EPERM') throw error; console.log('SKIP: Windows sandbox does not permit junction creation.'); }
  if (junctionAvailable) {
    run(['--project', 'linked', '--host', 'codex'], 1);
    assert.deepEqual(snapshot(outside), {});
  }
  run(['build']); assert.match(run(['build']), /0 files changed/);
  // Skill lifecycle tests run against a disposable package, never the user's registry.
  const pkg = path.join(temp, 'package with spaces'); fs.mkdirSync(pkg);
  for (const name of ['setup', 'skills', 'evals', 'shared', 'hosts', 'package.json', 'skill-registry.json', 'VERSION']) {
    fs.cpSync(path.join(api.ROOT, name), path.join(pkg, name), { recursive: true });
  }
  const lifecycleCLI = path.join(pkg, 'setup/cli.js');
  const lifecycle = await import(pathToFileURL(lifecycleCLI));
  const evaluator = await import(pathToFileURL(path.join(pkg, 'setup/eval.js')));
  const session = await import(pathToFileURL(path.join(pkg, 'setup/session.js')));
  function manage(args, code = 0) {
    const r = spawnSync(process.execPath, [lifecycleCLI, ...args], { cwd: temp, env, encoding: 'utf8' });
    assert.equal(r.status, code, JSON.stringify({ args, stdout: r.stdout, stderr: r.stderr }));
    return r.stdout;
  }
  const evaluationRoot = path.join(temp, '.test-work');
  manage(['skills', 'list']);
  manage(['skills', 'sync', '--dry-run']);
  manage(['skills', 'status', 'i-have-adhd', '--set', 'testing']);
  manage(['skills', 'status', 'i-have-adhd', '--set', 'verified'], 1);
  manage(['eval', 'run', 'i-have-adhd', '--host', 'codex', '--model', 'test-model', '--allow-unmetered', '--dry-run']);
  manage(['eval', 'run', 'i-have-adhd', '--host', 'codex', '--model', 'test-model', '--dry-run'], 1);
  manage(['eval', 'run', 'verify-plan', '--host', 'claude', '--model', 'test-model', '--dry-run'], 1);
  manage(['eval', 'run', 'i-have-adhd', '--host', 'claude', '--model', 'test-model', '--trials', '0', '--dry-run'], 1);
  assert(!fs.existsSync(evaluationRoot), 'Read/status/dry-run commands must not create .test-work');
  const target = path.join(temp, 'activation project $ & space');
  manage(['--project', target, '--host', 'both']);
  const foreign = { type: 'command', command: 'echo foreign' };
  const settingsPath = path.join(target, '.claude/settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify({ permissions: { deny: ['Bash(rm:*)'] }, hooks: { SessionStart: [{ hooks: [foreign] }] } }));
  const activationBefore = snapshot(target);
  manage(['skills', 'enable', 'verify-plan', '--host', 'codex', '--mode', 'manual', '--project', target], 1);
  assert.deepEqual(snapshot(target), activationBefore);
  manage(['skills', 'enable', 'i-have-adhd', '--host', 'claude', '--mode', 'always', '--experimental', '--project', target, '--dry-run']);
  assert.deepEqual(snapshot(target), activationBefore);
  manage(['skills', 'enable', 'i-have-adhd', '--host', 'claude', '--mode', 'always', '--project', target], 1);
  for (const host of ['codex', 'claude']) {
    manage(['skills', 'enable', 'i-have-adhd', '--host', host, '--mode', 'always', '--experimental', '--project', target]);
    manage(['skills', 'enable', 'i-have-adhd', '--host', host, '--mode', 'always', '--experimental', '--project', target]);
    assert.match(session.loadSession(target, host), /i-have-adhd/);
    const activation = JSON.parse(fs.readFileSync(path.join(target, '.zzzystack/activation.json')));
    const hookCommand = activation.hosts[host].hookCommand;
    const payload = hookCommand.match(/^node -e "(.*)"$/)[1];
    const hooked = spawnSync(process.execPath, ['-e', payload], { encoding: 'utf8', cwd: temp });
    assert.equal(hooked.status, 0, hooked.stderr);
    assert.equal(JSON.parse(hooked.stdout).hookSpecificOutput.hookEventName, 'SessionStart');
    assert.match(JSON.parse(hooked.stdout).hookSpecificOutput.additionalContext, /i-have-adhd/);
  }
  const hookedSettings = JSON.parse(fs.readFileSync(settingsPath));
  assert.deepEqual(hookedSettings.permissions, { deny: ['Bash(rm:*)'] });
  assert.equal(hookedSettings.hooks.SessionStart.length, 2, 'No duplicate hook on repeated enable');
  assert.deepEqual(hookedSettings.hooks.SessionStart[0].hooks, [foreign]);
  const changed = path.join(target, '.agents/skills/i-have-adhd/SKILL.md');
  fs.appendFileSync(changed, '\nmodified');
  const warnings = [];
  assert.equal(session.loadSession(target, 'codex', { warn: x => warnings.push(x) }), '');
  assert.equal(warnings.length, 1);
  manage(['skills', 'enable', 'i-have-adhd', '--host', 'codex', '--mode', 'manual', '--project', target], 1);
  manage(['skills', 'disable', 'i-have-adhd', '--host', 'codex', '--project', target]);
  manage(['skills', 'disable', 'i-have-adhd', '--host', 'claude', '--project', target]);
  assert.equal(session.loadSession(target, 'claude'), '');
  assert.deepEqual(JSON.parse(fs.readFileSync(settingsPath)).hooks.SessionStart, [{ hooks: [foreign] }]);
  assert(!fs.existsSync(evaluationRoot), 'Activation must not create .test-work');

  const cases = [{ id: 'fixture', prompt: 'Read input.txt and write output.txt.', criteria: ['Writes the requested file.'], fixtures: { 'input.txt': 'input' }, checks: [{ type: 'file-includes', path: 'output.txt', value: 'done' }, { type: 'file-unchanged', path: 'input.txt' }] }];
  const requests = [];
  const grade = { correctness: 5, actionability: 5, safety: 5, clarity: 5, blocker: false, notes: 'Fixture grade, not a real model evaluation.' };
  const fake = async request => {
    requests.push(request);
    return { response: request.prompt.startsWith('Grade two') ? JSON.stringify({ A: grade, B: grade }) : 'done', usage: { input_tokens: 10, output_tokens: 2 }, cost: 0.01, artifacts: request.prompt.startsWith('Grade two') ? {} : { 'input.txt': 'input', 'output.txt': 'done' } };
  };
  const options = { root: temp, name: 'i-have-adhd', cases, ...lifecycle.skillSnapshot('i-have-adhd'), host: 'claude', model: 'test-model', trials: 3 };
  const evaluated = await evaluator.runEvaluation(options, fake);
  assert.equal(evaluated.status, 'completed'); assert.equal(evaluated.summary.passed, true);
  assert.equal(requests.length, 9); assert.equal(evaluated.provenance, 'test');
  assert.equal(requests.filter(r => r.prompt.includes('<skill>')).length, 3);
  assert(requests.filter(r => r.prompt.startsWith('Grade two')).every(r => !r.prompt.includes('"candidate"') && !r.prompt.includes('"baseline"')));
  assert.equal(evaluator.readResult(temp, evaluated.id).summary.passed, true);
  manage(['eval', 'report', 'i-have-adhd', '--run', evaluated.id]);
  manage(['skills', 'verify', 'i-have-adhd', '--run', evaluated.id, '--session-evidence', 'mock'], 1);
  const failure = await evaluator.runEvaluation(options, async () => { throw new Error('simulated provider failure'); });
  assert.equal(failure.status, 'failed'); assert.equal(failure.summary.passed, false);
  assert.equal(evaluator.readResult(temp, failure.id).status, 'failed');
  const malformed = await evaluator.runEvaluation(options, async req => req.prompt.startsWith('Grade two') ? { response: '{}', cost: 0.01 } : fake(req));
  assert.equal(malformed.status, 'failed');
  const blockedGrade = { ...grade, blocker: true };
  const blocked = await evaluator.runEvaluation(options, async req => req.prompt.startsWith('Grade two') ? { response: JSON.stringify({ A: blockedGrade, B: blockedGrade }), cost: 0.01 } : fake(req));
  assert.equal(blocked.summary.passed, false);
  const budgeted = await evaluator.runEvaluation({ ...options, budget: 0.01 }, fake);
  assert.equal(budgeted.status, 'failed'); assert.match(budgeted.error, /budget/);
  assert.throws(() => evaluator.validateCases([{ ...cases[0], fixtures: { '../escape': 'x' } }]));
  assert.throws(() => evaluator.validateCases([{ ...cases[0], fixtures: { 'AGENTS.md': 'leak' } }]));
  assert.throws(() => evaluator.parseGrades(JSON.stringify({ A: { ...grade, correctness: 6 }, B: grade })));
  assert.throws(() => evaluator.readResult(temp, '../escape'));
  const nativeArgs = evaluator.runnerArgs('codex', 'fixed-model', 'medium', temp, 1, false);
  assert(nativeArgs.includes('--ignore-user-config') && nativeArgs.includes('--ephemeral') && nativeArgs.includes('skip_host_skill_discovery'));
  assert(!nativeArgs.some(a => a.includes('bypass')));

  // Successful lifecycle gate with explicitly synthetic data in a disposable package.
  const registryPath = path.join(pkg, 'skill-registry.json');
  const reg = JSON.parse(fs.readFileSync(registryPath));
  reg.skills['i-have-adhd'].cases = cases;
  fs.writeFileSync(registryPath, JSON.stringify(reg));
  evaluated.provenance = 'cli';
  evaluated.harnessHash = session.sha256(fs.readFileSync(path.join(pkg, 'setup/eval.js')));
  fs.writeFileSync(path.join(temp, '.test-work/evals', evaluated.id, 'result.json'), JSON.stringify(evaluated));
  manage(['skills', 'verify', 'i-have-adhd', '--run', evaluated.id], 1);
  manage(['skills', 'verify', 'i-have-adhd', '--run', evaluated.id, '--session-evidence', 'Synthetic test fixture; never production evidence.']);
  assert.equal(lifecycle.readRegistry().skills['i-have-adhd'].status, 'verified');
  fs.appendFileSync(path.join(pkg, 'skills/i-have-adhd/SKILL.md'), '\nChanged source');
  assert.equal(lifecycle.currentStatus(lifecycle.readRegistry().skills['i-have-adhd'], lifecycle.skillSnapshot('i-have-adhd')).status, 'development');
  manage(['skills', 'verify', 'i-have-adhd', '--run', evaluated.id, '--session-evidence', 'stale'], 1);
  manage(['skills', 'sync']);
  assert.equal(lifecycle.readRegistry().skills['i-have-adhd'].status, 'development');
  assert(lifecycle.readRegistry().skills['i-have-adhd'].history.some(e => e.status === 'verified'));
  const planBefore = lifecycle.skillSnapshot('verify-plan');
  fs.appendFileSync(path.join(pkg, 'shared/core.md'), '\nChanged shared policy');
  assert.notEqual(lifecycle.skillSnapshot('verify-plan').fingerprint, planBefore.fingerprint);
  assert.equal(lifecycle.currentStatus(lifecycle.readRegistry().skills['verify-plan'], lifecycle.skillSnapshot('verify-plan')).stale, true);
  console.log('PASS: skill states, paired evaluation, grading, budget/failures, source invalidation, hook execution, activation and foreign-setting preservation.');
  console.log('PASS: user/project scopes, host isolation, removed-command rejection, record preservation, legacy CLI alias, conflicts, paths and build.');
} finally {
  // temp is an OS-created, unique test directory; never delete the real user home.
  fs.rmSync(temp, { recursive: true, force: true });
}
