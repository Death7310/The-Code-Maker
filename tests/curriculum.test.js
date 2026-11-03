// Verifies every shell exercise is solvable in the sandbox, and quiz data is well-formed.
const test = require('node:test');
const assert = require('node:assert');
const { Shell } = require('../js/shell.js');
const { tracks } = require('../js/curriculum.js');

// Reference solutions, keyed by lesson id.
const SOLUTIONS = {
  b1: 'cd logs && pwd',
  b2: 'head -n 1 inventory.csv',
  b3: 'grep -c Accepted logs/auth.log',
  b4: 'grep Failed logs/auth.log | grep -v root | wc -l',
  b5: 'HOST=db01; echo "checking $HOST"',
  b6: 'for x in alpha beta; do echo "item: $x"; done',
};

for (const t of tracks) {
  for (const l of t.lessons) {
    const ex = l.exercise;
    if (ex.type === 'shell') {
      test(`shell exercise ${l.id} is solvable`, () => {
        assert.ok(SOLUTIONS[l.id], 'missing reference solution');
        assert.strictEqual(new Shell().run(SOLUTIONS[l.id]).out, ex.expect);
      });
    }
    if (ex.type === 'quiz') {
      test(`quiz ${l.id} is well-formed`, () => {
        assert.ok(ex.answer >= 0 && ex.answer < ex.options.length);
        assert.ok(ex.explain);
      });
    }
    if (ex.type === 'python') {
      test(`python exercise ${l.id} has starter + expect`, () => {
        assert.ok(ex.starter && ex.expect);
      });
    }
  }
}
