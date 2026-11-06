// Every project: the reference solution passes ALL milestones on many random
// seeds (real CPython), and the untouched starter passes NONE of them.
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const PJ = require('../js/projects/projects.js');

let python = null;
try { execFileSync('python3', ['--version']); python = 'python3'; } catch (e) { /* not installed */ }
const run = (code) => {
  try { return execFileSync(python, ['-I', '-c', code], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { return (e.stdout || '') + (e.stderr || ''); }
};

test('project ids unique and well-formed', () => {
  const ids = new Set();
  for (const p of PJ.projects) {
    assert.ok(!ids.has(p.id)); ids.add(p.id);
    assert.ok(p.title && p.briefing && p.starter && p.reference && p.tests);
    assert.ok(p.milestones.length >= 3 && p.hints.length === p.milestones.length, p.id + ' one hint per milestone');
  }
});

for (const p of PJ.projects) {
  test(`project ${p.id}: reference passes every milestone; starter passes none`, { skip: !python && 'python3 not installed' }, () => {
    for (let seed = 1; seed <= 12; seed++) {
      const res = PJ.parseResults(p, run(PJ.program(p, p.reference, seed * 104729)));
      assert.ok(res.ran, `${p.id} seed ${seed}: harness did not run`);
      for (const m of p.milestones) assert.ok(res.results[m.id].passed, `${p.id} seed ${seed} ${m.id}: ${JSON.stringify(res.results[m.id])}`);
    }
    const st = PJ.parseResults(p, run(PJ.program(p, p.starter, 7)));
    assert.ok(st.ran, `${p.id}: starter must at least run (no syntax errors)`);
    for (const m of p.milestones) assert.ok(!st.results[m.id].passed, `${p.id}: starter should not pass ${m.id}`);
  });
}
