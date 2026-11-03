const test = require('node:test');
const assert = require('node:assert');
const R = require('../js/review.js');

const tracks = [{ title: 'T', lessons: [
  { id: 'x1', title: 'L1', exercise: { type: 'quiz', question: 'q', options: ['a', 'b'], answer: 0 }, review: [{ question: 'r', options: ['a', 'b'], answer: 1 }] },
  { id: 'x2', title: 'L2', exercise: { type: 'shell', task: 't', expect: '' } },
  { id: 'x3', title: 'L3', exercise: { type: 'input', question: 'q', accept: ['443'] } },
] }];

test('collect only includes completed lessons and skips non-question exercises', () => {
  const ids = R.collect(tracks, { x1: true, x2: true }).map((i) => i.id);
  assert.deepStrictEqual(ids, ['x1:ex', 'x1:r0']);
});

test('grading moves boxes and schedules', () => {
  const now = 1000;
  const a = R.grade(undefined, true, now);
  assert.strictEqual(a.box, 1);
  assert.strictEqual(a.due, now + 1 * 86400000);
  const b = R.grade(a, true, now);
  assert.strictEqual(b.box, 2);
  assert.strictEqual(b.due, now + 3 * 86400000);
  const c = R.grade(b, false, now);
  assert.strictEqual(c.box, 1);
  assert.ok(c.due < now + 86400000);
});

test('due filters by time', () => {
  const items = R.collect(tracks, { x1: true, x3: true });
  const state = { 'x1:ex': { box: 2, due: 5000 } };
  assert.deepStrictEqual(R.due(items, state, 1000).map((i) => i.id), ['x1:r0', 'x3:ex']);
  assert.strictEqual(R.due(items, state, 6000).length, 3);
});

test('input answers are normalized', () => {
  assert.ok(R.checkInput({ accept: ['Layer 3'] }, '  layer   3 '));
  assert.ok(!R.checkInput({ accept: ['443'] }, '80'));
});
