/*
 * shell.js — a small, sandboxed Bash-like interpreter for teaching.
 * Runs entirely in memory on a virtual filesystem. Nothing touches the
 * real machine or network. Works in the browser and in Node (for tests).
 *
 * Supported: pipes (|), redirection (>, >>), ; and &&, variables
 * (NAME=value, $NAME, ${NAME}), single/double quotes, simple
 * `for x in a b c; do ...; done` loops, and these commands:
 * pwd cd ls cat echo mkdir touch rm grep wc head tail sort uniq cut tr
 * help clear history whoami date
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
    };
  }

  function Shell(opts) {
    opts = opts || {};
    this.files = Object.assign({}, opts.files || defaultFiles());
    this.dirs = new Set(['/', '/home', '/home/student', '/tmp']);
    Object.keys(this.files).forEach((p) => this._addParents(p));
    this.cwd = '/home/student';
    this.env = { USER: 'student', HOME: '/home/student', SHELL: '/bin/bash' };
    this.history = [];
  }

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
        cur = (cur || '') + expandVars(line.slice(i + 1, end));
        i = end + 1; continue;
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
        const dir = redir.path.slice(0, redir.path.lastIndexOf('/')) || '/';
        if (!this.isDir(dir)) return { out: 'bash: ' + redir.path + ': No such file or directory\n', code: 1 };
        if (redir.mode === '>>' && this.isFile(redir.path)) this.files[redir.path] += o;
        else this.files[redir.path] = o;
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
    const fn = COMMANDS[cmd];
    if (!fn) return { out: cmd + ': command not found (type "help" for the list)\n', code: 127 };
    return fn.call(this, args, input);
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
    grep: 'search text (-i ignore case, -v invert, -c count, -n line numbers)',
    wc: 'count lines/words/chars (-l, -w, -c)',
    head: 'first lines (-n N)',
    tail: 'last lines (-n N)',
    sort: 'sort lines (-r reverse, -n numeric)',
    uniq: 'collapse duplicate adjacent lines (-c count)',
    cut: 'select fields (-d DELIM -f N)',
    tr: 'translate characters (tr a-z A-Z)',
    whoami: 'print current user',
    date: 'print a fixed simulated date',
    history: 'show commands you have run',
    clear: 'clear the screen',
    help: 'this list',
  };

  const COMMANDS = {
    help() {
      const out = Object.keys(HELP).map((k) => k.padEnd(8) + ' ' + HELP[k]).join('\n');
      return { out: 'Sandbox commands (simulated):\n' + out + '\nAlso: pipes |, > and >>, ; and &&, VAR=value, $VAR, for x in ...; do ...; done\n', code: 0 };
    },
    clear() { return { out: '\x1bCLEAR', code: 0 }; },
    whoami() { return { out: this.env.USER + '\n', code: 0 }; },
    date() { return { out: 'Mon Nov  3 09:00:00 UTC 2026\n', code: 0 }; },
    history() {
      return { out: join(this.history.map((h, i) => String(i + 1).padStart(4) + '  ' + h)), code: 0 };
    },
    pwd() { return { out: this.cwd + '\n', code: 0 }; },
    cd(args) {
      const p = this.resolve(args[0] || this.env.HOME);
      if (!this.isDir(p)) return { out: 'cd: ' + (args[0] || '') + ': No such file or directory\n', code: 1 };
      this.cwd = p;
      return { out: '', code: 0 };
    },
    ls(args) {
      const { flags, rest } = splitFlags(args);
      const target = this.resolve(rest[0]);
      if (this.isFile(target)) return { out: (rest[0]) + '\n', code: 0 };
      if (!this.isDir(target)) return { out: 'ls: cannot access \'' + rest[0] + '\': No such file or directory\n', code: 2 };
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
        return {
          out: join(list.map((n) => {
            const full = prefix + n;
            const d = this.isDir(full);
            const size = d ? 4096 : this.files[full].length;
            return (d ? 'drwxr-xr-x' : '-rw-r--r--') + ' student student ' + String(size).padStart(5) + ' ' + n + (d ? '/' : '');
          })),
          code: 0,
        };
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
        const parent = p.slice(0, p.lastIndexOf('/')) || '/';
        if (!this.isDir(parent)) return { out: 'mkdir: cannot create directory \'' + a + '\': No such file or directory\n', code: 1 };
        this.dirs.add(p);
      }
      return { out: '', code: 0 };
    },
    touch(args) {
      for (const a of args) {
        const p = this.resolve(a);
        if (!this.isFile(p)) this.files[p] = '';
      }
      return { out: '', code: 0 };
    },
    rm(args) {
      const { rest } = splitFlags(args);
      for (const a of rest) {
        const p = this.resolve(a);
        if (!this.isFile(p)) return { out: 'rm: cannot remove \'' + a + '\': No such file\n', code: 1 };
        delete this.files[p];
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
      const matched = [];
      lines(r.text).forEach((l, i) => {
        if (re.test(l) !== inv) matched.push(flags.includes('n') ? (i + 1) + ':' + l : l);
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
