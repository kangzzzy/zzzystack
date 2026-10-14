// Standalone SessionStart hook. Uses installed files, never imports the setup CLI.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const sha256 = data => createHash('sha256').update(data).digest('hex');
export function localPath(root, relative) {
  if (!relative || relative.includes('\\') || relative.includes(':') || path.posix.isAbsolute(relative) || relative.split('/').includes('..')) throw new Error(`Invalid relative path: ${relative}`);
  const result = path.resolve(root, relative);
  for (let p = result; ; p = path.dirname(p)) {
    try { if (fs.lstatSync(p).isSymbolicLink()) throw new Error(`Symlink/junction refused: ${p}`); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (path.dirname(p) === p) break;
  }
  return result;
}

export function loadSession(scope, host, { warn = message => console.error(message) } = {}) {
  if (!['codex', 'claude'].includes(host)) throw new Error('Choose host codex or claude');
  const configPath = localPath(scope, '.zzzystack/activation.json');
  if (!fs.existsSync(configPath)) return '';
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (config.schemaVersion !== 1 || !config.hosts || typeof config.hosts !== 'object') throw new Error('Invalid activation.json');
  const root = localPath(scope, host === 'codex' ? '.agents/skills' : '.claude/skills');
  const sections = [];
  for (const [name, entry] of Object.entries(config.hosts[host]?.skills ?? {})) {
    if (entry.mode !== 'always') continue;
    try {
      if (!/^[a-z0-9-]+$/.test(name) || !entry.files || !Object.keys(entry.files).length || !entry.files[`${name}/SKILL.md`]) throw new Error('Invalid activation entry');
      for (const [relative, hash] of Object.entries(entry.files)) {
        if (sha256(fs.readFileSync(localPath(root, relative))) !== hash) throw new Error(`Installed resource changed: ${relative}. Re-evaluate and enable again.`);
      }
      const file = localPath(root, `${name}/SKILL.md`);
      const body = fs.readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
      sections.push(`Skill: ${name}\nResource directory: ${path.dirname(file)}\n${body}`);
    } catch (e) { warn(`zzzystack: skipped ${name}: ${e.message}`); }
  }
  return sections.length ? 'Apply these user-selected skills to this session. Explicit user requests take precedence. Resolve relative references from each resource directory.\n\n' + sections.join('\n\n') : '';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { scope: { type: 'string' }, host: { type: 'string' } } });
    if (!values.scope) throw new Error('--scope is required');
    const context = loadSession(values.scope, values.host);
    if (context) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context } }));
  } catch (e) { console.error(`zzzystack session: ${e.message}`); }
  // A broken optional style/skill must not prevent starting the host.
}
