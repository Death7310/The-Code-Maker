/* Track content: python. Registered into CM.tracks; order is set in js/curriculum.js. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  const track = {
  id: 'python',
  title: 'Python',
  lang: 'Python',
  blurb: 'The go-to language for automation and data processing in security work. This code runs for real in your browser.',
  lessons: [
    {
      id: 'p1',
      title: 'Variables, types and print',
      body: `
<p>Python is dynamically typed. You don't declare types; values carry them.</p>
<pre>host = "web01"      # str
port = 443          # int
secure = True       # bool
print(host, port, secure)
print(f"{host} listens on {port}")  # f-string</pre>`,
      exercise: {
        type: 'python',
        task: 'Set name = "db01" and port = 5432, then use an f-string to print exactly: db01:5432',
        starter: 'name = "db01"\nport = 5432\n# print name and port joined by a colon\n',
        expect: 'db01:5432',
      },
    },
    {
      id: 'p2',
      title: 'Lists and loops',
      body: `
<p>A <strong>list</strong> holds an ordered collection. A <code>for</code> loop visits each item in it.</p>
<pre>hosts = ["web01", "db01", "hr-pc"]
for h in hosts:
print(h.upper())
print(len(hosts))</pre>
<p>Indentation matters in Python: it marks which lines belong to the loop.</p>`,
      exercise: {
          type: 'python',
          task: "Write starts_with(hosts, prefix): return a NEW list of the hosts whose name starts with prefix, in the original order. Your function is tested on random host lists and prefixes you haven't seen.",
          starter: "def starts_with(hosts, prefix):\n    result = []\n    # loop over hosts and keep the ones that start with prefix\n    return result\n\n# Try it yourself:\nprint(starts_with([\"app1\", \"db2\", \"app3\"], \"app\"))\n",
          tests: "\n# ---- hidden tests (randomized every run) ----\nimport random as _r\n_r.seed(__SEED__)\n_fails = []\ndef _check(desc, got, want):\n    if got != want and len(_fails) < 3:\n        _fails.append(f\"{desc}\\n    expected: {want!r}\\n    got:      {got!r}\")\n\nfor _ in range(30):\n    _names = [_r.choice([\"web\",\"db\",\"mail\",\"app\",\"vpn\",\"dc\"]) + str(_r.randint(1,99)) for _ in range(_r.randint(0,8))]\n    _pre = _r.choice([\"web\",\"db\",\"mail\",\"app\",\"vpn\",\"dc\",\"x\"])\n    _check(f\"starts_with({_names}, {_pre!r})\", starts_with(list(_names), _pre), [n for n in _names if n.startswith(_pre)])\n\nif _fails:\n    print(\"SOME TESTS FAILED:\")\n    for f in _fails: print(\"  \" + f)\nelse:\n    print(\"ALL TESTS PASSED\")\n",
          reference: "def starts_with(hosts, prefix):\n    return [h for h in hosts if h.startswith(prefix)]\n",
          expect: 'ALL TESTS PASSED',
      },
    },
    {
      id: 'p3',
      title: 'Dictionaries: lookups',
      body: `
<p>A <strong>dict</strong> maps keys to values. It's perfect for lookups, such as matching well-known port numbers to service names:</p>
<pre>services = {22: "ssh", 80: "http", 443: "https"}
print(services[22])
print(services.get(8080, "unknown"))</pre>`,
      exercise: {
          type: 'python',
          task: "Write service_name(port, table): return the service for port from the dict table, or \"unknown\" if it isn't there. Tested with random tables and ports.",
          starter: "def service_name(port, table):\n    # look the port up; fall back to \"unknown\"\n    pass\n\nprint(service_name(25, {25: \"smtp\"}))\n",
          tests: "\n# ---- hidden tests (randomized every run) ----\nimport random as _r\n_r.seed(__SEED__)\n_fails = []\ndef _check(desc, got, want):\n    if got != want and len(_fails) < 3:\n        _fails.append(f\"{desc}\\n    expected: {want!r}\\n    got:      {got!r}\")\n\n_all = {21:\"ftp\",22:\"ssh\",23:\"telnet\",25:\"smtp\",53:\"dns\",80:\"http\",110:\"pop3\",143:\"imap\",443:\"https\",445:\"smb\",3389:\"rdp\"}\nfor _ in range(30):\n    _keys = _r.sample(list(_all), _r.randint(0,6))\n    _tab = {k: _all[k] for k in _keys}\n    _p = _r.choice(list(_all) + [8080, 9999, 1])\n    _check(f\"service_name({_p}, {_tab})\", service_name(_p, dict(_tab)), _tab.get(_p, \"unknown\"))\n\nif _fails:\n    print(\"SOME TESTS FAILED:\")\n    for f in _fails: print(\"  \" + f)\nelse:\n    print(\"ALL TESTS PASSED\")\n",
          reference: "def service_name(port, table):\n    return table.get(port, \"unknown\")\n",
          expect: 'ALL TESTS PASSED',
      },
    },
    {
      id: 'p4',
      title: 'Functions',
      body: `
<p>Functions package logic you can reuse. Give them clear names and return values instead of printing inside them.</p>
<pre>def in_scope(ip, scope):
return ip in scope

scope = ["10.0.5.10", "10.0.5.11"]
print(in_scope("10.0.5.10", scope))   # True</pre>
<p>A check like <code>in_scope</code> belongs at the top of any automation. It's a safety rail that keeps tools inside the agreed boundary.</p>`,
      exercise: {
          type: 'python',
          task: "Complete in_scope(ip, scope): return True only if ip is in the scope list. Tested on random scopes and addresses.",
          starter: "def in_scope(ip, scope):\n    # return True if ip is in scope, otherwise False\n    pass\n\nprint(in_scope(\"192.168.7.4\", [\"192.168.7.4\"]))\n",
          tests: "\n# ---- hidden tests (randomized every run) ----\nimport random as _r\n_r.seed(__SEED__)\n_fails = []\ndef _check(desc, got, want):\n    if got != want and len(_fails) < 3:\n        _fails.append(f\"{desc}\\n    expected: {want!r}\\n    got:      {got!r}\")\n\nfor _ in range(30):\n    _scope = [f\"10.{_r.randint(0,9)}.{_r.randint(0,9)}.{_r.randint(1,20)}\" for _ in range(_r.randint(0,6))]\n    _ip = _r.choice(_scope) if _scope and _r.random() < 0.5 else f\"10.{_r.randint(0,9)}.{_r.randint(0,9)}.{_r.randint(1,20)}\"\n    _check(f\"in_scope({_ip!r}, {_scope})\", in_scope(_ip, list(_scope)), _ip in _scope)\n\nif _fails:\n    print(\"SOME TESTS FAILED:\")\n    for f in _fails: print(\"  \" + f)\nelse:\n    print(\"ALL TESTS PASSED\")\n",
          reference: "def in_scope(ip, scope):\n    return ip in scope\n",
          expect: 'ALL TESTS PASSED',
      },
    },
    {
      id: 'p5',
      title: 'Parsing text: log analysis',
      body: `
<p>A huge share of real security scripting is turning messy text into structured answers. Methods like <code>split()</code>, <code>in</code> checks and counters do most of the work.</p>
<pre>line = "Nov 01 08:03:40 web01 sshd: Failed password for bob from 10.0.5.31"
parts = line.split()
print(parts[8])    # bob
print(parts[-1])   # 10.0.5.31</pre>`,
      exercise: {
          type: 'python',
          task: "Write count_failed(log): given log text, return a dict mapping each source IP to its number of \"Failed\" lines. The IP is the last word on each line. Tested on random logs.",
          starter: "def count_failed(log):\n    counts = {}\n    for line in log.splitlines():\n        pass  # if the line is a failure, add 1 for its IP\n    return counts\n\nsample = \"x sshd: Failed password for a from 10.0.0.9\\nx sshd: Accepted password for b from 10.0.0.2\"\nprint(count_failed(sample))\n",
          tests: "\n# ---- hidden tests (randomized every run) ----\nimport random as _r\n_r.seed(__SEED__)\n_fails = []\ndef _check(desc, got, want):\n    if got != want and len(_fails) < 3:\n        _fails.append(f\"{desc}\\n    expected: {want!r}\\n    got:      {got!r}\")\n\nfor _ in range(25):\n    _lines, _want = [], {}\n    for _ in range(_r.randint(0,25)):\n        _ip = f\"172.16.{_r.randint(0,3)}.{_r.randint(1,9)}\"\n        _ok = _r.random() < 0.4\n        _lines.append(f\"Nov 0{_r.randint(1,9)} 10:00:00 srv sshd: {'Accepted' if _ok else 'Failed'} password for u{_r.randint(1,5)} from {_ip}\")\n        if not _ok: _want[_ip] = _want.get(_ip, 0) + 1\n    _check(f\"count_failed(<log with {len(_lines)} lines>)\", count_failed(\"\\n\".join(_lines)), _want)\n\nif _fails:\n    print(\"SOME TESTS FAILED:\")\n    for f in _fails: print(\"  \" + f)\nelse:\n    print(\"ALL TESTS PASSED\")\n",
          reference: "def count_failed(log):\n    counts = {}\n    for line in log.splitlines():\n        if \"Failed\" in line:\n            ip = line.split()[-1]\n            counts[ip] = counts.get(ip, 0) + 1\n    return counts\n",
          expect: 'ALL TESTS PASSED',
      },
    },
    {
      id: 'p6',
      title: 'Hashing for integrity',
      body: `
<p>A <strong>hash</strong> is a fixed-length fingerprint of some data. If even one byte changes, the hash changes completely. Testers and defenders use hashes to verify evidence and downloaded tools, and to detect tampering.</p>
<pre>import hashlib
data = b"evidence file contents"
print(hashlib.sha256(data).hexdigest())</pre>
<p>Use SHA-256 or stronger for integrity checks. MD5 and SHA-1 are broken against deliberate collisions.</p>`,
      exercise: {
          type: 'python',
          task: "Write verify(data, expected_hex): return True if the SHA-256 of data (bytes) equals expected_hex, else False. Tested with random data, where some hashes match and some have been tampered with.",
          starter: "import hashlib\n\ndef verify(data, expected_hex):\n    # compute the sha256 hex digest of data and compare\n    pass\n\nprint(verify(b\"abc\", \"not-a-real-hash\"))\n",
          tests: "\n# ---- hidden tests (randomized every run) ----\nimport random as _r\n_r.seed(__SEED__)\n_fails = []\ndef _check(desc, got, want):\n    if got != want and len(_fails) < 3:\n        _fails.append(f\"{desc}\\n    expected: {want!r}\\n    got:      {got!r}\")\n\nimport hashlib as _h\nfor _ in range(30):\n    _d = bytes(_r.randint(0,255) for _ in range(_r.randint(0,40)))\n    _good = _h.sha256(_d).hexdigest()\n    _bad = _good[:-1] + (\"0\" if _good[-1] != \"0\" else \"1\")\n    _e = _good if _r.random() < 0.5 else _bad\n    _check(f\"verify(<{len(_d)} bytes>, {'correct' if _e == _good else 'tampered'} hash)\", verify(_d, _e), _e == _good)\n\nif _fails:\n    print(\"SOME TESTS FAILED:\")\n    for f in _fails: print(\"  \" + f)\nelse:\n    print(\"ALL TESTS PASSED\")\n",
          reference: "import hashlib\n\ndef verify(data, expected_hex):\n    return hashlib.sha256(data).hexdigest() == expected_hex\n",
          expect: 'ALL TESTS PASSED',
      },
    },
  ],
};
  CM.tracks[track.id] = track;
})(typeof window !== 'undefined' ? window : globalThis);
