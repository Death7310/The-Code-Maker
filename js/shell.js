/*
 * shell.js — a small, sandboxed Bash-like interpreter for teaching.
 * Runs entirely in memory on a virtual filesystem. Nothing touches the
 * real machine or network. Works in the browser and in Node (for tests).
 *
 * Supported: pipes (|), redirection (>, >>), ; and &&, variables
 * (NAME=value, $NAME, ${NAME}), command substitution $(...), single/double
 * quotes, `for x in a b c; do ...; done` loops, running scripts
 * (./script.sh, bash script.sh), and a simulated multi-user Linux system:
 * file owners/groups/permissions, sudo, processes, services and networking.
 * Run `help` for the full command list.
 */
(function (root) {
  'use strict';

  function defaultFiles() {
    return {
      '/home/student/notes.txt':
        'Welcome to the Code Maker sandbox.\nEverything here is simulated.\nTry: ls, cat, grep, wc -l\n',
      '/home/student/scope.txt':
        '# Authorized targets for the practice engagement\n10.0.5.10\n10.0.5.11\n10.0.5.12\n',
      '/home/student/logs/auth.log': [
        'Nov 01 08:01:12 web01 sshd: Accepted password for alice from 10.0.5.20',
        'Nov 01 08:03:40 web01 sshd: Failed password for bob from 10.0.5.31',
        'Nov 01 08:03:44 web01 sshd: Failed password for bob from 10.0.5.31',
        'Nov 01 08:04:02 web01 sshd: Failed password for root from 10.0.5.31',
        'Nov 01 09:15:27 web01 sshd: Accepted password for carol from 10.0.5.22',
        'Nov 01 09:20:51 web01 sshd: Failed password for dave from 10.0.5.40',
        'Nov 01 10:02:13 web01 sshd: Accepted password for bob from 10.0.5.31',
      ].join('\n') + '\n',
      '/home/student/inventory.csv':
        'hostname,ip,os,owner\nweb01,10.0.5.10,linux,it\ndb01,10.0.5.11,linux,data\nhr-pc,10.0.5.12,windows,hr\nprinter,10.0.5.50,embedded,facilities\n',
      '/home/student/scripts/check.sh':
        '#!/bin/bash\n# A tiny health-check script\necho "Health check"\nwhoami\necho "Done"\n',
      '/home/student/scripts/greet.sh':
        '#!/bin/bash\n# Usage: ./greet.sh NAME\necho "Hello, $1"\n',
      '/home/student/scripts/hosts.sh':
        '#!/bin/bash\n# Loop over every in-scope host listed in scope.txt\nfor ip in $(grep -v "#" ~/scope.txt)\ndo\n  echo "in scope: $ip"\ndone\n',
    };
  }

  // System files that make the sandbox feel like a real Linux host.
  // Hashes in /etc/shadow are placeholders, not real hashes.
  function systemFiles() {
    return {
      '/etc/hostname': 'sandbox\n',
      '/etc/os-release': 'NAME="Sandbox Linux"\nPRETTY_NAME="Sandbox Linux (simulated)"\nID=sandbox\n',
      '/etc/hosts': '127.0.0.1   localhost\n10.20.0.57  sandbox\n10.20.0.10  web01\n10.20.0.11  db01\n10.20.0.1   gateway\n',
      '/etc/resolv.conf': 'nameserver 10.20.0.2\nsearch harborview.example\n',
      '/etc/passwd': [
        'root:x:0:0:root:/root:/bin/bash',
        'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
        'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
        'backup:x:34:34:backup:/var/backups:/usr/sbin/nologin',
        'student:x:1000:1000:Student:/home/student:/bin/bash',
        'alice:x:1001:1001:Alice Admin:/home/alice:/bin/bash',
      ].join('\n') + '\n',
      '/etc/group': 'root:x:0:\nadm:x:4:\nsudo:x:27:student,alice\nshadow:x:42:\nwww-data:x:33:\nstudent:x:1000:\nalice:x:1001:\n',
      '/etc/shadow': [
        'root:$y$PLACEHOLDER-NOT-A-REAL-HASH:20000:0:99999:7:::',
        'student:$y$PLACEHOLDER-NOT-A-REAL-HASH:20000:0:99999:7:::',
        'alice:$y$PLACEHOLDER-NOT-A-REAL-HASH:20000:0:99999:7:::',
        'www-data:*:20000:0:99999:7:::',
        'backup:*:20000:0:99999:7:::',
      ].join('\n') + '\n',
      '/etc/ssh/sshd_config': '# SSH server configuration (excerpt)\nPort 22\nPermitRootLogin no\nPasswordAuthentication yes\nPubkeyAuthentication yes\n',
      '/var/log/auth.log': [
        'Nov 03 07:58:01 sandbox sshd[901]: Accepted publickey for alice from 10.20.0.21 port 50122 ssh2',
        'Nov 03 08:02:13 sandbox sudo:    alice : TTY=pts/0 ; PWD=/home/alice ; USER=root ; COMMAND=/usr/bin/apt update',
        'Nov 03 08:15:40 sandbox sshd[955]: Failed password for root from 198.51.100.23 port 52344 ssh2',
        'Nov 03 08:15:44 sandbox sshd[956]: Failed password for root from 198.51.100.23 port 52350 ssh2',
        'Nov 03 08:20:02 sandbox sudo:  student : TTY=pts/1 ; PWD=/home/student ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow',
        'Nov 03 08:31:19 sandbox sudo:  student : user NOT in sudoers ; COMMAND=/usr/sbin/useradd test',
      ].join('\n') + '\n',
      '/var/log/syslog': 'Nov 03 08:00:00 sandbox systemd[1]: Started Daily apt download activities.\nNov 03 08:00:05 sandbox cron[655]: (root) CMD (run-parts /etc/cron.hourly)\n',
      '/var/www/html/index.html': '<h1>It works (simulated)</h1>\n',
    };
  }

  // Ownership and permissions for paths that differ from the defaults.
  function systemMeta() {
    return {
      '/etc/shadow': { mode: '640', owner: 'root', group: 'shadow' },
      '/var/log/auth.log': { mode: '640', owner: 'root', group: 'adm' },
      '/var/log/syslog': { mode: '640', owner: 'root', group: 'adm' },
      '/root': { mode: '700', owner: 'root', group: 'root' },
      '/tmp': { mode: '777', owner: 'root', group: 'root' },
      '/var/www': { mode: '755', owner: 'www-data', group: 'www-data' },
      '/var/www/html': { mode: '755', owner: 'www-data', group: 'www-data' },
      '/var/www/html/index.html': { mode: '644', owner: 'www-data', group: 'www-data' },
    };
  }

  function defaultProcesses() {
    return [
      { pid: 1, user: 'root', cpu: 0.0, mem: 0.3, cmd: '/sbin/init' },
      { pid: 412, user: 'root', cpu: 0.1, mem: 0.2, cmd: '/usr/sbin/sshd -D' },
      { pid: 655, user: 'root', cpu: 0.0, mem: 0.1, cmd: '/usr/sbin/cron -f' },
      { pid: 780, user: 'root', cpu: 0.0, mem: 0.4, cmd: 'nginx: master process /usr/sbin/nginx' },
      { pid: 788, user: 'www-data', cpu: 0.3, mem: 0.6, cmd: 'nginx: worker process' },
      { pid: 1022, user: 'student', cpu: 0.0, mem: 0.1, cmd: '-bash' },
      { pid: 4242, user: 'student', cpu: 0.2, mem: 0.3, cmd: 'updaterd --interval 60' },
    ];
  }

  const USERS = {
    root: { uid: 0, groups: ['root'] },
    student: { uid: 1000, groups: ['student', 'sudo'] },
  };

  function Shell(opts) {
    opts = opts || {};
    this.files = Object.assign(opts.bare ? {} : systemFiles(), opts.files || defaultFiles());
    this.dirs = new Set(['/', '/home', '/home/student', '/tmp', '/root', '/bin', '/usr', '/usr/bin', '/var', '/var/log', '/etc']);
    Object.keys(this.files).forEach((p) => this._addParents(p));
    this.meta = Object.assign(systemMeta(), opts.meta || {});
    this.procs = (opts.processes || defaultProcesses()).map((p) => Object.assign({}, p));
    this.services = Object.assign({ ssh: 'active', nginx: 'active', cron: 'active' }, opts.services || {});
    this.cwd = '/home/student';
    this.user = 'student';
    this.asRoot = false; // true only while a `sudo` command runs
    this.depth = 0; // script nesting guard
    this.env = { USER: 'student', HOME: '/home/student', SHELL: '/bin/bash', PATH: '/usr/local/bin:/usr/bin:/bin' };
    this.history = [];
  }

  // ---------- users & permissions ----------
  Shell.prototype.effUser = function () { return this.asRoot ? 'root' : this.user; };

  Shell.prototype.getMeta = function (p) {
    if (this.meta[p]) return this.meta[p];
    const home = p === '/home/student' || p.startsWith('/home/student/');
    const owner = home ? 'student' : 'root';
    return { mode: this.isDir(p) ? '755' : '644', owner, group: owner };
  };

  Shell.prototype.setMeta = function (p, patch) {
    this.meta[p] = Object.assign({}, this.getMeta(p), patch);
  };

  // bit: 4 = read, 2 = write, 1 = execute
  Shell.prototype.can = function (p, bit) {
    const m = this.getMeta(p);
    const u = this.effUser();
    if (u === 'root') return bit !== 1 || /[1357]/.test(m.mode); // root bypasses r/w, needs some x bit
    const groups = (USERS[u] || { groups: [u] }).groups;
    const digit = m.owner === u ? m.mode[0] : groups.includes(m.group) ? m.mode[1] : m.mode[2];
    return (Number(digit) & bit) !== 0;
  };

  Shell.prototype.parentOf = function (p) { return p.slice(0, p.lastIndexOf('/')) || '/'; };

  // Create or overwrite a file, honoring permissions. Returns an error string or ''.
  Shell.prototype.writeFile = function (p, content, append) {
    const parent = this.parentOf(p);
    if (!this.isDir(parent)) return p + ': No such file or directory';
    if (this.isDir(p)) return p + ': Is a directory';
    if (this.isFile(p)) {
      if (!this.can(p, 2)) return p + ': Permission denied';
    } else {
      if (!this.can(parent, 2)) return p + ': Permission denied';
      const u = this.effUser();
      this.meta[p] = { mode: '644', owner: u, group: u === 'root' ? 'root' : u };
    }
    this.files[p] = append && this.isFile(p) ? this.files[p] + content : content;
    return '';
  };

  Shell.prototype._addParents = function (p) {
    const parts = p.split('/').filter(Boolean);
    let cur = '';
    for (let i = 0; i < parts.length - 1; i++) {
      cur += '/' + parts[i];
      this.dirs.add(cur);
    }
  };

  Shell.prototype.resolve = function (p) {
    if (!p) return this.cwd;
    if (p === '~' || p.startsWith('~/')) p = this.env.HOME + p.slice(1);
    const base = p.startsWith('/') ? [] : this.cwd.split('/').filter(Boolean);
    p.split('/').forEach((seg) => {
      if (!seg || seg === '.') return;
      if (seg === '..') base.pop();
      else base.push(seg);
    });
    return '/' + base.join('/');
  };

  Shell.prototype.isDir = function (p) { return this.dirs.has(p); };
  Shell.prototype.isFile = function (p) { return Object.prototype.hasOwnProperty.call(this.files, p); };

  // ---------- tokenizer ----------
  // Produces tokens: {t:'word', v}, {t:'op', v:'|'|'>'|'>>'|';'|'&&'}
  Shell.prototype.tokenize = function (line) {
    const toks = [];
    let i = 0;
    let cur = null; // current word being built
    const push = () => { if (cur !== null) { toks.push({ t: 'word', v: cur }); cur = null; } };
    const expandVars = (s) =>
      s.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, a, b) => {
        const k = a || b;
        return this.env[k] !== undefined ? this.env[k] : '';
      });
    while (i < line.length) {
      const c = line[i];
      if (c === ' ' || c === '\t') { push(); i++; continue; }
      if (c === '#' && cur === null) break; // comment
      if (c === '~' && cur === null && (i + 1 === line.length || /[\s/]/.test(line[i + 1]))) { cur = this.env.HOME; i++; continue; }
      if (c === '|' ) { push(); toks.push({ t: 'op', v: '|' }); i++; continue; }
      if (c === ';') { push(); toks.push({ t: 'op', v: ';' }); i++; continue; }
      if (c === '&' && line[i + 1] === '&') { push(); toks.push({ t: 'op', v: '&&' }); i += 2; continue; }
      if (c === '>') {
        push();
        if (line[i + 1] === '>') { toks.push({ t: 'op', v: '>>' }); i += 2; }
        else { toks.push({ t: 'op', v: '>' }); i++; }
        continue;
      }
      if (c === "'") {
        const end = line.indexOf("'", i + 1);
        if (end < 0) throw new Error('unterminated single quote');
        cur = (cur || '') + line.slice(i + 1, end);
        i = end + 1; continue;
      }
      if (c === '"') {
        const end = line.indexOf('"', i + 1);
        if (end < 0) throw new Error('unterminated double quote');
        const inner = line.slice(i + 1, end).replace(/\$\(([^()]*)\)/g, (_, cmd) => this._subst(cmd));
        cur = (cur || '') + expandVars(inner);
        i = end + 1; continue;
      }
      if (c === '$' && line[i + 1] === '(') {
        // Unquoted $(...): output is split into separate words.
        let depth = 0;
        let j = i + 1;
        for (; j < line.length; j++) {
          if (line[j] === '(') depth++;
          else if (line[j] === ')' && --depth === 0) break;
        }
        if (j >= line.length) throw new Error('unterminated $(');
        const words = this._subst(line.slice(i + 2, j)).split(/\s+/).filter(Boolean);
        words.forEach((w, k) => {
          if (k === 0) { cur = (cur || '') + w; } else { push(); cur = w; }
        });
        i = j + 1; continue;
      }
      if (c === '$') {
        const m = /^\$\{(\w+)\}|^\$(\w+)/.exec(line.slice(i));
        if (m) { cur = (cur || '') + expandVars(m[0]); i += m[0].length; continue; }
      }
      cur = (cur || '') + c; i++;
    }
    push();
    return toks;
  };

  // Run a command for $(...) substitution; trailing newlines are removed.
  Shell.prototype._subst = function (cmd) {
    if (++this.depth > 20) { this.depth--; throw new Error('substitution nested too deeply'); }
    try { return this._runLine(cmd).out.replace(/\n+$/, ''); } finally { this.depth--; }
  };

  // ---------- public entry ----------
  // Returns {out: string, code: number}
  Shell.prototype.run = function (line) {
    line = String(line || '').trim();
    if (!line) return { out: '', code: 0 };
    this.history.push(line);
    try {
      return this._runLine(line);
    } catch (e) {
      return { out: 'bash: ' + e.message + '\n', code: 1 };
    }
  };

  Shell.prototype._runLine = function (line) {
    // for-loop: for VAR in items; do body; done
    const forRe = /^for\s+(\w+)\s+in\s+(.*?);\s*do\s+(.*?);?\s*done\s*$/;
    const fm = forRe.exec(line);
    if (fm) {
      const items = this.tokenize(fm[2]).filter((t) => t.t === 'word').map((t) => t.v);
      let out = '';
      let code = 0;
      for (const it of items) {
        this.env[fm[1]] = it;
        const r = this._runLine(fm[3]);
        out += r.out; code = r.code;
      }
      return { out, code };
    }

    // Split on top-level ; and && first, then tokenize each segment only
    // when it runs, so `X=1; echo $X` sees the new value (as real Bash does).
    let out = '';
    let code = 0;
    for (const { text, joiner } of splitSequence(line)) {
      if (joiner === '&&' && code !== 0) continue;
      const toks = this.tokenize(text);
      if (!toks.length) continue;
      const r = this._runPipeline(toks);
      out += r.out; code = r.code;
    }
    return { out, code };
  };

  // Split a command line on ; and && that are outside quotes.
  function splitSequence(line) {
    const segs = [];
    let cur = '';
    let quote = null;
    let joiner = ';';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (quote) { if (c === quote) quote = null; cur += c; continue; }
      if (c === "'" || c === '"') { quote = c; cur += c; continue; }
      if (c === ';' || (c === '&' && line[i + 1] === '&')) {
        segs.push({ text: cur, joiner });
        joiner = c === ';' ? ';' : '&&';
        if (c === '&') i++;
        cur = '';
        continue;
      }
      cur += c;
    }
    segs.push({ text: cur, joiner });
    return segs;
  }

  Shell.prototype._runPipeline = function (toks) {
    // assignment: NAME=value (single word, nothing else)
    if (toks.length === 1 && toks[0].t === 'word' && /^\w+=/.test(toks[0].v)) {
      const eq = toks[0].v.indexOf('=');
      this.env[toks[0].v.slice(0, eq)] = toks[0].v.slice(eq + 1);
      return { out: '', code: 0 };
    }
    // split into stages on |
    const stages = [[]];
    for (const t of toks) {
      if (t.t === 'op' && t.v === '|') stages.push([]);
      else stages[stages.length - 1].push(t);
    }
    let input = null;
    let code = 0;
    for (let s = 0; s < stages.length; s++) {
      const st = stages[s];
      let redir = null;
      const words = [];
      for (let i = 0; i < st.length; i++) {
        const t = st[i];
        if (t.t === 'op' && (t.v === '>' || t.v === '>>')) {
          const target = st[i + 1];
          if (!target || target.t !== 'word') throw new Error('syntax error near redirection');
          redir = { mode: t.v, path: this.resolve(target.v) };
          i++;
        } else if (t.t === 'word') {
          words.push(t.v);
        }
      }
      if (!words.length) throw new Error('syntax error: empty command');
      const r = this.exec(words[0], words.slice(1), input);
      code = r.code;
      let o = r.out;
      if (redir) {
        const err = this.writeFile(redir.path, o, redir.mode === '>>');
        if (err) return { out: 'bash: ' + err + '\n', code: 1 };
        o = '';
      }
      input = o;
    }
    return { out: input || '', code };
  };

  // Read text either from file args or from piped input.
  Shell.prototype._readInputs = function (files, input, name) {
    if (!files.length) return { text: input || '', err: '' };
    let text = '';
    let err = '';
    for (const f of files) {
      const p = this.resolve(f);
      if (this.isDir(p)) err += name + ': ' + f + ': Is a directory\n';
      else if (!this.isFile(p)) err += name + ': ' + f + ': No such file or directory\n';
      else if (!this.can(p, 4)) err += name + ': ' + f + ': Permission denied\n';
      else text += this.files[p];
    }
    return { text, err };
  };

  function splitFlags(args) {
    const flags = [];
    const rest = [];
    for (const a of args) {
      if (/^-\w+$/.test(a)) flags.push(...a.slice(1).split(''));
      else rest.push(a);
    }
    return { flags, rest };
  }

  function lines(text) {
    if (!text) return [];
    const ls = text.split('\n');
    if (ls[ls.length - 1] === '') ls.pop();
    return ls;
  }
  const join = (ls) => (ls.length ? ls.join('\n') + '\n' : '');

  Shell.prototype.exec = function (cmd, args, input) {
    if (cmd.includes('/')) {
      // Running a file directly, e.g. ./script.sh or /home/student/scripts/check.sh
      const p = this.resolve(cmd);
      if (!this.isFile(p)) return { out: 'bash: ' + cmd + ': No such file or directory\n', code: 127 };
      if (!this.can(p, 1)) return { out: 'bash: ' + cmd + ': Permission denied (hint: chmod +x)\n', code: 126 };
      return this.runScript(p, cmd, args);
    }
    const fn = COMMANDS[cmd];
    if (!fn) return { out: cmd + ': command not found (type "help" for the list)\n', code: 127 };
    return fn.call(this, args, input);
  };

  // Execute a script file line by line. Multi-line for/do/done blocks are joined.
  Shell.prototype.runScript = function (p, name, args) {
    if (this.depth > 10) return { out: 'bash: scripts nested too deeply\n', code: 1 };
    const saved = {};
    const pos = [name].concat(args);
    for (let k = 0; k < 10; k++) { saved[k] = this.env[k]; this.env[k] = pos[k] !== undefined ? pos[k] : ''; }
    const src = this.files[p].split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    const stmts = [];
    for (let k = 0; k < src.length; k++) {
      const l = src[k];
      if (/^for\s/.test(l) && !/\bdone\s*$/.test(l)) {
        const header = l.replace(/;?\s*do$/, '');
        const body = [];
        k++;
        if (src[k] === 'do') k++;
        for (; k < src.length && src[k] !== 'done'; k++) body.push(src[k]);
        stmts.push(header + '; do ' + body.join('; ') + '; done');
      } else stmts.push(l);
    }
    let out = '';
    let code = 0;
    this.depth++;
    try {
      for (const st of stmts) {
        const r = this._runLine(st);
        out += r.out; code = r.code;
        if (r.out === '\x1bCLEAR') out = '';
      }
    } catch (e) {
      out += 'bash: ' + e.message + '\n'; code = 1;
    } finally {
      this.depth--;
      for (let k = 0; k < 10; k++) this.env[k] = saved[k];
    }
    return { out, code };
  };

  const HELP = {
    pwd: 'print working directory',
    cd: 'change directory',
    ls: 'list files (-a, -l)',
    cat: 'print file contents',
    echo: 'print text',
    mkdir: 'make a directory',
    touch: 'create an empty file',
    rm: 'remove a file',
    grep: 'search text (-i ignore case, -v invert, -c count, -n line numbers, -o only the match; patterns are regular expressions)',
    wc: 'count lines/words/chars (-l, -w, -c)',
    head: 'first lines (-n N)',
    tail: 'last lines (-n N)',
    sort: 'sort lines (-r reverse, -n numeric)',
    uniq: 'collapse duplicate adjacent lines (-c count)',
    cut: 'select fields (-d DELIM -f N)',
    tr: 'translate characters (tr a-z A-Z)',
    whoami: 'print current user',
    id: 'show user id and groups',
    sudo: 'run one command as root (sudo COMMAND)',
    chmod: 'change permissions (chmod 640 FILE, chmod u+x FILE)',
    chown: 'change owner (root only): chown USER[:GROUP] FILE',
    stat: 'file details (stat -c %a FILE prints octal mode)',
    cp: 'copy a file: cp SRC DEST',
    mv: 'move/rename: mv SRC DEST',
    find: 'search for files: find PATH -name "*.log" -type f',
    bash: 'run a script: bash FILE (or ./FILE if executable)',
    ps: 'list processes (ps aux for all users)',
    pgrep: 'print PIDs matching a name',
    kill: 'stop a process: kill PID',
    top: 'processes sorted by CPU (one snapshot)',
    systemctl: 'services: systemctl status|start|stop|restart NAME',
    ip: 'network config: ip a, ip route',
    ss: 'listening sockets: ss -tuln',
    ping: 'test reachability: ping -c 2 HOST',
    hostname: 'print host name',
    uname: 'system info (-a)',
    df: 'disk usage (-h)',
    free: 'memory usage (-h)',
    which: 'show where a command lives',
    man: 'short manual for a command',
    export: 'set an environment variable: export NAME=value',
    env: 'list environment variables',
    date: 'print a fixed simulated date',
    history: 'show commands you have run',
    clear: 'clear the screen',
    help: 'this list',
  };

  const COMMANDS = {
    help() {
      const out = Object.keys(HELP).map((k) => k.padEnd(9) + ' ' + HELP[k]).join('\n');
      return { out: 'Sandbox commands (simulated):\n' + out + '\nAlso: pipes |, > and >>, ; and &&, VAR=value, $VAR, $(command), for x in ...; do ...; done, ./script.sh\n', code: 0 };
    },
    clear() { return { out: '\x1bCLEAR', code: 0 }; },
    whoami() { return { out: this.effUser() + '\n', code: 0 }; },
    date() { return { out: 'Mon Nov  3 09:00:00 UTC 2026\n', code: 0 }; },
    history() {
      return { out: join(this.history.map((h, i) => String(i + 1).padStart(4) + '  ' + h)), code: 0 };
    },
    pwd() { return { out: this.cwd + '\n', code: 0 }; },
    cd(args) {
      const p = this.resolve(args[0] || this.env.HOME);
      if (!this.isDir(p)) return { out: 'cd: ' + (args[0] || '') + ': No such file or directory\n', code: 1 };
      if (!this.can(p, 1)) return { out: 'cd: ' + args[0] + ': Permission denied\n', code: 1 };
      this.cwd = p;
      return { out: '', code: 0 };
    },
    ls(args) {
      const { flags, rest } = splitFlags(args);
      const target = this.resolve(rest[0]);
      const longLine = (full, n) => {
        const d = this.isDir(full);
        const m = this.getMeta(full);
        const size = d ? 4096 : this.files[full].length;
        return (d ? 'd' : '-') + modeString(m.mode) + ' ' + m.owner.padEnd(8) + ' ' + m.group.padEnd(8) + ' ' + String(size).padStart(5) + ' ' + n + (d ? '/' : '');
      };
      if (this.isFile(target)) return { out: (flags.includes('l') ? longLine(target, rest[0]) : rest[0]) + '\n', code: 0 };
      if (!this.isDir(target)) return { out: 'ls: cannot access \'' + rest[0] + '\': No such file or directory\n', code: 2 };
      if (!this.can(target, 4)) return { out: 'ls: cannot open directory \'' + (rest[0] || '.') + '\': Permission denied\n', code: 2 };
      const prefix = target === '/' ? '/' : target + '/';
      const names = new Set();
      const all = [...this.dirs].concat(Object.keys(this.files));
      for (const p of all) {
        if (p !== target && p.startsWith(prefix)) {
          const name = p.slice(prefix.length).split('/')[0];
          if (name) names.add(name);
        }
      }
      let list = [...names].sort();
      if (!flags.includes('a')) list = list.filter((n) => !n.startsWith('.'));
      if (flags.includes('l')) {
        return { out: join(list.map((n) => longLine(prefix + n, n))), code: 0 };
      }
      return { out: list.length ? list.map((n) => (this.isDir(prefix + n) ? n + '/' : n)).join('  ') + '\n' : '', code: 0 };
    },
    cat(args, input) {
      const r = this._readInputs(args, input, 'cat');
      return { out: r.text + r.err, code: r.err ? 1 : 0 };
    },
    echo(args) {
      let nl = '\n';
      if (args[0] === '-n') { nl = ''; args = args.slice(1); }
      return { out: args.join(' ') + nl, code: 0 };
    },
    mkdir(args) {
      const { flags, rest } = splitFlags(args);
      for (const a of rest) {
        const p = this.resolve(a);
        if (flags.includes('p')) { this._addParents(p + '/x'); continue; }
        const parent = this.parentOf(p);
        if (!this.isDir(parent)) return { out: 'mkdir: cannot create directory \'' + a + '\': No such file or directory\n', code: 1 };
        if (!this.can(parent, 2)) return { out: 'mkdir: cannot create directory \'' + a + '\': Permission denied\n', code: 1 };
        this.dirs.add(p);
        this.meta[p] = { mode: '755', owner: this.effUser(), group: this.effUser() };
      }
      return { out: '', code: 0 };
    },
    touch(args) {
      for (const a of args) {
        const p = this.resolve(a);
        if (this.isFile(p) || this.isDir(p)) continue;
        const err = this.writeFile(p, '');
        if (err) return { out: 'touch: ' + err + '\n', code: 1 };
      }
      return { out: '', code: 0 };
    },
    rm(args) {
      const { flags, rest } = splitFlags(args);
      for (const a of rest) {
        const p = this.resolve(a);
        if (this.isDir(p)) {
          if (!flags.includes('r')) return { out: 'rm: cannot remove \'' + a + '\': Is a directory (use -r)\n', code: 1 };
          if (!this.can(this.parentOf(p), 2)) return { out: 'rm: cannot remove \'' + a + '\': Permission denied\n', code: 1 };
          const pre = p + '/';
          Object.keys(this.files).forEach((f) => { if (f.startsWith(pre)) delete this.files[f]; });
          [...this.dirs].forEach((d) => { if (d === p || d.startsWith(pre)) this.dirs.delete(d); });
          continue;
        }
        if (!this.isFile(p)) return { out: 'rm: cannot remove \'' + a + '\': No such file\n', code: 1 };
        if (!this.can(this.parentOf(p), 2)) return { out: 'rm: cannot remove \'' + a + '\': Permission denied\n', code: 1 };
        delete this.files[p];
        delete this.meta[p];
      }
      return { out: '', code: 0 };
    },
    grep(args, input) {
      const { flags, rest } = splitFlags(args);
      const pattern = rest[0];
      if (pattern === undefined) return { out: 'usage: grep [-ivcn] PATTERN [FILE...]\n', code: 2 };
      const r = this._readInputs(rest.slice(1), input, 'grep');
      let re;
      try { re = new RegExp(pattern, flags.includes('i') ? 'i' : ''); }
      catch (e) { return { out: 'grep: invalid pattern\n', code: 2 }; }
      const inv = flags.includes('v');
      const only = flags.includes('o') && !inv;
      const matched = [];
      lines(r.text).forEach((l, i) => {
        if (re.test(l) === inv) return;
        if (only) {
          // -o: print each matching part on its own line
          const g = new RegExp(re.source, re.flags + 'g');
          (l.match(g) || []).forEach((m) => matched.push(m));
        } else {
          matched.push(flags.includes('n') ? (i + 1) + ':' + l : l);
        }
      });
      const out = flags.includes('c') ? matched.length + '\n' : join(matched);
      return { out: out + r.err, code: matched.length ? 0 : 1 };
    },
    wc(args, input) {
      const { flags, rest } = splitFlags(args);
      const r = this._readInputs(rest, input, 'wc');
      const l = lines(r.text).length;
      const w = r.text.split(/\s+/).filter(Boolean).length;
      const c = r.text.length;
      let parts = [];
      if (!flags.length) parts = [l, w, c];
      else { if (flags.includes('l')) parts.push(l); if (flags.includes('w')) parts.push(w); if (flags.includes('c')) parts.push(c); }
      return { out: parts.join(' ') + '\n' + r.err, code: 0 };
    },
    head(args, input) { return headTail.call(this, args, input, 'head'); },
    tail(args, input) { return headTail.call(this, args, input, 'tail'); },
    sort(args, input) {
      const { flags, rest } = splitFlags(args);
      const r = this._readInputs(rest, input, 'sort');
      let ls = lines(r.text);
      if (flags.includes('n')) ls.sort((a, b) => parseFloat(a) - parseFloat(b));
      else ls.sort();
      if (flags.includes('r')) ls.reverse();
      return { out: join(ls) + r.err, code: 0 };
    },
    uniq(args, input) {
      const { flags, rest } = splitFlags(args);
      const r = this._readInputs(rest, input, 'uniq');
      const out = [];
      let prev = null;
      let count = 0;
      const emit = () => { if (prev !== null) out.push(flags.includes('c') ? String(count).padStart(7) + ' ' + prev : prev); };
      for (const l of lines(r.text)) {
        if (l === prev) count++;
        else { emit(); prev = l; count = 1; }
      }
      emit();
      return { out: join(out) + r.err, code: 0 };
    },
    cut(args, input) {
      let delim = '\t';
      let field = null;
      const files = [];
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-d') delim = args[++i];
        else if (a.startsWith('-d')) delim = a.slice(2);
        else if (a === '-f') field = args[++i];
        else if (a.startsWith('-f')) field = a.slice(2);
        else files.push(a);
      }
      if (!field) return { out: 'cut: you must specify a list of fields (-f)\n', code: 1 };
      const idx = field.split(',').map((n) => parseInt(n, 10) - 1);
      const r = this._readInputs(files, input, 'cut');
      const out = lines(r.text).map((l) => {
        const parts = l.split(delim);
        return idx.map((i) => parts[i]).filter((x) => x !== undefined).join(delim);
      });
      return { out: join(out) + r.err, code: 0 };
    },
    tr(args, input) {
      const expand = (s) => s.replace(/(.)-(.)/g, (_, a, b) => {
        let r = '';
        for (let c = a.charCodeAt(0); c <= b.charCodeAt(0); c++) r += String.fromCharCode(c);
        return r;
      });
      if (args.length < 2) return { out: 'usage: tr SET1 SET2\n', code: 1 };
      const a = expand(args[0]);
      const b = expand(args[1]);
      const out = (input || '').split('').map((ch) => {
        const i = a.indexOf(ch);
        return i < 0 ? ch : (b[i] !== undefined ? b[i] : b[b.length - 1]);
      }).join('');
      return { out, code: 0 };
    },
  };

  // '754' -> 'rwxr-xr--'
  function modeString(mode) {
    return mode.split('').map((d) => {
      const n = Number(d);
      return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
    }).join('');
  }

  function globToRegex(g) {
    return new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
  }

  const PING_HOSTS = { localhost: '127.0.0.1', 'example.com': '93.184.215.14' };
  const REACHABLE = ['127.0.0.1', '10.20.0.1', '10.20.0.2', '10.20.0.10', '10.20.0.11', '10.20.0.57', '93.184.215.14'];

  Object.assign(COMMANDS, {
    id() {
      const u = this.effUser();
      if (u === 'root') return { out: 'uid=0(root) gid=0(root) groups=0(root)\n', code: 0 };
      return { out: 'uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)\n', code: 0 };
    },
    groups() { return { out: this.effUser() === 'root' ? 'root\n' : 'student sudo\n', code: 0 }; },
    sudo(args, input) {
      if (!args.length) return { out: 'usage: sudo COMMAND\n', code: 1 };
      if (this.asRoot) return this.exec(args[0], args.slice(1), input);
      this.asRoot = true;
      try { return this.exec(args[0], args.slice(1), input); } finally { this.asRoot = false; }
    },
    chmod(args) {
      if (args.length < 2) return { out: 'usage: chmod MODE FILE\n', code: 1 };
      const spec = args[0];
      for (const f of args.slice(1)) {
        const p = this.resolve(f);
        if (!this.isFile(p) && !this.isDir(p)) return { out: 'chmod: cannot access \'' + f + '\': No such file or directory\n', code: 1 };
        const m = this.getMeta(p);
        if (this.effUser() !== 'root' && m.owner !== this.effUser()) return { out: 'chmod: changing permissions of \'' + f + '\': Operation not permitted\n', code: 1 };
        let mode;
        if (/^[0-7]{3}$/.test(spec)) mode = spec;
        else {
          const digits = m.mode.split('').map(Number);
          for (const part of spec.split(',')) {
            const mm = /^([ugoa]*)([+\-=])([rwx]*)$/.exec(part);
            if (!mm) return { out: 'chmod: invalid mode: \'' + spec + '\'\n', code: 1 };
            const who = (mm[1] || 'a').replace('a', 'ugo');
            const bits = (mm[3].includes('r') ? 4 : 0) | (mm[3].includes('w') ? 2 : 0) | (mm[3].includes('x') ? 1 : 0);
            ['u', 'g', 'o'].forEach((w, i) => {
              if (!who.includes(w)) return;
              if (mm[2] === '+') digits[i] |= bits;
              else if (mm[2] === '-') digits[i] &= ~bits;
              else digits[i] = bits;
            });
          }
          mode = digits.join('');
        }
        this.setMeta(p, { mode });
      }
      return { out: '', code: 0 };
    },
    chown(args) {
      if (args.length < 2) return { out: 'usage: chown USER[:GROUP] FILE\n', code: 1 };
      if (this.effUser() !== 'root') return { out: 'chown: changing ownership of \'' + args[1] + '\': Operation not permitted (try sudo)\n', code: 1 };
      const [owner, group] = args[0].split(':');
      for (const f of args.slice(1)) {
        const p = this.resolve(f);
        if (!this.isFile(p) && !this.isDir(p)) return { out: 'chown: cannot access \'' + f + '\'\n', code: 1 };
        this.setMeta(p, group ? { owner, group } : { owner });
      }
      return { out: '', code: 0 };
    },
    stat(args) {
      let fmt = null;
      const files = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-c') fmt = args[++i];
        else files.push(args[i]);
      }
      let out = '';
      for (const f of files) {
        const p = this.resolve(f);
        if (!this.isFile(p) && !this.isDir(p)) return { out: out + 'stat: cannot statx \'' + f + '\': No such file or directory\n', code: 1 };
        const m = this.getMeta(p);
        if (fmt) out += fmt.replace(/%a/g, m.mode).replace(/%A/g, (this.isDir(p) ? 'd' : '-') + modeString(m.mode)).replace(/%U/g, m.owner).replace(/%G/g, m.group).replace(/%n/g, f).replace(/%s/g, String(this.isDir(p) ? 4096 : this.files[p].length)) + '\n';
        else out += `  File: ${f}\n  Size: ${this.isDir(p) ? 4096 : this.files[p].length}\nAccess: (0${m.mode}/${this.isDir(p) ? 'd' : '-'}${modeString(m.mode)})  Uid: (${m.owner})  Gid: (${m.group})\n`;
      }
      return { out, code: 0 };
    },
    cp(args) { return copyMove.call(this, args, false); },
    mv(args) { return copyMove.call(this, args, true); },
    find(args) {
      const starts = [];
      let name = null;
      let type = null;
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-name' || args[i] === '-iname') name = { re: globToRegex(args[++i]), i: args[i - 1] === '-iname' };
        else if (args[i] === '-type') type = args[++i];
        else starts.push(args[i]);
      }
      if (!starts.length) starts.push('.');
      if (name && name.i) name.re = new RegExp(name.re.source, 'i');
      const out = [];
      let err = '';
      for (const s0 of starts) {
        const base = this.resolve(s0);
        if (!this.isDir(base) && !this.isFile(base)) { err += 'find: \'' + s0 + '\': No such file or directory\n'; continue; }
        const pre = base === '/' ? '/' : base + '/';
        const all = [...this.dirs].concat(Object.keys(this.files)).filter((p) => p === base || p.startsWith(pre));
        // Skip anything inside a directory we cannot read.
        const blocked = [...this.dirs].filter((d) => d !== base && d.startsWith(pre) && !this.can(d, 4));
        blocked.forEach((d) => { err += 'find: \'' + (s0 === '.' ? '.' + d.slice(this.cwd.length) : d) + '\': Permission denied\n'; });
        all.sort().forEach((p) => {
          if (blocked.some((d) => p.startsWith(d + '/'))) return;
          const isD = this.isDir(p);
          if (type === 'f' && isD) return;
          if (type === 'd' && !isD) return;
          const leaf = p.split('/').pop() || '/';
          if (name && !name.re.test(leaf)) return;
          const rel = p === base ? '' : p.slice(pre.length);
          const shown = p === base ? s0 : (s0.endsWith('/') ? s0 : s0 + '/') + rel;
          out.push(shown);
        });
      }
      return { out: join([...new Set(out)]) + err, code: err ? 1 : 0 };
    },
    bash(args) {
      if (!args.length) return { out: 'bash: interactive sub-shells are not simulated; use bash FILE\n', code: 1 };
      const p = this.resolve(args[0]);
      if (!this.isFile(p)) return { out: 'bash: ' + args[0] + ': No such file or directory\n', code: 127 };
      if (!this.can(p, 4)) return { out: 'bash: ' + args[0] + ': Permission denied\n', code: 126 };
      return this.runScript(p, args[0], args.slice(1));
    },
    ps(args) {
      const all = args.some((a) => /a|e/.test(a.replace(/^-/, '')));
      const list = all ? this.procs : this.procs.filter((p) => p.user === this.user);
      if (!all) return { out: '    PID TTY          TIME CMD\n' + join(list.map((p) => String(p.pid).padStart(7) + ' pts/1    00:00:00 ' + p.cmd.split(' ')[0])), code: 0 };
      return {
        out: 'USER         PID %CPU %MEM COMMAND\n' + join(list.map((p) => p.user.padEnd(10) + String(p.pid).padStart(5) + String(p.cpu.toFixed(1)).padStart(5) + String(p.mem.toFixed(1)).padStart(5) + ' ' + p.cmd)),
        code: 0,
      };
    },
    top() {
      const list = this.procs.slice().sort((a, b) => b.cpu - a.cpu);
      return { out: 'top - snapshot (simulated)\n    PID USER      %CPU %MEM COMMAND\n' + join(list.map((p) => String(p.pid).padStart(7) + ' ' + p.user.padEnd(9) + String(p.cpu.toFixed(1)).padStart(5) + String(p.mem.toFixed(1)).padStart(5) + ' ' + p.cmd)), code: 0 };
    },
    pgrep(args) {
      const { rest } = splitFlags(args);
      if (!rest[0]) return { out: 'usage: pgrep NAME\n', code: 2 };
      const ids = this.procs.filter((p) => p.cmd.split(' ')[0].split('/').pop().includes(rest[0]) || p.cmd.includes(rest[0])).map((p) => p.pid);
      return { out: join(ids.map(String)), code: ids.length ? 0 : 1 };
    },
    kill(args) {
      const pids = args.filter((a) => !a.startsWith('-'));
      if (!pids.length) return { out: 'usage: kill [-9] PID\n', code: 1 };
      let out = '';
      for (const s0 of pids) {
        const i = this.procs.findIndex((p) => String(p.pid) === s0);
        if (i < 0) { out += 'bash: kill: (' + s0 + ') - No such process\n'; continue; }
        if (this.effUser() !== 'root' && this.procs[i].user !== this.effUser()) { out += 'bash: kill: (' + s0 + ') - Operation not permitted\n'; continue; }
        if (this.procs[i].pid === 1) { out += 'bash: kill: (1) - refusing to kill init in the sandbox\n'; continue; }
        const pr = this.procs[i];
        if (pr.respawn || (pr.respawnIf && this.isFile(pr.respawnIf))) {
          // Something (e.g. a cron job) keeps restarting it, so a new PID appears.
          const np = Object.assign({}, this.procs[i], { pid: this.procs[i].pid + 17 });
          this.procs.splice(i, 1, np);
        } else this.procs.splice(i, 1);
      }
      return { out, code: out ? 1 : 0 };
    },
    systemctl(args) {
      const [action, name] = args;
      if (!action || !name) return { out: 'usage: systemctl status|start|stop|restart|enable|disable NAME\n', code: 1 };
      const svc = name.replace(/\.service$/, '');
      if (!(svc in this.services)) return { out: 'Unit ' + svc + '.service could not be found.\n', code: 4 };
      if (action === 'status') {
        const st = this.services[svc];
        return { out: `● ${svc}.service\n     Active: ${st === 'active' ? 'active (running)' : 'inactive (dead)'}\n`, code: st === 'active' ? 0 : 3 };
      }
      if (this.effUser() !== 'root') return { out: 'Failed to ' + action + ' ' + svc + '.service: Access denied (try sudo)\n', code: 1 };
      if (action === 'stop') this.services[svc] = 'inactive';
      else if (action === 'start' || action === 'restart') this.services[svc] = 'active';
      else if (action !== 'enable' && action !== 'disable') return { out: 'Unknown command verb ' + action + '.\n', code: 1 };
      return { out: '', code: 0 };
    },
    ip(args) {
      const sub = args[0] || '';
      if (/^a/.test(sub)) {
        return { out: '1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n    link/ether 52:54:00:12:34:56\n    inet 10.20.0.57/24 brd 10.20.0.255 scope global eth0\n', code: 0 };
      }
      if (/^r/.test(sub)) return { out: 'default via 10.20.0.1 dev eth0\n10.20.0.0/24 dev eth0 proto kernel scope link src 10.20.0.57\n', code: 0 };
      return { out: 'usage: ip a | ip route\n', code: 1 };
    },
    ss() {
      const rows = [['tcp', 'LISTEN', '0.0.0.0:22', 'sshd'], ['tcp', 'LISTEN', '0.0.0.0:80', 'nginx'], ['tcp', 'LISTEN', '127.0.0.1:3306', 'mysqld'], ['udp', 'UNCONN', '0.0.0.0:68', 'dhclient']]
        .filter((r) => this.services[r[3] === 'sshd' ? 'ssh' : r[3]] !== 'inactive');
      return { out: 'Netid State   Local Address:Port   Process\n' + join(rows.map((r) => r[0].padEnd(6) + r[1].padEnd(8) + r[2].padEnd(21) + r[3])), code: 0 };
    },
    ping(args) {
      let count = 4;
      const hosts = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-c') count = Math.min(10, parseInt(args[++i], 10) || 1);
        else hosts.push(args[i]);
      }
      const h = hosts[0];
      if (!h) return { out: 'usage: ping [-c N] HOST\n', code: 2 };
      let ip = /^\d+\.\d+\.\d+\.\d+$/.test(h) ? h : PING_HOSTS[h];
      if (!ip && this.files['/etc/hosts']) {
        const line = this.files['/etc/hosts'].split('\n').find((l) => l.split(/\s+/).slice(1).includes(h));
        if (line) ip = line.split(/\s+/)[0];
      }
      if (!ip) return { out: 'ping: ' + h + ': Name or service not known\n', code: 2 };
      let out = 'PING ' + h + ' (' + ip + ') 56(84) bytes of data.\n';
      const up = REACHABLE.includes(ip);
      if (up) for (let i = 1; i <= count; i++) out += '64 bytes from ' + ip + ': icmp_seq=' + i + ' ttl=64 time=' + (0.4 + i / 10).toFixed(1) + ' ms\n';
      out += '--- ' + h + ' ping statistics ---\n' + count + ' packets transmitted, ' + (up ? count : 0) + ' received, ' + (up ? '0' : '100') + '% packet loss\n';
      return { out, code: up ? 0 : 1 };
    },
    hostname() { return { out: (this.files['/etc/hostname'] || 'sandbox\n'), code: 0 }; },
    uname(args) { return { out: args.includes('-a') ? 'Linux sandbox 6.8.0-sim #1 SMP x86_64 GNU/Linux\n' : args.includes('-r') ? '6.8.0-sim\n' : 'Linux\n', code: 0 }; },
    df() { return { out: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        40G   18G   20G  48% /\ntmpfs           2.0G     0  2.0G   0% /tmp\n', code: 0 }; },
    free() { return { out: '               total        used        free\nMem:           3.8Gi       1.2Gi       2.6Gi\nSwap:          1.0Gi          0B       1.0Gi\n', code: 0 }; },
    which(args) {
      return { out: join(args.filter((a) => COMMANDS[a]).map((a) => '/usr/bin/' + a)), code: args.every((a) => COMMANDS[a]) ? 0 : 1 };
    },
    man(args) {
      const c = args[0];
      if (!c || !HELP[c]) return { out: 'No manual entry for ' + (c || '') + '\n', code: 16 };
      return { out: c.toUpperCase() + '(1)\n\nNAME\n       ' + c + ' - ' + HELP[c] + '\n', code: 0 };
    },
    export(args) {
      for (const a of args) {
        const eq = a.indexOf('=');
        if (eq > 0) this.env[a.slice(0, eq)] = a.slice(eq + 1);
      }
      return { out: '', code: 0 };
    },
    env() {
      return { out: join(Object.keys(this.env).filter((k) => !/^\d$/.test(k)).map((k) => k + '=' + this.env[k])), code: 0 };
    },
  });

  function copyMove(args, move) {
    const name = move ? 'mv' : 'cp';
    const { rest } = splitFlags(args);
    if (rest.length !== 2) return { out: 'usage: ' + name + ' SRC DEST\n', code: 1 };
    const src = this.resolve(rest[0]);
    if (!this.isFile(src)) return { out: name + ': cannot stat \'' + rest[0] + '\': No such file (directories not supported)\n', code: 1 };
    if (!this.can(src, 4)) return { out: name + ': cannot open \'' + rest[0] + '\': Permission denied\n', code: 1 };
    let dst = this.resolve(rest[1]);
    if (this.isDir(dst)) dst = (dst === '/' ? '' : dst) + '/' + src.split('/').pop();
    const err = this.writeFile(dst, this.files[src]);
    if (err) return { out: name + ': ' + err + '\n', code: 1 };
    if (move) {
      if (!this.can(this.parentOf(src), 2)) return { out: 'mv: cannot remove \'' + rest[0] + '\': Permission denied\n', code: 1 };
      this.meta[dst] = this.getMeta(src);
      delete this.files[src];
      delete this.meta[src];
    }
    return { out: '', code: 0 };
  }

  function headTail(args, input, name) {
    let n = 10;
    const files = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n') n = parseInt(args[++i], 10);
      else if (/^-\d+$/.test(args[i])) n = parseInt(args[i].slice(1), 10);
      else files.push(args[i]);
    }
    const r = this._readInputs(files, input, name);
    const ls = lines(r.text);
    return { out: join(name === 'head' ? ls.slice(0, n) : ls.slice(Math.max(0, ls.length - n))) + r.err, code: 0 };
  }

  Shell.COMMANDS = Object.keys(HELP);

  if (typeof module !== 'undefined' && module.exports) module.exports = { Shell };
  else { root.CM = root.CM || {}; root.CM.Shell = Shell; }
})(typeof window !== 'undefined' ? window : globalThis);
