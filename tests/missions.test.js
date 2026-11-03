// Every mission question with a reference `solve` command must produce
// output containing an accepted answer when run against that mission's files.
const test = require('node:test');
const assert = require('node:assert');
const { Shell } = require('../js/shell.js');
const M = require('../js/missions.js');
const fs = require('node:fs');
const path = require('node:path');
const contentDir = path.join(__dirname, '..', 'js', 'content');
for (const f of fs.readdirSync(contentDir)) require(path.join(contentDir, f));
const { tracks } = require('../js/curriculum.js');

const ids = new Set();
for (const m of M.missions) {
  test(`mission ${m.id} (${m.title}) is well-formed and solvable`, () => {
    assert.ok(!ids.has(m.id)); ids.add(m.id);
    assert.ok(tracks.some((t) => t.id === m.requires), 'requires unknown track ' + m.requires);
    assert.ok(['Guided', 'Supported', 'Independent'].includes(m.level));
    assert.ok(m.debrief.length && m.briefing && m.adversary);
    for (const [i, s] of m.steps.entries()) {
      const where = `${m.id} step ${i}`;
      if (s.type === 'question') {
        const q = s.q;
        if (q.type === 'input') assert.ok(q.accept.length, where);
        else assert.ok(q.answer >= 0 && q.answer < q.options.length, where);
        assert.ok(q.explain, where + ' explain');
        if (s.solve) {
          const out = new Shell({ files: M.shellFiles(m) }).run(s.solve);
          assert.strictEqual(out.code === 127, false, where + ' unknown command');
          if (q.type === 'input') {
            const low = out.out.toLowerCase();
            assert.ok(q.accept.some((a) => low.includes(a.toLowerCase())), `${where}: "${s.solve}" → ${JSON.stringify(out.out)}`);
          } else {
            assert.ok(out.out.length > 0, where + ' solve produced no output');
          }
        }
      } else if (s.type === 'decision') {
        assert.ok(s.options.some((o) => o.score === 2), where + ' needs a best option');
        s.options.forEach((o) => assert.ok(o.outcome && [0, 1, 2].includes(o.score), where));
      } else {
        assert.strictEqual(s.type, 'event', where);
        assert.ok(s.text);
      }
    }
  });
}

test('specific evidence counts', () => {
  const m3 = M.missions.find((m) => m.id === 'm3');
  const sh = new Shell({ files: M.shellFiles(m3) });
  assert.strictEqual(sh.run('grep Failed logs/auth.log | grep -c 198.51.100.23').out, '40\n');
  const m5 = M.missions.find((m) => m.id === 'm5');
  const sh5 = new Shell({ files: M.shellFiles(m5) });
  assert.strictEqual(sh5.run('grep " - " aws/s3-access.log | grep -c "GET.OBJECT.* 200"').out, '9\n');
  assert.match(sh5.run('grep " - " aws/s3-access.log | grep " 200" | cut -d " " -f 6 | sort | uniq -c | sort -rn | head -n 1').out, /6 exports\/customers-2026-10\.csv/);
});

test('scoring helpers', () => {
  const m = M.missions[0];
  assert.strictEqual(M.maxScore(m), m.steps.filter((s) => s.type !== 'event').length * 2);
  assert.strictEqual(M.rating(9, 10), 'Excellent');
  assert.strictEqual(M.rating(6, 10), 'Solid');
  assert.strictEqual(M.rating(2, 10), 'Needs another run');
});
