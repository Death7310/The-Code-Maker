const test = require('node:test');
const assert = require('node:assert');
const { Shell } = require('../js/shell.js');
const sh = () => new Shell();

test('permissions: shadow is protected, sudo reads it', () => {
  const s = sh();
  assert.match(s.run('cat /etc/shadow').out, /Permission denied/);
  assert.match(s.run('sudo cat /etc/shadow').out, /^root:/);
  assert.strictEqual(s.run('sudo whoami').out, 'root\n');
  assert.strictEqual(s.run('whoami').out, 'student\n', 'sudo does not stick');
  assert.strictEqual(s.run('sudo wc -l /etc/shadow').out, '5\n');
});

test('ls -l shows real modes and owners', () => {
  const out = sh().run('ls -l /etc/shadow').out;
  assert.match(out, /^-rw-r----- root\s+shadow\s+\d+ \/etc\/shadow\n$/);
  assert.match(sh().run('ls -l scripts').out, /-rw-r--r-- student\s+student\s+\d+ check\.sh/);
  assert.match(sh().run('ls /root').out, /Permission denied/);
  assert.match(sh().run('cd /root').out, /Permission denied/);
});

test('chmod octal and symbolic, stat', () => {
  const s = sh();
  s.run('chmod 600 notes.txt');
  assert.strictEqual(s.run('stat -c %a notes.txt').out, '600\n');
  s.run('chmod u+x,g+r notes.txt');
  assert.strictEqual(s.run('stat -c %a notes.txt').out, '740\n');
  s.run('chmod o=r notes.txt');
  assert.strictEqual(s.run('stat -c %A notes.txt').out, '-rwxr-----'.slice(0, 7) + 'r--\n');
  assert.match(s.run('chmod 777 /etc/passwd').out, /Operation not permitted/);
  assert.strictEqual(s.run('sudo chmod 600 /etc/passwd').out, '');
  assert.match(s.run('cat /etc/passwd').out, /Permission denied/);
});

test('chown requires root', () => {
  const s = sh();
  assert.match(s.run('chown root notes.txt').out, /Operation not permitted/);
  s.run('sudo chown root:root notes.txt');
  assert.strictEqual(s.run('stat -c %U:%G notes.txt').out, 'root:root\n');
});

test('writing respects permissions', () => {
  const s = sh();
  assert.match(s.run('echo hi > /etc/motd').out, /Permission denied/);
  assert.strictEqual(s.run('echo hi > /tmp/x.txt').out, '');
  assert.strictEqual(s.run('stat -c %U /tmp/x.txt').out, 'student\n');
  assert.match(s.run('touch /etc/new').out, /Permission denied/);
  assert.match(s.run('rm /etc/hosts').out, /Permission denied/);
});

test('scripts: need +x to run directly, bash works with read only', () => {
  const s = sh();
  assert.match(s.run('./scripts/check.sh').out, /Permission denied/);
  assert.strictEqual(s.run('bash scripts/check.sh').out, 'Health check\nstudent\nDone\n');
  s.run('chmod +x scripts/check.sh');
  assert.strictEqual(s.run('./scripts/check.sh').out, 'Health check\nstudent\nDone\n');
  s.run('chmod +x scripts/greet.sh');
  assert.strictEqual(s.run('cd scripts && ./greet.sh Ash').out, 'Hello, Ash\n');
  assert.strictEqual(s.run('echo "[$1]"').out, '[]\n', 'positional args are restored');
});

test('multi-line for loop with command substitution in a script', () => {
  assert.strictEqual(sh().run('bash scripts/hosts.sh').out, 'in scope: 10.0.5.10\nin scope: 10.0.5.11\nin scope: 10.0.5.12\n');
});

test('command substitution', () => {
  const s = sh();
  assert.strictEqual(s.run('echo "I am $(whoami) on $(hostname)"').out, 'I am student on sandbox\n');
  assert.strictEqual(s.run('echo $(grep -c Failed logs/auth.log) failures').out, '4 failures\n');
});

test('find, cp, mv', () => {
  const s = sh();
  assert.strictEqual(s.run('find . -name "*.sh"').out, './scripts/check.sh\n./scripts/greet.sh\n./scripts/hosts.sh\n');
  assert.strictEqual(s.run('find /var/log -type f').out, '/var/log/auth.log\n/var/log/syslog\n');
  assert.match(s.run('find / -name shadow').out, /\/etc\/shadow/);
  s.run('cp notes.txt /tmp/');
  assert.ok(s.isFile('/tmp/notes.txt'));
  s.run('mv scope.txt targets.txt');
  assert.ok(!s.isFile('/home/student/scope.txt') && s.isFile('/home/student/targets.txt'));
  assert.match(s.run('cp /etc/shadow /tmp/').out, /Permission denied/);
});

test('processes: ps, pgrep, kill with ownership', () => {
  const s = sh();
  assert.match(s.run('ps aux').out, /www-data\s+788/);
  assert.doesNotMatch(s.run('ps').out, /nginx/);
  assert.strictEqual(s.run('pgrep updaterd').out, '4242\n');
  assert.match(s.run('kill 788').out, /Operation not permitted/);
  assert.strictEqual(s.run('kill 4242').out, '');
  assert.strictEqual(s.run('pgrep updaterd').code, 1);
  assert.strictEqual(s.run('sudo kill 788').out, '');
});

test('respawning process comes back with a new PID', () => {
  const s = new Shell({ processes: [{ pid: 900, user: 'student', cpu: 90, mem: 1, cmd: 'miner', respawn: true }] });
  s.run('kill 900');
  assert.strictEqual(s.run('pgrep miner').out, '917\n');
});

test('services and networking', () => {
  const s = sh();
  assert.match(s.run('systemctl status ssh').out, /active \(running\)/);
  assert.match(s.run('systemctl stop ssh').out, /Access denied/);
  s.run('sudo systemctl stop ssh');
  assert.match(s.run('systemctl status ssh').out, /inactive/);
  assert.doesNotMatch(s.run('ss -tuln').out, /:22/);
  assert.match(s.run('ip a').out, /10\.20\.0\.57\/24/);
  assert.match(s.run('ip route').out, /default via 10\.20\.0\.1/);
  assert.match(s.run('ping -c 2 web01').out, /2 received, 0% packet loss/);
  assert.match(s.run('ping -c 1 203.0.113.5').out, /100% packet loss/);
  assert.match(s.run('ping nosuchhost').out, /not known/);
});

test('id, export, env, man, which', () => {
  const s = sh();
  assert.match(s.run('id').out, /27\(sudo\)/);
  s.run('export TARGET=web01');
  assert.strictEqual(s.run('echo $TARGET').out, 'web01\n');
  assert.match(s.run('env').out, /TARGET=web01/);
  assert.match(s.run('man chmod').out, /CHMOD/);
  assert.strictEqual(s.run('which grep').out, '/usr/bin/grep\n');
});

test('tilde expands to home; quoted tilde does not', () => {
  const s = sh();
  assert.strictEqual(s.run('echo ~').out, '/home/student\n');
  assert.strictEqual(s.run('find ~ -name "greet.sh"').out, '/home/student/scripts/greet.sh\n');
  assert.strictEqual(s.run("echo '~'").out, '~\n');
});

test('respawnIf: process returns only while its persistence file exists', () => {
  const s = new Shell({ files: { '/etc/cron.d/job': 'x\n' }, processes: [{ pid: 50, user: 'student', cpu: 90, mem: 1, cmd: 'bad', respawnIf: '/etc/cron.d/job' }] });
  s.run('kill 50');
  assert.strictEqual(s.run('pgrep bad').out, '67\n');
  s.run('sudo rm /etc/cron.d/job');
  s.run('kill 67');
  assert.strictEqual(s.run('pgrep bad').code, 1);
});
