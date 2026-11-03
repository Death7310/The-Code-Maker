// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const { Shell } = require('../js/shell.js');

const sh = () => new Shell();

test('pwd and cd', () => {
  const s = sh();
  assert.strictEqual(s.run('pwd').out, '/home/student\n');
  s.run('cd logs');
  assert.strictEqual(s.run('pwd').out, '/home/student/logs\n');
  s.run('cd ..');
  assert.strictEqual(s.run('pwd').out, '/home/student\n');
  assert.strictEqual(s.run('cd nope').code, 1);
});

test('ls lists files and dirs', () => {
  assert.strictEqual(sh().run('ls').out, 'inventory.csv  logs/  notes.txt  scope.txt\n');
});

test('grep with pipe and wc', () => {
  assert.strictEqual(sh().run('grep Failed logs/auth.log | wc -l').out, '4\n');
  assert.strictEqual(sh().run('grep -c Accepted logs/auth.log').out, '3\n');
  assert.strictEqual(sh().run('grep -i FAILED logs/auth.log | grep -v root | wc -l').out, '3\n');
});

test('cut, sort, uniq -c', () => {
  const out = sh().run('grep Failed logs/auth.log | cut -d " " -f 9 | sort | uniq -c').out;
  assert.strictEqual(out, '      2 bob\n      1 dave\n      1 root\n');
});

test('variables and quoting', () => {
  const s = sh();
  s.run('NAME=Ash');
  assert.strictEqual(s.run('echo "hello $NAME"').out, 'hello Ash\n');
  assert.strictEqual(s.run("echo 'hello $NAME'").out, 'hello $NAME\n');
  assert.strictEqual(s.run('echo ${NAME}s').out, 'Ashs\n');
});

test('redirection and append', () => {
  const s = sh();
  s.run('echo one > /tmp/a.txt');
  s.run('echo two >> /tmp/a.txt');
  assert.strictEqual(s.run('cat /tmp/a.txt').out, 'one\ntwo\n');
  assert.strictEqual(s.run('echo x > /nope/a.txt').code, 1);
});

test('for loop', () => {
  assert.strictEqual(sh().run('for h in web01 db01; do echo host: $h; done').out, 'host: web01\nhost: db01\n');
});

test('&& short-circuits on failure', () => {
  assert.strictEqual(sh().run('cd nope && echo reached').out.includes('reached'), false);
  assert.strictEqual(sh().run('cd logs && echo reached').out, 'reached\n');
});

test('head, tail, tr', () => {
  assert.strictEqual(sh().run('head -n 1 inventory.csv').out, 'hostname,ip,os,owner\n');
  assert.strictEqual(sh().run('tail -n 1 inventory.csv').out, 'printer,10.0.5.50,embedded,facilities\n');
  assert.strictEqual(sh().run('echo abc | tr a-z A-Z').out, 'ABC\n');
});

test('unknown command', () => {
  assert.strictEqual(sh().run('frobnicate').code, 127);
});
