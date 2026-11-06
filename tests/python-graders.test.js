// Runs each Python exercise's hidden randomized tests with real CPython:
// the reference solution must pass on many seeds, and the unfinished starter must not.
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
require('../js/content/python.js');
const track = globalThis.CM.tracks.python;

let python = null;
try { execFileSync('python3', ['--version']); python = 'python3'; } catch (e) { /* no python available */ }

function run(code) {
  try { return execFileSync(python, ['-I', '-c', code], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { return (e.stdout || '') + (e.stderr || ''); }
}

for (const l of track.lessons) {
  const ex = l.exercise;
  if (!ex.tests) continue;
  test(`python ${l.id}: reference passes on random seeds; starter fails`, { skip: !python && 'python3 not installed' }, () => {
    for (let seed = 1; seed <= 15; seed++) {
      const out = run(ex.reference + '\n' + ex.tests.replace('__SEED__', String(seed * 7919)));
      assert.match(out, /ALL TESTS PASSED/, `${l.id} seed ${seed}: ${out}`);
    }
    const starterOut = run(ex.starter + '\n' + ex.tests.replace('__SEED__', '42'));
    assert.doesNotMatch(starterOut, /ALL TESTS PASSED/, `${l.id}: the unfinished starter must not pass`);
    // A hard-coded answer to the visible example must not pass either.
    assert.ok(ex.tests.includes('__SEED__'), 'tests are seeded per run');
  });
}
