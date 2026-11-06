/*
 * projects/projects.js — hands-on coding projects (learning by doing).
 *
 * Each project is a realistic task at Harborview Logistics (fictional),
 * built in milestones. The learner writes Python in the editor; hidden tests
 * run against RANDOMIZED data every time (seeded per run), so a project is
 * passed by writing a working general solution, never by matching an example.
 *
 * Harness protocol: learner code runs first, then the project's tests. Tests
 * call _check(milestone, description, got, want) inside _guard(milestone, fn),
 * and the harness prints one line: "__RESULTS__" + JSON {milestone: {pass, fail, msgs}}.
 */
(function (root) {
  'use strict';

  const HEAD = String.raw`
# ---------------- hidden tests (randomized every run) ----------------
import random as _r, json as _json
_r.seed(__SEED__)
_R = {}
def _st(m):
    return _R.setdefault(m, {"pass": 0, "fail": 0, "msgs": []})
def _check(m, desc, got, want):
    s = _st(m)
    if got == want:
        s["pass"] += 1
    else:
        s["fail"] += 1
        if len(s["msgs"]) < 2:
            s["msgs"].append(desc + "\n    expected: " + repr(want) + "\n    got:      " + repr(got))
def _guard(m, fn):
    try:
        fn()
    except Exception as e:
        s = _st(m)
        s["fail"] += 1
        if len(s["msgs"]) < 2:
            s["msgs"].append(type(e).__name__ + ": " + str(e))
`;
  const TAIL = String.raw`
print("__RESULTS__" + _json.dumps(_R))
`;

  const projects = [
    // ------------------------------------------------------------------
    {
      id: 'pj-asset-card',
      title: 'Asset Summary Cards',
      level: 'Beginner',
      after: 'zero',
      concepts: ['Variables', 'Strings and f-strings', 'Dictionaries', 'Lists and sorting', 'Functions'],
      briefing: `<p>The IT team keeps its asset list as Python dictionaries. Your manager wants readable one-line summaries for the weekly report.</p>
<p>Each asset looks like: <code>{"host": "web01", "ip": "10.20.0.10", "os": "linux", "owner": "it"}</code></p>`,
      milestones: [
        { id: 'm1', title: 'label(host, ip)', desc: 'Return the text "HOST (IP)", e.g. label("db01", "10.0.0.9") → "db01 (10.0.0.9)".' },
        { id: 'm2', title: 'summary(asset)', desc: 'Return "HOST | IP | OS | owner: OWNER" for one asset dict.' },
        { id: 'm3', title: 'summarize_all(assets)', desc: 'Return a LIST of summary lines for all assets, sorted alphabetically by host. Don’t modify the input list.' },
      ],
      hints: [
        'An f-string puts variables into text: f"{host} ({ip})".',
        'Read dict values with asset["host"]. You can call label-style formatting again inside summary.',
        'sorted(assets, key=lambda a: a["host"]) returns a new sorted list, and the input stays untouched.',
      ],
      starter: `def label(host, ip):
    # return "HOST (IP)"
    pass


def summary(asset):
    # return "HOST | IP | OS | owner: OWNER"
    pass


def summarize_all(assets):
    # return a list of summary lines, sorted by host
    pass


# Try your functions here (this part is yours; the hidden tests use different data):
print(label("web01", "10.20.0.10"))
`,
      reference: `def label(host, ip):
    return f"{host} ({ip})"

def summary(asset):
    return f"{asset['host']} | {asset['ip']} | {asset['os']} | owner: {asset['owner']}"

def summarize_all(assets):
    return [summary(a) for a in sorted(assets, key=lambda a: a["host"])]
`,
      tests: String.raw`
def _asset():
    return {"host": _r.choice(["web","db","mail","hr","dev","pay"]) + str(_r.randint(1, 40)),
            "ip": f"10.{_r.randint(0,30)}.{_r.randint(0,255)}.{_r.randint(1,254)}",
            "os": _r.choice(["linux", "windows", "macos"]), "owner": _r.choice(["it","hr","data","ops"])}
def _t1():
    for _ in range(15):
        a = _asset()
        _check("m1", f"label({a['host']!r}, {a['ip']!r})", label(a["host"], a["ip"]), f"{a['host']} ({a['ip']})")
def _t2():
    for _ in range(15):
        a = _asset()
        _check("m2", f"summary({a})", summary(dict(a)), f"{a['host']} | {a['ip']} | {a['os']} | owner: {a['owner']}")
def _t3():
    for _ in range(10):
        lst = [_asset() for _ in range(_r.randint(0, 7))]
        before = [dict(x) for x in lst]
        want = [f"{a['host']} | {a['ip']} | {a['os']} | owner: {a['owner']}" for a in sorted(lst, key=lambda a: a["host"])]
        _check("m3", f"summarize_all(<{len(lst)} assets>)", summarize_all(lst), want)
        _check("m3", "input list must not be modified", lst, before)
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3)
`,
    },
    // ------------------------------------------------------------------
    {
      id: 'pj-log-triage',
      title: 'Login Log Triage Tool',
      level: 'Beginner',
      after: 'aplus2',
      concepts: ['String splitting', 'Conditionals', 'Counting with dicts', 'Order of events'],
      briefing: `<p>The SOC wants a tool that reads SSH log lines and answers: who is failing to log in, which addresses look like password-guessing, and, most important, whether any of those addresses then <strong>succeeded</strong>.</p>
<p>Relevant lines look like:<br><code>Nov 03 02:14:07 web01 sshd: Failed password for root from 198.51.100.23</code><br><code>Nov 03 02:18:02 web01 sshd: Accepted password for backup from 198.51.100.23</code></p>
<p>Other lines (cron, kernel and so on) must be ignored.</p>`,
      milestones: [
        { id: 'm1', title: 'parse_line(line)', desc: 'For an sshd Failed/Accepted line, return {"status": "Failed" or "Accepted", "user": USER, "ip": IP}. For any other line return None.' },
        { id: 'm2', title: 'failed_by_user(lines)', desc: 'Return a dict mapping each user to their number of Failed lines.' },
        { id: 'm3', title: 'suspicious_ips(lines, threshold)', desc: 'Return a sorted list of IPs with at least `threshold` Failed lines.' },
        { id: 'm4', title: 'compromised(lines, threshold)', desc: 'Return a sorted list of IPs that reached `threshold` failures and THEN had an Accepted login (an Accepted before reaching the threshold doesn’t count).' },
      ],
      hints: [
        'line.split() breaks the line into words. Check " sshd: " is in the line and that the status word is Failed or Accepted. The user is the word after "for"; the IP is the last word.',
        'Loop over lines, parse each one, skip None, and count with counts[user] = counts.get(user, 0) + 1.',
        'Count failures per IP first, then keep the ones >= threshold, then sorted(...).',
        'Walk the lines IN ORDER, keeping a running failure count per IP. When you see an Accepted for an IP whose count has already reached the threshold, flag it.',
      ],
      starter: `def parse_line(line):
    # return {"status": ..., "user": ..., "ip": ...} or None
    pass


def failed_by_user(lines):
    pass


def suspicious_ips(lines, threshold):
    pass


def compromised(lines, threshold):
    pass


sample = "Nov 03 02:14:07 web01 sshd: Failed password for root from 198.51.100.23"
print(parse_line(sample))
`,
      reference: `def parse_line(line):
    if " sshd: " not in line:
        return None
    w = line.split()
    i = w.index("sshd:")
    status = w[i + 1]
    if status not in ("Failed", "Accepted"):
        return None
    return {"status": status, "user": w[w.index("for") + 1], "ip": w[-1]}

def failed_by_user(lines):
    c = {}
    for l in lines:
        p = parse_line(l)
        if p and p["status"] == "Failed":
            c[p["user"]] = c.get(p["user"], 0) + 1
    return c

def suspicious_ips(lines, threshold):
    c = {}
    for l in lines:
        p = parse_line(l)
        if p and p["status"] == "Failed":
            c[p["ip"]] = c.get(p["ip"], 0) + 1
    return sorted(ip for ip, n in c.items() if n >= threshold)

def compromised(lines, threshold):
    c, out = {}, set()
    for l in lines:
        p = parse_line(l)
        if not p:
            continue
        if p["status"] == "Failed":
            c[p["ip"]] = c.get(p["ip"], 0) + 1
        elif c.get(p["ip"], 0) >= threshold:
            out.add(p["ip"])
    return sorted(out)
`,
      tests: String.raw`
_U = ["root","admin","alice","bob","carol","backup","git","test"]
def _gen(n):
    lines, ips = [], [f"198.51.100.{_r.randint(1,30)}" for _ in range(4)] + [f"10.20.0.{_r.randint(2,60)}" for _ in range(3)]
    for _ in range(n):
        k = _r.random()
        ts = f"Nov 0{_r.randint(1,9)} {_r.randint(0,23):02d}:{_r.randint(0,59):02d}:{_r.randint(0,59):02d}"
        if k < 0.12:
            lines.append(f"{ts} web01 CRON[{_r.randint(100,999)}]: (root) CMD (run-parts /etc/cron.hourly)")
        elif k < 0.18:
            lines.append(f"{ts} web01 kernel: eth0 link up")
        else:
            st = "Failed" if _r.random() < 0.7 else "Accepted"
            lines.append(f"{ts} web01 sshd: {st} password for {_r.choice(_U)} from {_r.choice(ips)}")
    return lines
def _p(l):
    if " sshd: " not in l: return None
    w = l.split(); i = w.index("sshd:"); s = w[i+1]
    if s not in ("Failed","Accepted"): return None
    return {"status": s, "user": w[w.index("for")+1], "ip": w[-1]}
def _t1():
    for l in _gen(25):
        _check("m1", f"parse_line({l!r})", parse_line(l), _p(l))
def _t2():
    for _ in range(8):
        L = _gen(_r.randint(0, 40)); want = {}
        for l in L:
            p = _p(l)
            if p and p["status"] == "Failed": want[p["user"]] = want.get(p["user"], 0) + 1
        _check("m2", f"failed_by_user(<{len(L)} lines>)", failed_by_user(L), want)
def _t3():
    for _ in range(8):
        L = _gen(_r.randint(0, 50)); t = _r.randint(2, 6); c = {}
        for l in L:
            p = _p(l)
            if p and p["status"] == "Failed": c[p["ip"]] = c.get(p["ip"], 0) + 1
        _check("m3", f"suspicious_ips(<{len(L)} lines>, {t})", suspicious_ips(L, t), sorted(i for i, n in c.items() if n >= t))
def _t4():
    for _ in range(10):
        L = _gen(_r.randint(5, 60)); t = _r.randint(2, 5); c, out = {}, set()
        for l in L:
            p = _p(l)
            if not p: continue
            if p["status"] == "Failed": c[p["ip"]] = c.get(p["ip"], 0) + 1
            elif c.get(p["ip"], 0) >= t: out.add(p["ip"])
        _check("m4", f"compromised(<{len(L)} lines>, {t})", compromised(L, t), sorted(out))
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3); _guard("m4", _t4)
`,
    },
    // ------------------------------------------------------------------
    {
      id: 'pj-password-policy',
      title: 'Password Policy Checker',
      level: 'Beginner',
      after: 'aplus2',
      concepts: ['String methods', 'Character classes', 'Building result lists', 'Case-insensitive comparison'],
      briefing: `<p>Harborview is rolling out a new password policy. Build the checker the sign-up form will call. It must report <em>every</em> problem, in a fixed order, so the form can explain them to the user.</p>
<p>Policy: at least 12 characters; at least 3 of the 4 character classes (lowercase, uppercase, digit, symbol); must not contain the username (case-insensitive); must not be on the banned list (case-insensitive).</p>`,
      milestones: [
        { id: 'm1', title: 'char_classes(pw)', desc: 'Return how many of the 4 classes appear: lowercase, uppercase, digit, symbol (symbol = anything that isn’t a letter or digit).' },
        { id: 'm2', title: 'check(pw, username, banned)', desc: 'Return a list of problem codes, in this order, including only those that apply: "too_short", "few_classes", "contains_username", "banned".' },
        { id: 'm3', title: 'strength(pw, username, banned)', desc: 'Return "weak" if check finds 2+ problems, "fair" if exactly 1, "strong" if none.' },
      ],
      hints: [
        'Use any(c.islower() for c in pw) for each class, and add up the results (True counts as 1).',
        'Start problems = [] and append codes in the required order. Use .lower() on both sides for the username and banned checks.',
        'Reuse check(): look at len(check(...)).',
      ],
      starter: `def char_classes(pw):
    pass


def check(pw, username, banned):
    problems = []
    return problems


def strength(pw, username, banned):
    pass


print(check("summer2026", "dana", ["password", "summer2026"]))
`,
      reference: `def char_classes(pw):
    return (any(c.islower() for c in pw) + any(c.isupper() for c in pw)
            + any(c.isdigit() for c in pw) + any(not c.isalnum() for c in pw))

def check(pw, username, banned):
    p = []
    if len(pw) < 12: p.append("too_short")
    if char_classes(pw) < 3: p.append("few_classes")
    if username and username.lower() in pw.lower(): p.append("contains_username")
    if pw.lower() in [b.lower() for b in banned]: p.append("banned")
    return p

def strength(pw, username, banned):
    n = len(check(pw, username, banned))
    return "weak" if n >= 2 else "fair" if n == 1 else "strong"
`,
      tests: String.raw`
_BAN = ["password", "Welcome1", "Harborview2026!", "Summer2026", "qwerty123", "letmein"]
def _pw():
    k = _r.random()
    if k < 0.15: return _r.choice(_BAN).swapcase() if _r.random() < 0.5 else _r.choice(_BAN)
    pools = ["abcdefghijk", "ABCDEFGHJK", "0123456789", "!@#%&*-_."]
    use = _r.sample(pools, _r.randint(1, 4))
    n = _r.randint(4, 18)
    s = "".join(_r.choice(_r.choice(use)) for _ in range(n))
    if _r.random() < 0.2: s += _r.choice(["Dana", "DANA", "dana"])
    return s
def _cc(pw):
    return (any(c.islower() for c in pw) + any(c.isupper() for c in pw) + any(c.isdigit() for c in pw) + any(not c.isalnum() for c in pw))
def _chk(pw, u, b):
    p = []
    if len(pw) < 12: p.append("too_short")
    if _cc(pw) < 3: p.append("few_classes")
    if u and u.lower() in pw.lower(): p.append("contains_username")
    if pw.lower() in [x.lower() for x in b]: p.append("banned")
    return p
def _t1():
    for _ in range(25):
        pw = _pw(); _check("m1", f"char_classes({pw!r})", char_classes(pw), _cc(pw))
def _t2():
    for _ in range(30):
        pw = _pw(); _check("m2", f"check({pw!r}, 'dana', BANNED)", check(pw, "dana", list(_BAN)), _chk(pw, "dana", _BAN))
def _t3():
    for _ in range(20):
        pw = _pw(); n = len(_chk(pw, "dana", _BAN))
        _check("m3", f"strength({pw!r}, 'dana', BANNED)", strength(pw, "dana", list(_BAN)), "weak" if n >= 2 else "fair" if n == 1 else "strong")
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3)
`,
    },
    // ------------------------------------------------------------------
    {
      id: 'pj-inventory',
      title: 'Patch Priority Report',
      level: 'Intermediate',
      after: 'linux',
      concepts: ['The csv module', 'Filtering', 'Counting', 'Multi-key sorting'],
      briefing: `<p>The asset inventory is exported as CSV text with the columns <code>host,os,version,owner,criticality,days_since_patch</code>. Build the report that decides which machines get patched first.</p>`,
      milestones: [
        { id: 'm1', title: 'load(csv_text)', desc: 'Return a list of dicts, one per row, with days_since_patch converted to int. Use the header row for keys.' },
        { id: 'm2', title: 'unsupported(rows, supported)', desc: '`supported` is a dict like {"ubuntu": ["22.04", "24.04"]}. Return a sorted list of hosts whose os/version pair isn’t supported.' },
        { id: 'm3', title: 'by_owner(rows)', desc: 'Return a dict mapping owner → number of hosts.' },
        { id: 'm4', title: 'patch_priority(rows)', desc: 'Return hosts ordered by criticality (high, then medium, then low), then by days_since_patch (largest first), then host name A→Z.' },
      ],
      hints: [
        'import csv, io; csv.DictReader(io.StringIO(csv_text)) gives you dicts. Convert the number with int(...).',
        'version in supported.get(os, []) is False when the OS isn’t listed at all.',
        'Same counting pattern as before: d[k] = d.get(k, 0) + 1.',
        'sorted() with a tuple key: rank = {"high": 0, "medium": 1, "low": 2}; key=lambda r: (rank[r["criticality"]], -r["days_since_patch"], r["host"]).',
      ],
      starter: `import csv
import io


def load(csv_text):
    pass


def unsupported(rows, supported):
    pass


def by_owner(rows):
    pass


def patch_priority(rows):
    pass


demo = "host,os,version,owner,criticality,days_since_patch\\nweb01,ubuntu,22.04,it,high,40\\n"
print(load(demo))
`,
      reference: `import csv, io

def load(csv_text):
    rows = []
    for r in csv.DictReader(io.StringIO(csv_text)):
        r["days_since_patch"] = int(r["days_since_patch"])
        rows.append(r)
    return rows

def unsupported(rows, supported):
    return sorted(r["host"] for r in rows if r["version"] not in supported.get(r["os"], []))

def by_owner(rows):
    d = {}
    for r in rows:
        d[r["owner"]] = d.get(r["owner"], 0) + 1
    return d

def patch_priority(rows):
    rank = {"high": 0, "medium": 1, "low": 2}
    return [r["host"] for r in sorted(rows, key=lambda r: (rank[r["criticality"]], -r["days_since_patch"], r["host"]))]
`,
      tests: String.raw`
_OS = {"ubuntu": ["20.04", "22.04", "24.04"], "windows": ["10", "11", "2019", "2022"], "rhel": ["8", "9"]}
_SUP = {"ubuntu": ["22.04", "24.04"], "windows": ["11", "2022"], "rhel": ["9"]}
def _rows(n):
    rows, used = [], set()
    while len(rows) < n:
        h = _r.choice(["web","db","hr","pay","dev","mail","vpn"]) + f"{_r.randint(1,60):02d}"
        if h in used: continue
        used.add(h)
        o = _r.choice(list(_OS))
        rows.append({"host": h, "os": o, "version": _r.choice(_OS[o]), "owner": _r.choice(["it","hr","data","finance"]),
                     "criticality": _r.choice(["high","medium","low"]), "days_since_patch": _r.randint(0, 120)})
    return rows
def _csv(rows):
    return "host,os,version,owner,criticality,days_since_patch\n" + "".join(f"{r['host']},{r['os']},{r['version']},{r['owner']},{r['criticality']},{r['days_since_patch']}\n" for r in rows)
def _t1():
    for _ in range(8):
        R = _rows(_r.randint(0, 10))
        _check("m1", f"load(<csv with {len(R)} rows>)", load(_csv(R)), R)
def _t2():
    for _ in range(8):
        R = _rows(_r.randint(0, 12))
        _check("m2", f"unsupported(<{len(R)} rows>, SUPPORTED)", unsupported([dict(x) for x in R], _SUP), sorted(r["host"] for r in R if r["version"] not in _SUP.get(r["os"], [])))
def _t3():
    for _ in range(8):
        R = _rows(_r.randint(0, 12)); d = {}
        for r in R: d[r["owner"]] = d.get(r["owner"], 0) + 1
        _check("m3", f"by_owner(<{len(R)} rows>)", by_owner([dict(x) for x in R]), d)
def _t4():
    rank = {"high": 0, "medium": 1, "low": 2}
    for _ in range(10):
        R = _rows(_r.randint(0, 14))
        if R and _r.random() < 0.5: R.append(dict(R[0], host=R[0]["host"] + "b"))
        _check("m4", f"patch_priority(<{len(R)} rows>)", patch_priority([dict(x) for x in R]), [r["host"] for r in sorted(R, key=lambda r: (rank[r["criticality"]], -r["days_since_patch"], r["host"]))])
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3); _guard("m4", _t4)
`,
    },
    // ------------------------------------------------------------------
    {
      id: 'pj-fim',
      title: 'File Integrity Monitor',
      level: 'Intermediate',
      after: 'linux',
      concepts: ['hashlib (SHA-256)', 'Bytes vs text', 'Set operations', 'Comparing snapshots'],
      briefing: `<p>Attackers often change system files to hide or to keep access. A <strong>file integrity monitor</strong> records a fingerprint (hash) of each important file, then later reports anything added, removed or modified.</p>
<p>Files are given as a dict mapping path → content as <code>bytes</code>.</p>`,
      milestones: [
        { id: 'm1', title: 'fingerprint(content)', desc: 'Return the SHA-256 hex digest of the given bytes.' },
        { id: 'm2', title: 'baseline(files)', desc: 'Return a dict mapping each path → its fingerprint.' },
        { id: 'm3', title: 'compare(base, files)', desc: 'Compare a baseline with the current files. Return {"added": [...], "removed": [...], "modified": [...]}, each list sorted.' },
      ],
      hints: [
        'import hashlib; hashlib.sha256(content).hexdigest()',
        'A dict comprehension: {path: fingerprint(data) for path, data in files.items()}',
        'Use sets of paths: added = current − base, removed = base − current. Modified = in both, but the fingerprint differs.',
      ],
      starter: `import hashlib


def fingerprint(content):
    pass


def baseline(files):
    pass


def compare(base, files):
    return {"added": [], "removed": [], "modified": []}


print(fingerprint(b"hello"))
`,
      reference: `import hashlib

def fingerprint(content):
    return hashlib.sha256(content).hexdigest()

def baseline(files):
    return {p: fingerprint(d) for p, d in files.items()}

def compare(base, files):
    now = baseline(files)
    a, b = set(now), set(base)
    return {"added": sorted(a - b), "removed": sorted(b - a),
            "modified": sorted(p for p in a & b if now[p] != base[p])}
`,
      tests: String.raw`
import hashlib as _h
def _files():
    names = _r.sample(["/etc/passwd","/etc/hosts","/etc/ssh/sshd_config","/usr/bin/ls","/usr/bin/ps","/etc/crontab","/var/www/index.php","/etc/sudoers"], _r.randint(0, 6))
    return {n: bytes(_r.randint(0,255) for _ in range(_r.randint(0, 30))) for n in names}
def _t1():
    for _ in range(15):
        d = bytes(_r.randint(0,255) for _ in range(_r.randint(0, 50)))
        _check("m1", f"fingerprint(<{len(d)} bytes>)", fingerprint(d), _h.sha256(d).hexdigest())
def _t2():
    for _ in range(8):
        F = _files(); _check("m2", f"baseline(<{len(F)} files>)", baseline(dict(F)), {p: _h.sha256(d).hexdigest() for p, d in F.items()})
def _t3():
    for _ in range(12):
        F = _files(); B = {p: _h.sha256(d).hexdigest() for p, d in F.items()}
        cur = dict(F)
        for p in list(cur):
            k = _r.random()
            if k < 0.2: del cur[p]
            elif k < 0.4: cur[p] = cur[p] + b"#"
        if _r.random() < 0.5: cur["/tmp/.cache/x" + str(_r.randint(1,9))] = b"\x7fELF"
        nb = {p: _h.sha256(d).hexdigest() for p, d in cur.items()}
        want = {"added": sorted(set(nb) - set(B)), "removed": sorted(set(B) - set(nb)), "modified": sorted(p for p in set(nb) & set(B) if nb[p] != B[p])}
        _check("m3", "compare(baseline, <changed files>)", compare(dict(B), cur), want)
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3)
`,
    },
    // ------------------------------------------------------------------
    {
      id: 'pj-subnet-planner',
      title: 'Subnet Planner',
      level: 'Intermediate',
      after: 'network',
      concepts: ['The ipaddress module', 'CIDR math in code', 'Lookups across ranges'],
      briefing: `<p>The network team is splitting a new office range into subnets. Build the helper they'll use to plan addresses and answer "which subnet is this IP in?"</p>
<p>Python's built-in <code>ipaddress</code> module does the binary math for you. Your job is to use it correctly.</p>`,
      milestones: [
        { id: 'm1', title: 'usable_hosts(cidr)', desc: 'Return the number of usable host addresses in an IPv4 network such as "10.0.0.0/26" (total − 2; for /31 and /32 return 0).' },
        { id: 'm2', title: 'split(cidr, new_prefix)', desc: 'Return the list of subnets (as strings like "10.0.0.0/26") produced by splitting cidr into new_prefix-sized pieces.' },
        { id: 'm3', title: 'owner_of(ip, allocations)', desc: '`allocations` maps a name → CIDR string. Return the name whose network contains ip, or None.' },
      ],
      hints: [
        'import ipaddress; net = ipaddress.ip_network(cidr); net.num_addresses gives the total.',
        'list(net.subnets(new_prefix=new_prefix)), then str() each one.',
        'ipaddress.ip_address(ip) in ipaddress.ip_network(cidr) returns True or False.',
      ],
      starter: `import ipaddress


def usable_hosts(cidr):
    pass


def split(cidr, new_prefix):
    pass


def owner_of(ip, allocations):
    pass


print(usable_hosts("192.168.1.0/24"))
`,
      reference: `import ipaddress

def usable_hosts(cidr):
    n = ipaddress.ip_network(cidr)
    return 0 if n.prefixlen >= 31 else n.num_addresses - 2

def split(cidr, new_prefix):
    return [str(s) for s in ipaddress.ip_network(cidr).subnets(new_prefix=new_prefix)]

def owner_of(ip, allocations):
    a = ipaddress.ip_address(ip)
    for name, c in allocations.items():
        if a in ipaddress.ip_network(c):
            return name
    return None
`,
      tests: String.raw`
import ipaddress as _ip
def _net(lo=16, hi=30):
    p = _r.randint(lo, hi)
    return str(_ip.ip_network(f"10.{_r.randint(0,255)}.{_r.randint(0,255)}.{_r.randint(0,255)}/{p}", strict=False))
def _t1():
    for _ in range(20):
        c = _net(16, 32); n = _ip.ip_network(c)
        _check("m1", f"usable_hosts({c!r})", usable_hosts(c), 0 if n.prefixlen >= 31 else n.num_addresses - 2)
def _t2():
    for _ in range(10):
        c = _net(20, 28); np_ = _r.randint(_ip.ip_network(c).prefixlen, min(30, _ip.ip_network(c).prefixlen + 3))
        _check("m2", f"split({c!r}, {np_})", split(c, np_), [str(s) for s in _ip.ip_network(c).subnets(new_prefix=np_)])
def _t3():
    for _ in range(12):
        base = _ip.ip_network(_net(20, 22)); parts = list(base.subnets(new_prefix=base.prefixlen + 2))
        alloc = {name: str(n) for name, n in zip(["office", "servers", "guest", "voice"], parts)}
        if _r.random() < 0.3: alloc.pop("voice")
        if _r.random() < 0.7:
            n = _ip.ip_network(alloc[_r.choice(list(alloc))]); ip = str(n.network_address + _r.randint(0, n.num_addresses - 1))
        else:
            ip = f"172.16.{_r.randint(0,255)}.{_r.randint(1,254)}"
        want = next((k for k, v in alloc.items() if _ip.ip_address(ip) in _ip.ip_network(v)), None)
        _check("m3", f"owner_of({ip!r}, {alloc})", owner_of(ip, dict(alloc)), want)
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3)
`,
    },
    // ------------------------------------------------------------------
    {
      id: 'pj-fw-audit',
      title: 'Firewall Rule Auditor',
      level: 'Intermediate',
      after: 'secplus',
      concepts: ['Lists of records', 'Rule matching', 'First-match evaluation', 'Spotting risky configuration'],
      briefing: `<p>An auditor asked for proof that Harborview's firewall doesn't expose management ports to the internet. You'll build the tool that checks it automatically.</p>
<p>Each rule is a dict: <code>{"id": 10, "action": "allow", "src": "0.0.0.0/0", "port": 22}</code>. Rules are evaluated in order: the first rule matching both source and port decides, and if nothing matches, traffic is denied. <code>"any"</code> and <code>"0.0.0.0/0"</code> both mean every source. A port of <code>"any"</code> matches every port.</p>`,
      milestones: [
        { id: 'm1', title: 'is_any_source(src)', desc: 'Return True if src means "every source" ("any" or "0.0.0.0/0"), else False.' },
        { id: 'm2', title: 'risky(rules)', desc: 'Return the ids (in rule order) of ALLOW rules that permit ANY source to a management port: 22, 23, 3389 or 445 (including port "any").' },
        { id: 'm3', title: 'decide(rules, src_ip, port)', desc: 'Return "allow" or "deny" for traffic from src_ip to port, using first-match evaluation. A rule’s src may be any-source or a CIDR such as "10.20.0.0/24".' },
      ],
      hints: [
        'return src in ("any", "0.0.0.0/0")',
        'Loop over rules in order and keep r["id"] when the action is "allow", the source is any-source, and the port is in {22, 23, 3389, 445} or is "any".',
        'For a CIDR source, use ipaddress.ip_address(src_ip) in ipaddress.ip_network(r["src"]). Return the action of the FIRST rule where both source and port match; after the loop, return "deny".',
      ],
      starter: `import ipaddress

MGMT_PORTS = {22, 23, 3389, 445}


def is_any_source(src):
    pass


def risky(rules):
    pass


def decide(rules, src_ip, port):
    pass


print(is_any_source("0.0.0.0/0"))
`,
      reference: `import ipaddress
MGMT_PORTS = {22, 23, 3389, 445}

def is_any_source(src):
    return src in ("any", "0.0.0.0/0")

def risky(rules):
    return [r["id"] for r in rules if r["action"] == "allow" and is_any_source(r["src"]) and (r["port"] == "any" or r["port"] in MGMT_PORTS)]

def decide(rules, src_ip, port):
    for r in rules:
        src_ok = is_any_source(r["src"]) or ipaddress.ip_address(src_ip) in ipaddress.ip_network(r["src"])
        port_ok = r["port"] == "any" or r["port"] == port
        if src_ok and port_ok:
            return r["action"]
    return "deny"
`,
      tests: String.raw`
import ipaddress as _ip
def _rules():
    out = []
    for i in range(_r.randint(0, 8)):
        out.append({"id": (i + 1) * 10, "action": _r.choice(["allow", "deny"]),
                    "src": _r.choice(["any", "0.0.0.0/0", "10.20.0.0/24", "10.20.5.0/24", "192.168.1.0/24"]),
                    "port": _r.choice([22, 23, 80, 443, 3389, 445, 8080, "any"])})
    return out
def _anys(s): return s in ("any", "0.0.0.0/0")
def _t1():
    for s in ["any", "0.0.0.0/0", "10.0.0.0/8", "10.20.0.0/24", "192.168.1.0/24", "0.0.0.0/8"]:
        _check("m1", f"is_any_source({s!r})", is_any_source(s), _anys(s))
def _t2():
    for _ in range(12):
        R = _rules()
        _check("m2", f"risky({R})", risky([dict(x) for x in R]), [r["id"] for r in R if r["action"] == "allow" and _anys(r["src"]) and (r["port"] == "any" or r["port"] in {22, 23, 3389, 445})])
def _t3():
    for _ in range(25):
        R = _rules(); ip = _r.choice([f"10.20.0.{_r.randint(1,254)}", f"10.20.5.{_r.randint(1,254)}", f"203.0.113.{_r.randint(1,254)}"]); port = _r.choice([22, 80, 443, 3389, 8080])
        want = "deny"
        for r in R:
            if (_anys(r["src"]) or _ip.ip_address(ip) in _ip.ip_network(r["src"])) and (r["port"] == "any" or r["port"] == port):
                want = r["action"]; break
        _check("m3", f"decide({R}, {ip!r}, {port})", decide([dict(x) for x in R], ip, port), want)
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3)
`,
    },
    // ------------------------------------------------------------------
    {
      id: 'pj-timeline',
      title: 'Incident Timeline Builder',
      level: 'Advanced',
      after: 'secplus',
      concepts: ['datetime parsing', 'Merging data from several sources', 'Sorting by time', 'Searching text'],
      briefing: `<p>During an incident, evidence arrives from several systems: firewall, mail gateway, endpoint tool. Investigators need ONE timeline in time order. Build it.</p>
<p>Every line starts with an ISO timestamp, then a space, then the message: <code>2026-11-03T08:02:44Z delivered from=it-support@harb0rview-it.example</code></p>`,
      milestones: [
        { id: 'm1', title: 'parse_event(source, line)', desc: 'Return a tuple (datetime, source, message). The timestamp format is "%Y-%m-%dT%H:%M:%SZ"; the message is everything after the first space.' },
        { id: 'm2', title: 'timeline(sources)', desc: '`sources` maps a source name → list of lines. Return a list of strings "YYYY-MM-DD HH:MM:SS [source] message" for all events, sorted by time, then by source name.' },
        { id: 'm3', title: 'first_seen(sources, keyword)', desc: 'Return the timeline string of the EARLIEST event whose message contains keyword (case-insensitive), or None.' },
      ],
      hints: [
        'from datetime import datetime; ts, msg = line.split(" ", 1); datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")',
        'Collect (time, source, message) tuples from every source; sorting tuples sorts by time, then source. Format each with f"{t:%Y-%m-%d %H:%M:%S} [{src}] {msg}".',
        'Build the timeline, then return the first entry whose message (lowercased) contains keyword.lower().',
      ],
      starter: `from datetime import datetime


def parse_event(source, line):
    pass


def timeline(sources):
    pass


def first_seen(sources, keyword):
    pass


print(parse_event("mail", "2026-11-03T08:02:44Z delivered to=dana"))
`,
      reference: `from datetime import datetime

def parse_event(source, line):
    ts, msg = line.split(" ", 1)
    return (datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ"), source, msg)

def _events(sources):
    ev = []
    for src, lines in sources.items():
        for l in lines:
            ev.append(parse_event(src, l))
    return sorted(ev)

def timeline(sources):
    return [f"{t:%Y-%m-%d %H:%M:%S} [{s}] {m}" for t, s, m in _events(sources)]

def first_seen(sources, keyword):
    for t, s, m in _events(sources):
        if keyword.lower() in m.lower():
            return f"{t:%Y-%m-%d %H:%M:%S} [{s}] {m}"
    return None
`,
      tests: String.raw`
from datetime import datetime as _dt
_MSG = ["delivered phishing email", "user clicked link", "POST /login to 203.0.113.66", "powershell spawned by WINWORD", "outbound connection blocked",
        "new admin account created", "large upload to 198.51.100.77", "Antivirus alert quarantined file", "VPN login from new country"]
def _src():
    out = {}
    for s in _r.sample(["firewall", "mail", "edr", "proxy", "vpn"], _r.randint(1, 4)):
        out[s] = []
        for _ in range(_r.randint(0, 6)):
            t = _dt(2026, 11, _r.randint(2, 4), _r.randint(0, 23), _r.randint(0, 59), _r.choice([0, 0, _r.randint(0, 59)]))
            out[s].append(f"{t:%Y-%m-%dT%H:%M:%SZ} {_r.choice(_MSG)}")
    return out
def _ev(S):
    e = []
    for s, L in S.items():
        for l in L:
            ts, m = l.split(" ", 1); e.append((_dt.strptime(ts, "%Y-%m-%dT%H:%M:%SZ"), s, m))
    return sorted(e)
def _fmt(t, s, m): return f"{t:%Y-%m-%d %H:%M:%S} [{s}] {m}"
def _t1():
    for _ in range(12):
        S = _src(); s = list(S)[0]
        for l in S[s][:2]:
            ts, m = l.split(" ", 1)
            _check("m1", f"parse_event({s!r}, {l!r})", parse_event(s, l), (_dt.strptime(ts, "%Y-%m-%dT%H:%M:%SZ"), s, m))
def _t2():
    for _ in range(8):
        S = _src(); _check("m2", f"timeline(<{sum(len(v) for v in S.values())} events>)", timeline({k: list(v) for k, v in S.items()}), [_fmt(*e) for e in _ev(S)])
def _t3():
    for _ in range(10):
        S = _src(); kw = _r.choice(["PHISHING", "upload", "admin", "nothing-matches", "Login"])
        want = next((_fmt(*e) for e in _ev(S) if kw.lower() in e[2].lower()), None)
        _check("m3", f"first_seen(<sources>, {kw!r})", first_seen({k: list(v) for k, v in S.items()}, kw), want)
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3)
`,
    },
    // ------------------------------------------------------------------
    {
      id: 'pj-report',
      title: 'Findings Report Generator',
      level: 'Advanced',
      after: 'practice',
      concepts: ['Mapping numbers to categories', 'Sorting records', 'Generating formatted documents'],
      briefing: `<p>Every security assessment ends in a report. Automating the boring part (severity labels, ordering, consistent layout) leaves you more time for analysis.</p>
<p>Findings are dicts: <code>{"title": "Directory listing enabled", "host": "10.20.0.40", "cvss": 5.3}</code></p>
<p>CVSS v3 severity bands: 0.0 = NONE, 0.1–3.9 = LOW, 4.0–6.9 = MEDIUM, 7.0–8.9 = HIGH, 9.0–10.0 = CRITICAL.</p>`,
      milestones: [
        { id: 'm1', title: 'severity(cvss)', desc: 'Return the severity label for a CVSS score, using the bands above.' },
        { id: 'm2', title: 'ordered(findings)', desc: 'Return the findings sorted by cvss (highest first), then title A→Z. Don’t modify the input.' },
        { id: 'm3', title: 'render(findings)', desc: 'Return Markdown text: "# Findings" followed, for each finding in ordered() order (numbered from 1), by a blank line, then "## N. TITLE (SEVERITY, CVSS)" and "Host: HOST" on separate lines. CVSS is shown with one decimal place. The text ends with a single newline.' },
      ],
      hints: [
        'Use if/elif in order: == 0 → NONE, < 4 → LOW, < 7 → MEDIUM, < 9 → HIGH, else CRITICAL.',
        'sorted(findings, key=lambda f: (-f["cvss"], f["title"]))',
        'Build a list of lines, then "\\n".join(lines) + "\\n". Use enumerate(..., start=1) and f"{f[\'cvss\']:.1f}".',
      ],
      starter: `def severity(cvss):
    pass


def ordered(findings):
    pass


def render(findings):
    lines = ["# Findings"]
    return "\\n".join(lines) + "\\n"


print(severity(7.5))
`,
      reference: `def severity(cvss):
    if cvss == 0: return "NONE"
    if cvss < 4: return "LOW"
    if cvss < 7: return "MEDIUM"
    if cvss < 9: return "HIGH"
    return "CRITICAL"

def ordered(findings):
    return sorted(findings, key=lambda f: (-f["cvss"], f["title"]))

def render(findings):
    lines = ["# Findings"]
    for i, f in enumerate(ordered(findings), start=1):
        lines += ["", f"## {i}. {f['title']} ({severity(f['cvss'])}, {f['cvss']:.1f})", f"Host: {f['host']}"]
    return "\\n".join(lines) + "\\n"
`,
      tests: String.raw`
_T = ["Directory listing enabled", "Weak SSH password policy", "Outdated web server", "Default admin credentials", "Missing security headers",
      "World-writable config file", "Unencrypted FTP service", "Public storage bucket", "Verbose error messages"]
def _sev(c):
    if c == 0: return "NONE"
    if c < 4: return "LOW"
    if c < 7: return "MEDIUM"
    if c < 9: return "HIGH"
    return "CRITICAL"
def _fs():
    return [{"title": t, "host": f"10.20.0.{_r.randint(2,250)}", "cvss": round(_r.choice([0.0, _r.uniform(0.1, 10.0)]), 1)} for t in _r.sample(_T, _r.randint(0, 6))]
def _t1():
    for c in [0.0, 0.1, 3.9, 4.0, 6.9, 7.0, 8.9, 9.0, 10.0] + [round(_r.uniform(0, 10), 1) for _ in range(10)]:
        _check("m1", f"severity({c})", severity(c), _sev(c))
def _t2():
    for _ in range(10):
        F = _fs()
        if len(F) > 1 and _r.random() < 0.5: F[1]["cvss"] = F[0]["cvss"]
        before = [dict(x) for x in F]
        _check("m2", f"ordered(<{len(F)} findings>)", ordered(F), sorted(before, key=lambda f: (-f["cvss"], f["title"])))
        _check("m2", "input must not be modified", F, before)
def _t3():
    for _ in range(8):
        F = _fs(); lines = ["# Findings"]
        for i, f in enumerate(sorted(F, key=lambda f: (-f["cvss"], f["title"])), start=1):
            lines += ["", f"## {i}. {f['title']} ({_sev(f['cvss'])}, {f['cvss']:.1f})", f"Host: {f['host']}"]
        _check("m3", f"render(<{len(F)} findings>)", render([dict(x) for x in F]), "\n".join(lines) + "\n")
_guard("m1", _t1); _guard("m2", _t2); _guard("m3", _t3)
`,
    },
  ];

  // Full program to run: learner code + seeded hidden tests.
  function program(project, code, seed) {
    return code + '\n' + HEAD.replace('__SEED__', String(seed)) + project.tests + TAIL;
  }
  // Parse the harness output into per-milestone results.
  function parseResults(project, stdout) {
    const line = stdout.split('\n').reverse().find((l) => l.startsWith('__RESULTS__'));
    const raw = line ? JSON.parse(line.slice('__RESULTS__'.length)) : null;
    const results = {};
    for (const m of project.milestones) {
      const r = raw && raw[m.id];
      results[m.id] = r ? { passed: r.fail === 0 && r.pass > 0, pass: r.pass, fail: r.fail, msgs: r.msgs } : { passed: false, pass: 0, fail: 0, msgs: raw ? ['No tests ran for this milestone.'] : [] };
    }
    const userOut = stdout.split('\n').filter((l) => !l.startsWith('__RESULTS__')).join('\n');
    return { ran: !!raw, results, userOut };
  }

  const api = { projects, program, parseResults, HEAD, TAIL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CM = root.CM || {}; root.CM.projects = api; }
})(typeof window !== 'undefined' ? window : globalThis);
