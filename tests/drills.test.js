const test = require('node:test');
const assert = require('node:assert');
const D = require('../js/drills.js');

// Small deterministic PRNG (mulberry32) so generator tests are repeatable.
function prng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('subnet math on known examples', () => {
  assert.deepStrictEqual(D.subnet('192.168.1.70', 26), {
    mask: '255.255.255.192', network: '192.168.1.64', broadcast: '192.168.1.127',
    first: '192.168.1.65', last: '192.168.1.126', size: 64, usable: 62,
  });
  const s = D.subnet('172.16.5.200', 20);
  assert.strictEqual(s.mask, '255.255.240.0');
  assert.strictEqual(s.network, '172.16.0.0');
  assert.strictEqual(s.broadcast, '172.16.15.255');
  assert.strictEqual(D.subnet('10.0.0.130', 25).network, '10.0.0.128');
  assert.strictEqual(D.subnet('10.1.2.3', 30).usable, 2);
});

test('int/ip round trip', () => {
  for (const ip of ['0.0.0.0', '10.20.30.40', '255.255.255.255', '192.168.0.1']) {
    assert.strictEqual(D.toIp(D.toInt(ip)), ip);
  }
});

test('every generated subnet problem is self-consistent', () => {
  const r = prng(42);
  for (let i = 0; i < 2000; i++) {
    for (const kind of D.SUBNET_KINDS) {
      const p = D.subnetProblem(r, kind);
      assert.ok(p.question && p.explain && p.accept.length, kind);
      assert.ok(D.check(p, p.accept[0]));
      // Explanations must state the accepted answer (except yes/no and host counts phrased as numbers).
      if (!['same'].includes(kind)) assert.ok(p.explain.includes(p.accept[0]), `${kind}: ${p.explain} vs ${p.accept[0]}`);
    }
  }
});

test('same-subnet problems produce both yes and no', () => {
  const r = prng(7);
  const answers = new Set();
  for (let i = 0; i < 200; i++) answers.add(D.subnetProblem(r, 'same').accept[0]);
  assert.deepStrictEqual([...answers].sort(), ['no', 'yes']);
});

test('binary and port problems', () => {
  const r = prng(3);
  for (let i = 0; i < 500; i++) {
    const b = D.binaryProblem(r);
    if (b.kind === 'bin2dec') assert.strictEqual(parseInt(b.question.match(/[01]{8}/)[0], 2), Number(b.accept[0]));
    else assert.strictEqual(parseInt(b.accept[0], 2), Number(b.question.match(/Convert (\d+)/)[1]));
    const p = D.portProblem(r);
    assert.ok(D.check(p, p.accept[0]));
  }
  assert.ok(D.check({ accept: ['SSH'] }, ' ssh '));
});
