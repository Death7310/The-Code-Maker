/*
 * curriculum.js — all lesson content as data.
 *
 * Exercise types:
 *   shell   — learner types into the sandbox terminal; passes when the
 *             command's output equals `expect`.
 *   python  — learner edits code; runs in-browser (Pyodide); passes when
 *             stdout (trimmed) equals `expect`.
 *   quiz    — multiple choice; `answer` is the index of the correct option.
 *
 * Objective tags reference CompTIA PenTest+ PT0-003 domains in general
 * terms. Always check the current official objectives PDF from CompTIA.
 */
(function (root) {
  'use strict';

  const tracks = [
    {
      id: 'foundations',
      title: 'Foundations & Ethics',
      lang: 'Concepts',
      blurb: 'Authorization, scope, methodology and reporting: what separates a professional tester from a criminal.',
      lessons: [
        {
          id: 'f1',
          title: 'Authorization comes first',
          body: `
<p>Penetration testing is legal <strong>only</strong> with written permission from someone who actually has the authority to grant it. Without that, the same activity is a crime in most countries. In the US that's the Computer Fraud and Abuse Act; in the UK, the Computer Misuse Act.</p>
<p>A professional engagement is defined by documents, signed <em>before</em> any testing starts:</p>
<ul>
  <li><strong>Statement of Work (SOW):</strong> what will be delivered and when.</li>
  <li><strong>Rules of Engagement (RoE):</strong> what's allowed, testing windows, contacts, and what to do if something breaks.</li>
  <li><strong>Scope:</strong> the exact systems, address ranges and applications that are in bounds. Everything else is out.</li>
  <li><strong>NDA / MSA:</strong> confidentiality and the overall contract terms.</li>
</ul>
<p>Practice only on systems you own, or on platforms built for it, where the operator gives you permission as part of signing up.</p>`,
          exercise: {
            type: 'quiz',
            question: 'You find a server during a test that is NOT listed in scope but looks vulnerable. What do you do?',
            options: [
              'Test it quickly, since it belongs to the same company',
              'Stop, record it, and ask the client contact whether to add it to scope in writing',
              'Ignore it completely and never mention it',
              'Test it, but leave it out of the report',
            ],
            answer: 1,
            explain: 'Scope is a legal boundary. Note what you saw and escalate it through the contact named in the RoE. Don\u2019t touch it until it\u2019s been added in writing.',
          },
        },
        {
          id: 'f2',
          title: 'The engagement lifecycle',
          body: `
<p>Most frameworks (PTES, NIST SP 800-115, and the CompTIA domain structure) describe roughly the same phases:</p>
<ol>
  <li><strong>Planning & scoping</strong>: agreements, objectives, constraints.</li>
  <li><strong>Information gathering</strong>: learning about the target within scope.</li>
  <li><strong>Vulnerability discovery & analysis</strong>: finding weaknesses and checking they're real.</li>
  <li><strong>Attacks & exploits</strong>: carefully showing impact, within the RoE.</li>
  <li><strong>Post-exploitation & cleanup</strong>: removing anything you added and restoring state.</li>
  <li><strong>Reporting & communication</strong>: the deliverable the client actually pays for.</li>
</ol>
<p>Scripting runs through all of these phases. You use it to parse data, automate repetitive checks and process results. That's why the exam tests whether you can read and change scripts.</p>`,
          exercise: {
            type: 'quiz',
            question: 'Which phase produces the main deliverable a client pays for?',
            options: ['Information gathering', 'Exploitation', 'Reporting & communication', 'Cleanup'],
            answer: 2,
            explain: 'The report turns technical findings into business risk and fixes. A test without a usable report has delivered little value.',
          },
        },
        {
          id: 'f3',
          title: 'Writing findings people can act on',
          body: `
<p>A good finding has a consistent structure:</p>
<ul>
  <li><strong>Title</strong> and <strong>severity</strong>, often scored with CVSS.</li>
  <li><strong>Affected assets</strong>: exactly which in-scope systems.</li>
  <li><strong>Description</strong>: what the weakness is, in plain language.</li>
  <li><strong>Evidence</strong>: timestamped steps, screenshots, logs.</li>
  <li><strong>Business impact</strong>: why leadership should care.</li>
  <li><strong>Remediation</strong>: concrete fixes, both short-term and long-term.</li>
</ul>
<p>Write an executive summary for non-technical readers, then technical detail for the people who'll fix the issues.</p>`,
          exercise: {
            type: 'quiz',
            question: 'Who is the executive summary written for?',
            options: ['The system administrators', 'Non-technical leadership', 'Other penetration testers', 'Law enforcement'],
            answer: 1,
            explain: 'Executives decide budget and priority. They need risk in business terms, not command output.',
          },
        },
      ],
    },

    {
      id: 'bash',
      title: 'Bash',
      lang: 'Bash',
      blurb: 'The Linux command line: moving around, reading files and chaining small tools together to process data.',
      lessons: [
        {
          id: 'b1',
          title: 'Moving around: pwd, ls, cd',
          body: `
<p>The shell always has a <strong>current working directory</strong>. <code>pwd</code> prints it, <code>ls</code> lists what's in it and <code>cd</code> moves you somewhere else.</p>
<pre>pwd          # where am I?
ls           # what is here?
ls -l        # long format (permissions, size)
cd logs      # move into logs/
cd ..        # go up one level
cd ~         # go home</pre>
<p>The sandbox on the right is simulated, so you can't break anything. Type <code>help</code> to see every command it supports.</p>`,
          exercise: {
            type: 'shell',
            task: 'Move into the logs directory, then print your working directory. (Hint: chain two commands with &&.)',
            expect: '/home/student/logs\n',
          },
        },
        {
          id: 'b2',
          title: 'Reading files: cat, head, tail',
          body: `
<p><code>cat</code> prints a whole file. <code>head</code> and <code>tail</code> print the start or end, which helps with large logs.</p>
<pre>cat notes.txt
head -n 2 inventory.csv   # first 2 lines
tail -n 1 inventory.csv   # last line</pre>`,
          exercise: {
            type: 'shell',
            task: 'Print only the header row (the first line) of inventory.csv.',
            expect: 'hostname,ip,os,owner\n',
          },
        },
        {
          id: 'b3',
          title: 'Searching with grep',
          body: `
<p><code>grep PATTERN FILE</code> prints the lines that match. These flags come up a lot:</p>
<pre>grep Failed logs/auth.log      # matching lines
grep -c Failed logs/auth.log   # count matches
grep -i failed logs/auth.log   # ignore case
grep -v root logs/auth.log     # lines that DON'T match
grep -n Accepted logs/auth.log # show line numbers</pre>
<p>Defenders and testers both spend much of their time searching logs like this.</p>`,
          exercise: {
            type: 'shell',
            task: 'Count how many lines in logs/auth.log contain "Accepted".',
            expect: '3\n',
          },
        },
        {
          id: 'b4',
          title: 'Pipes: chaining tools together',
          body: `
<p>The pipe <code>|</code> sends one command's output into the next command's input. This is the core idea of Unix: small tools, chained together.</p>
<pre>grep Failed logs/auth.log | wc -l
grep Failed logs/auth.log | cut -d " " -f 9 | sort | uniq -c</pre>
<p>The second line pulls out the 9th space-separated field (the username), sorts the names and counts the repeats. In short: <em>which accounts had failed logins, and how many times?</em></p>`,
          exercise: {
            type: 'shell',
            task: 'Using a pipe, count the failed-login lines in logs/auth.log that are NOT for root.',
            expect: '3\n',
          },
        },
        {
          id: 'b5',
          title: 'Variables and redirection',
          body: `
<p>Store values in variables with <code>NAME=value</code> (no spaces around <code>=</code>) and read them back with <code>$NAME</code>. Double quotes expand variables; single quotes don't.</p>
<p><code>&gt;</code> writes output to a file (and overwrites it). <code>&gt;&gt;</code> appends.</p>
<pre>TARGET=web01
echo "Reviewing $TARGET" > /tmp/notes.txt
echo "second line" >> /tmp/notes.txt
cat /tmp/notes.txt</pre>`,
          exercise: {
            type: 'shell',
            task: 'Set HOST=db01, then echo the text: checking db01, using the variable rather than typing db01 a second time.',
            expect: 'checking db01\n',
            hint: 'HOST=db01; echo "checking $HOST"',
          },
        },
        {
          id: 'b6',
          title: 'Loops',
          body: `
<p>A <code>for</code> loop repeats a command for each item in a list. This is how you automate repetitive work across many in-scope hosts or files.</p>
<pre>for h in web01 db01 hr-pc; do echo "host: $h"; done</pre>
<p>In a real script you'd usually read the list from a file, such as the approved <code>scope.txt</code>. That way automation never runs against anything outside scope.</p>`,
          exercise: {
            type: 'shell',
            task: 'Write a for loop over the words alpha and beta that prints "item: alpha" and "item: beta".',
            expect: 'item: alpha\nitem: beta\n',
          },
        },
      ],
    },

    {
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
    },

    {
      id: 'powershell',
      title: 'PowerShell',
      lang: 'PowerShell',
      blurb: 'Windows administration and automation. It pipes objects, not text. Here you read and predict code.',
      lessons: [
        {
          id: 'ps1',
          title: 'Cmdlets: Verb-Noun',
          body: `
<p>PowerShell commands are called <strong>cmdlets</strong>, and they follow a <code>Verb-Noun</code> pattern:</p>
<pre>Get-Process
Get-Service
Get-ChildItem C:\\Logs     # like ls
Get-Help Get-Service -Examples</pre>
<p><code>Get-Command</code> and <code>Get-Help</code> let you explore PowerShell from inside the shell itself.</p>
<p class="note">This browser can't run PowerShell, so these lessons focus on <em>reading</em> code. That's also how the exam tests it. To practice for real, install PowerShell 7 (it's free and works on Windows, macOS and Linux) on your own machine.</p>`,
          exercise: {
            type: 'quiz',
            question: 'Which cmdlet lists the files in a directory?',
            options: ['Get-Process', 'Get-ChildItem', 'Set-Location', 'Write-Output'],
            answer: 1,
            explain: 'Get-ChildItem (aliases: ls, dir, gci) lists the items in a location. Set-Location is the equivalent of cd.',
          },
        },
        {
          id: 'ps2',
          title: 'The object pipeline',
          body: `
<p>Unlike Bash, PowerShell passes <strong>objects</strong> down the pipeline, so you filter on properties instead of slicing text.</p>
<pre>Get-Service | Where-Object { $_.Status -eq 'Running' } | Select-Object Name</pre>
<p><code>$_</code> is the current object. Comparison operators are words: <code>-eq</code>, <code>-ne</code>, <code>-gt</code>, <code>-lt</code>, <code>-like</code>, <code>-match</code>.</p>`,
          exercise: {
            type: 'quiz',
            question: 'What does this output?\n\n1..6 | Where-Object { $_ -gt 4 }',
            options: ['1 2 3 4', '4 5 6', '5 6', '6'],
            answer: 2,
            explain: '1..6 makes the numbers 1 to 6. -gt 4 keeps only values strictly greater than 4: 5 and 6.',
          },
        },
        {
          id: 'ps3',
          title: 'Variables and loops',
          body: `
<p>Variables start with <code>$</code>. Arrays are written <code>@(...)</code>.</p>
<pre>$hosts = @('web01', 'db01')
foreach ($h in $hosts) {
    Write-Output "host: $h"
}</pre>`,
          exercise: {
            type: 'quiz',
            question: 'What does this print?\n\n$total = 0\nforeach ($n in 1..3) { $total += $n }\nWrite-Output $total',
            options: ['3', '6', '123', '0'],
            answer: 1,
            explain: '0 + 1 + 2 + 3 = 6. += adds to the running total on each pass through the loop.',
          },
        },
        {
          id: 'ps4',
          title: 'Reading event logs (defensive)',
          body: `
<p>Windows records security events with numeric IDs. For example, 4624 is a successful logon and 4625 is a failed logon.</p>
<pre>Get-WinEvent -FilterHashtable @{ LogName='Security'; Id=4625 } -MaxEvents 20</pre>
<p>Knowing these IDs helps you on both sides. Testers understand what their activity looks like to defenders, and analysts (CySA+) know what to hunt for.</p>`,
          exercise: {
            type: 'quiz',
            question: 'Which Windows Security event ID records a FAILED logon?',
            options: ['4624', '4625', '4688', '1102'],
            answer: 1,
            explain: '4625 = failed logon. 4624 = success, 4688 = process creation, 1102 = audit log cleared.',
          },
        },
        {
          id: 'ps5',
          title: 'Execution policy & safety',
          body: `
<p>PowerShell's <strong>execution policy</strong> (<code>Get-ExecutionPolicy</code>) controls whether scripts can run. It's a safety feature against accidentally running untrusted scripts. It is <em>not</em> a security boundary.</p>
<p>Good habits: read any script before you run it, sign scripts in production, and prefer <code>-WhatIf</code> to preview what a destructive cmdlet would do.</p>
<pre>Remove-Item C:\\Temp\\old -Recurse -WhatIf</pre>`,
          exercise: {
            type: 'quiz',
            question: 'What does adding -WhatIf to a cmdlet do?',
            options: [
              'Runs it with administrator rights',
              'Shows what would happen without making changes',
              'Runs it silently',
              'Bypasses the execution policy',
            ],
            answer: 1,
            explain: '-WhatIf previews the action and changes nothing. It\u2019s a cheap way to avoid costly mistakes.',
          },
        },
      ],
    },
  ];

  const career = [
    {
      name: 'CompTIA Security+',
      role: 'Baseline: security concepts, threats, architecture, operations',
      note: 'The common starting point, and it meets US DoD 8140 baseline requirements for many roles. Learn this before specializing.',
    },
    {
      name: 'CompTIA PenTest+',
      role: 'Offensive: planning, scoping, recon, attacks, reporting',
      note: 'Its objectives name Bash, Python and PowerShell, with a focus on reading and modifying scripts. The tracks in this app map to that.',
    },
    {
      name: 'CompTIA CySA+',
      role: 'Defensive: detection, analysis, incident response',
      note: 'A strong partner to PenTest+. Knowing how defenders see activity makes you a better tester.',
    },
    {
      name: 'Hands-on credentials',
      role: 'Practical, lab-based exams',
      note: 'Employers weigh demonstrated skill heavily. After CompTIA, many testers pursue performance-based certs. Note: "CEH" is an EC-Council cert, not a CompTIA one.',
    },
  ];

  const api = { tracks, career };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CM = root.CM || {}; root.CM.curriculum = api; }
})(typeof window !== 'undefined' ? window : globalThis);
