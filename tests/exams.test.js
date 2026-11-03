const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const contentDir = path.join(__dirname, '..', 'js', 'content');
for (const f of fs.readdirSync(contentDir)) require(path.join(contentDir, f));
const { tracks } = require('../js/curriculum.js');
const X = require('../js/exams.js');

let seed = 1;
const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

for (const exam of X.EXAMS) {
  test(`${exam.id}: domains, mapping and pool are valid`, () => {
    const t = tracks.find((x) => x.id === exam.track);
    assert.ok(t, 'track exists');
    const weights = Object.values(exam.domains).reduce((a, d) => a + d[1], 0);
    assert.strictEqual(weights, 100, 'domain weights sum to 100');
    for (const l of t.lessons) assert.ok(exam.lessonDomain[l.id], `lesson ${l.id} has no domain mapping`);
    for (const k of Object.values(exam.lessonDomain)) assert.ok(exam.domains[k], 'unknown domain ' + k);
    const pool = X.pool(exam, tracks);
    assert.ok(pool.length >= exam.length, `pool ${pool.length} < exam length ${exam.length}`);
    for (const q of pool) {
      assert.ok(exam.domains[q.d], q.id + ' domain');
      if (q.type === 'input') assert.ok(q.accept.length);
      else assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
      assert.ok(q.explain, q.id + ' explain');
    }
    // Every domain should have at least one question.
    for (const k of Object.keys(exam.domains)) assert.ok(pool.some((q) => q.d === k), `no questions for domain ${k}`);
  });

  test(`${exam.id}: build shuffles options but keeps answers correct`, () => {
    const pool = X.pool(exam, tracks);
    const built = X.build(exam, tracks, random);
    assert.strictEqual(built.length, exam.length);
    for (const q of built) {
      const orig = pool.find((p) => p.id === q.id);
      if (q.type === 'input') continue;
      assert.strictEqual(q.options[q.answer], orig.options[orig.answer]);
    }
    const perfect = X.grade(exam, built, built.map((q) => (q.type === 'input' ? q.accept[0] : q.answer)));
    assert.strictEqual(perfect.pct, 100);
    const none = X.grade(exam, built, []);
    assert.strictEqual(none.correct, 0);
    const totals = Object.values(perfect.byDomain).reduce((a, d) => a + d.total, 0);
    assert.strictEqual(totals, built.length);
  });
}

test('every domain is sampled in every built exam', () => {
  for (const exam of X.EXAMS) {
    for (let k = 0; k < 50; k++) {
      const built = X.build(exam, tracks, random);
      assert.strictEqual(built.length, exam.length);
      assert.strictEqual(new Set(built.map((q) => q.id)).size, built.length, 'no duplicates');
      for (const d of Object.keys(exam.domains)) assert.ok(built.some((q) => q.d === d), `${exam.id} missing ${d}`);
    }
  }
});
