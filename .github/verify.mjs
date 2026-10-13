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
  run(['--dry-run']); assert(!fs.existsSync(home));
  assert.match(run(['--host', 'codex']), /Scope: user/);
  assert(fs.existsSync(path.join(home, '.agents/skills/onboard/SKILL.md')));
  assert(!fs.existsSync(path.join(home, '.claude')));
  assert.match(run(['--host', 'codex']), /Changed 0 files/);
  run([]); assert(fs.existsSync(path.join(home, '.claude/skills/onboard/SKILL.md')));
  // Plan's grouped sources must remain directly discoverable by both hosts.
  for (const location of Object.values(api.HOSTS)) {
    const installed = path.join(home, location);
    for (const skill of ['office-hours', 'plan-ceo-review', 'plan-design-review', 'plan-eng-review']) {
      assert(fs.existsSync(path.join(installed, skill, 'SKILL.md')));
      assert(!fs.existsSync(path.join(installed, 'plan', skill)));
    }
    assert(fs.existsSync(path.join(installed, 'plan/references/web-planner.md')));
  }
  const userBefore = snapshot(home);
  for (const host of ['codex', 'claude', 'both']) {
    const project = `${host} project`, target = path.join(temp, project);
    const args = ['--project', project, '--host', host];
    run([...args, '--dry-run']); assert(!fs.existsSync(target));
    assert.match(run(args), /Scope: project/);
    assert.equal(fs.existsSync(path.join(target, '.agents/skills')), host !== 'claude');
    assert.equal(fs.existsSync(path.join(target, '.claude/skills')), host !== 'codex');
    assert.match(run(args), /Changed 0 files/);
    assert.deepEqual(snapshot(home), userBefore);
    run(['init', '--project', project, '--name', '한글 project', '--dry-run']);
    assert(!fs.existsSync(path.join(target, '.zzzystack')));
    run(['init', '--project', project, '--name', '한글 project']);
    run(['check-project', '--project', project]);
    const before = snapshot(target);
    run(['init', '--project', project, '--name', 'overwrite'], 1);
    for (const pack of ['progress', 'report', 'resume']) run(['automation', pack, '--project', project]);
    assert.deepEqual(snapshot(target), before);
    const location = host === 'claude' ? '.claude/skills' : '.agents/skills';
    fs.writeFileSync(path.join(target, location, 'plan/SKILL.md'), 'user edit');
    const edited = snapshot(target); run(args, 1); assert.deepEqual(snapshot(target), edited);
  }
  run(['install', '--target', 'legacy alias', '--host', 'codex']);
  assert(fs.existsSync(path.join(temp, 'legacy alias/.agents/skills')));
  for (const args of [['--host', 'bad'], ['--project', ''], ['--user', '--project', '.'], ['init', '--name', 'missing path'], ['--unknown']]) {
    const before = snapshot(temp); run(args, 2); assert.deepEqual(snapshot(temp), before);
  }
  // A second-host conflict must prevent writes to the first host.
  const conflict = path.join(temp, 'conflict/.claude/skills/plan');
  fs.mkdirSync(conflict, { recursive: true }); fs.writeFileSync(path.join(conflict, 'SKILL.md'), 'unowned');
  const before = snapshot(temp); run(['--project', 'conflict'], 1); assert.deepEqual(snapshot(temp), before);
  // Reject traversal and junction destinations before mutation.
  assert.throws(() => api.safePath(temp, '../outside'));
  const outside = path.join(temp, 'outside'), linked = path.join(temp, 'linked');
  fs.mkdirSync(outside); fs.mkdirSync(linked);
  fs.symlinkSync(outside, path.join(linked, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  run(['--project', 'linked', '--host', 'codex'], 1);
  assert.deepEqual(snapshot(outside), {});
  const config = JSON.parse(fs.readFileSync(path.join(api.ROOT, api.PROJECT_CONFIG), 'utf8'));
  for (const budget of [true, -1, Infinity, NaN]) {
    const invalid = structuredClone(config); invalid.limits.budget = budget;
    assert.throws(() => api.validateConfig(invalid));
  }
  run(['build']); assert.match(run(['build']), /0 files changed/);
  console.log('PASS: user/project scopes, host isolation, init, legacy CLI alias, conflicts, paths, config, prompts and build.');
} finally {
  // temp is an OS-created, unique test directory; never delete the real user home.
  fs.rmSync(temp, { recursive: true, force: true });
}
