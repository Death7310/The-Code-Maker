const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
for (const f of fs.readdirSync(path.join(__dirname, '..', 'js', 'content'))) require(path.join(__dirname, '..', 'js', 'content', f));
const { tracks } = require('../js/curriculum.js');
for (const f of fs.readdirSync(path.join(__dirname, '..', 'js', 'study'))) require(path.join(__dirname, '..', 'js', 'study', f));
const STUDY = globalThis.CM.study;
const lessonIds = new Set(tracks.flatMap((t) => t.lessons.map((l) => l.id)));

for (const [lid, n] of Object.entries(STUDY)) {
  test(`study notes ${lid} are well-formed`, () => {
    assert.ok(lessonIds.has(lid), 'unknown lesson ' + lid);
    assert.ok(n.sections.length >= 2 && n.sections.every((s) => s.h && s.html.length > 100), 'substantial sections');
    for (const c of n.checks || []) {
      assert.ok(c.answer >= 0 && c.answer < c.options.length, 'answer index');
      assert.strictEqual(c.why.length, c.options.length, 'an explanation for every option');
    }
    for (const s of n.sources || []) assert.match(s.url, /^https:\/\//);
  });
}
