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
        task: 'Loop over the list and print only the hosts whose name starts with "web". Expected output: web01 then web02, each on its own line.',
        starter: 'hosts = ["web01", "db01", "web02", "printer"]\nfor h in hosts:\n    # your condition here\n    pass\n',
        expect: 'web01\nweb02',
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
        task: 'Print the service name for every port in the ports list, using "unknown" when a port isn\u2019t in the dict. Expected: ssh, https, unknown on separate lines.',
        starter: 'services = {22: "ssh", 80: "http", 443: "https"}\nports = [22, 443, 9999]\n',
        expect: 'ssh\nhttps\nunknown',
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
        task: 'Complete in_scope() so the program prints True then False.',
        starter: 'def in_scope(ip, scope):\n    # return True if ip is in scope\n    pass\n\nscope = ["10.0.5.10", "10.0.5.11"]\nprint(in_scope("10.0.5.10", scope))\nprint(in_scope("10.0.9.99", scope))\n',
        expect: 'True\nFalse',
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
        task: 'Count failed logins per source IP, then print each IP and its count as "IP count", sorted by IP. Expected:\n10.0.5.31 3\n10.0.5.40 1',
        starter: 'log = """Nov 01 08:03:40 web01 sshd: Failed password for bob from 10.0.5.31\nNov 01 08:03:44 web01 sshd: Failed password for bob from 10.0.5.31\nNov 01 08:04:02 web01 sshd: Failed password for root from 10.0.5.31\nNov 01 09:15:27 web01 sshd: Accepted password for carol from 10.0.5.22\nNov 01 09:20:51 web01 sshd: Failed password for dave from 10.0.5.40"""\n\ncounts = {}\nfor line in log.splitlines():\n    pass  # fill in\n\nfor ip in sorted(counts):\n    print(ip, counts[ip])\n',
        expect: '10.0.5.31 3\n10.0.5.40 1',
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
        task: 'Print True if the SHA-256 of data matches expected, otherwise False. (They should match, so expected output is True.)',
        starter: 'import hashlib\ndata = b"hello"\nexpected = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"\n# compare and print\n',
        expect: 'True',
      },
    },
  ],
};
  CM.tracks[track.id] = track;
})(typeof window !== 'undefined' ? window : globalThis);
