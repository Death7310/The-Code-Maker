const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const P = require('../js/practice/engine.js');
require('../js/practice/gens-foundations.js');
require('../js/practice/gens-advanced.js');
const MAP = require('../js/practice/map.js');
const { Shell } = require('../js/shell.js');
const contentDir = path.join(__dirname, '..', 'js', 'content');
for (const f of fs.readdirSync(contentDir)) require(path.join(contentDir, f));
const { tracks } = require('../js/curriculum.js');

const ids = Object.keys(P.GENS);

for (const id of ids) {
  test(`generator ${id}: 300 well-formed, self-consistent, varied instances`, () => {
    const r = P.rngFrom(id.length * 7919 + 13);
    const prompts = new Set();
    for (let i = 0; i < 300; i++) {
      const it = P.make(id, r);
      assert.ok(it.prompt && it.solution, 'prompt + solution');
      prompts.add(it.prompt + '|' + (it.options || []).join('/') + '|' + (it.shell ? JSON.stringify(it.shell.files).length + JSON.stringify(it.shell.files).slice(-80) : ''));
      if (it.kind === 'choice') {
        assert.ok(it.options.length >= 2, 'options');
        assert.strictEqual(new Set(it.options).size, it.options.length, `duplicate options: ${it.options}`);
        assert.ok(it.answer >= 0 && it.answer < it.options.length);
        assert.ok(P.check(it, it.answer));
        assert.ok(!P.check(it, (it.answer + 1) % it.options.length), 'a wrong option must fail');
      } else {
        assert.ok(it.accept.length && it.accept.every((a) => a !== ''), 'accept');
        assert.ok(P.check(it, it.accept[0]));
        assert.ok(!P.check(it, 'definitely-wrong-answer'));
        assert.ok(it.accept.some((a) => it.solution.toLowerCase().includes(a.toLowerCase())) || /\$[\d,]+/.test(it.solution), `solution should show the answer: ${it.solution} / ${it.accept}`);
      }
      if (it.shell) {
        assert.ok(it.solve, 'shell items need a reference command');
        const out = new Shell(it.shell).run(it.solve).out;
        assert.ok(it.accept.some((a) => out.includes(a)), `${id}: "${it.solve}" → ${JSON.stringify(out)} expected ${it.accept[0]}`);
      }
    }
    assert.ok(prompts.size >= Math.min(4, 300), `${id} produced only ${prompts.size} distinct prompts`);
  });
}

test('binary practice never reuses the lesson example values', () => {
  const r = P.rngFrom(99);
  for (let i = 0; i < 2000; i++) {
    for (const id of ['bin.toDec', 'bin.toBin']) {
      const it = P.make(id, r);
      assert.doesNotMatch(it.prompt, /\b(00001010|11111111|00000101)\b|\b(10|255|5) to an 8-bit/);
    }
  }
});

test('lesson map references real lessons and generators', () => {
  const lessonIds = new Set(tracks.flatMap((t) => t.lessons.map((l) => l.id)));
  for (const [lid, cfg] of Object.entries(MAP)) {
    assert.ok(lessonIds.has(lid), 'unknown lesson ' + lid);
    assert.ok(cfg.gens.length && cfg.gens.every((g) => P.GENS[g]), lid + ' gens');
    assert.ok(cfg.need >= 3, lid + ' need');
    if (cfg.explain) assert.ok(cfg.explain.prompt && cfg.explain.points.length >= 2, lid + ' explain');
  }
});

test('mastery session: streak, hints do not count, wrong answers reset', () => {
  const s = new P.Session(['bin.toDec', 'bin.toBin'], 3, P.rngFrom(5));
  const right = () => { const it = s.next(); return s.answer(it.kind === 'choice' ? it.answer : it.accept[0]); };
  assert.strictEqual(right().mastered, false);
  assert.strictEqual(right().mastered, false);
  s.next(); assert.strictEqual(s.answer('nope').correct, false);
  assert.strictEqual(s.streak, 0);
  s.next(); s.useHint(); const h = s.answer(s.current.accept[0]);
  assert.ok(h.correct && !h.counted && s.streak === 0, 'hinted answer is correct but not counted');
  right(); right();
  assert.strictEqual(right().mastered, true);
});

test('consecutive items do not repeat the same prompt', () => {
  const s = new P.Session(['aws.sgnacl'], 3, P.rngFrom(1));
  let prev = s.next().prompt;
  for (let i = 0; i < 50; i++) { const p = s.next().prompt; assert.notStrictEqual(p, prev); prev = p; }
});
