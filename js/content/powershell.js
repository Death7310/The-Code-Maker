/* Track content: powershell. Registered into CM.tracks; order is set in js/curriculum.js. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  const track = {
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
};
  CM.tracks[track.id] = track;
})(typeof window !== 'undefined' ? window : globalThis);
