// Verifies the curriculum data: every exercise is well-formed and every
// shell exercise is actually solvable in the sandbox.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { Shell } = require('../js/shell.js');

// Load content files the same way the browser does (they register on globalThis.CM).
const contentDir = path.join(__dirname, '..', 'js', 'content');
for (const f of fs.readdirSync(contentDir)) require(path.join(contentDir, f));
const { tracks, path: order, coding, roadmap } = require('../js/curriculum.js');

const SOLUTIONS = {
  z5: 'ls logs',
  z7: 'whoami',
  b1: 'cd logs && pwd',
  b2: 'head -n 1 inventory.csv',
  b3: 'grep -c Accepted logs/auth.log',
  b4: 'grep Failed logs/auth.log | grep -v root | wc -l',
  b5: 'HOST=db01; echo "checking $HOST"',
  b6: 'for x in alpha beta; do echo "item: $x"; done',
};

test('every track in the path and coding list exists', () => {
  const ids = tracks.map((t) => t.id);
  for (const id of order.concat(coding.map((c) => c.id))) assert.ok(ids.includes(id), id);
  for (const s of roadmap) assert.ok(ids.includes(s.track), s.track);
});

test('lesson ids are unique across all tracks', () => {
  const seen = new Set();
  for (const t of tracks) for (const l of t.lessons) {
    assert.ok(!seen.has(l.id), 'duplicate id ' + l.id);
    seen.add(l.id);
  }
});

function checkQuestion(q, where) {
  if (q.type === 'input') {
    assert.ok(Array.isArray(q.accept) && q.accept.length, where + ' needs accept[]');
  } else {
    assert.ok(Array.isArray(q.options) && q.options.length >= 2, where + ' needs options');
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, where + ' answer out of range');
  }
  assert.ok(q.question && q.explain, where + ' needs question + explain');
}

for (const t of tracks) {
  for (const l of t.lessons) {
    const ex = l.exercise;
    test(`${t.id}/${l.id} exercise is valid`, () => {
      assert.ok(l.title && l.body, 'title/body');
      if (ex.type === 'shell') {
        assert.ok(SOLUTIONS[l.id], 'missing reference solution');
        assert.strictEqual(new Shell().run(SOLUTIONS[l.id]).out, ex.expect);
      } else if (ex.type === 'python') {
        assert.ok(ex.starter && ex.expect);
      } else {
        checkQuestion(ex, l.id);
      }
      (l.review || []).forEach((r, i) => checkQuestion(Object.assign({ type: 'quiz' }, r), `${l.id} review ${i}`));
    });
  }
}
