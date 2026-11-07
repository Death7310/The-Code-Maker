/* study/linux-b.js — in-depth notes: Linux lessons l5–l8. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    l5: {
      sections: [
        { h: 'The principle: elevate per command, and leave a trail', html: `
<p>Working as root all the time means every typo and every malicious script runs with unlimited power. <code>sudo</code> flips the default: you work as a normal user and elevate <em>one command at a time</em>, deliberately. Each use is checked against a policy and logged, so there's a record of who did what as root.</p>` },
        { h: 'How sudo policy works', html: `
<ul>
  <li>The policy lives in <code>/etc/sudoers</code> and <code>/etc/sudoers.d/</code>. Always edit it with <code>visudo</code>, which checks the syntax, because a broken sudoers file can lock everyone out of admin access.</li>
  <li>Rules can grant everything (members of the <code>sudo</code>/<code>wheel</code> group) or <strong>specific commands only</strong>, such as letting a helpdesk group restart one service.</li>
  <li><code>sudo -l</code> lists what <em>you</em> are allowed to run. Auditors review these rules, because overly broad grants (for example, any editor or shell as root) effectively hand out full root access.</li>
  <li>Every sudo use is recorded in the auth log, including commands that were refused.</li>
</ul>` },
        { h: 'Good practice', html: `
<ul>
  <li>Disable direct root login over SSH (<code>PermitRootLogin no</code>); admins log in as themselves, then use sudo.</li>
  <li>Grant the narrowest commands each role needs.</li>
  <li>Review sudo rules and group membership regularly, and alert on unusual sudo use.</li>
</ul>` },
      ],
      misconceptions: ['sudo is just a convenience. (It\'s a least-privilege and accountability control.)', 'Limiting sudo to "harmless" programs is always safe. (Some programs can launch shells or edit files; grants need careful review.)'],
      examTraps: ['Edit sudoers with visudo.', '"Who ran this as root?" → the auth log / sudo logs.'],
      onTheJob: 'Admins manage sudo policy for teams. Security reviews check for overly broad sudo grants, and SOC analysts alert on unusual elevation.',
      checks: [
        { q: 'A helpdesk group needs to restart the web service, and nothing else, as root. Best approach?', options: ['Give them the root password', 'A sudoers rule allowing only the specific restart command for that group', 'Add them to the sudo group with full rights', 'Make the service files world-writable'], answer: 1, why: ['That\'s shared, unlogged, unlimited power.', 'Least privilege: exactly the command needed, logged per user.', 'Far more access than the task requires.', 'That lets anyone tamper with the service.'] },
      ],
      sources: [
        { title: 'Sudo project documentation', url: 'https://www.sudo.ws/docs/' },
        { title: 'CIS Benchmarks (hardening guidance, free registration)', url: 'https://www.cisecurity.org/cis-benchmarks' },
      ],
    },

    l6: {
      sections: [
        { h: 'The principle: a script is just a file the kernel is told how to run', html: `
<p>When you run <code>./script.sh</code>, the kernel checks the file's <strong>execute permission</strong>, reads the first line (the <strong>shebang</strong>, e.g. <code>#!/bin/bash</code>) to find the interpreter, and runs the file through it. That's why a script with no x bit gives "Permission denied" yet works fine with <code>bash script.sh</code>, which only needs read permission.</p>` },
        { h: 'Script building blocks', html: `
<pre>#!/bin/bash
set -euo pipefail            # stop on errors, unset variables, failed pipes
TARGET="$1"                  # first argument
if [ -z "$TARGET" ]; then echo "usage: $0 FILE"; exit 1; fi
for ip in $(grep -v "#" scope.txt); do
  echo "checking $ip"
done
COUNT=$(grep -c Failed "$TARGET")     # command substitution
echo "failures: $COUNT"</pre>
<ul>
  <li><strong>Quote variables</strong> (<code>"$1"</code>) so filenames with spaces don't break the script.</li>
  <li><strong>Exit codes:</strong> 0 means success. <code>$?</code> holds the last one, and <code>&amp;&amp;</code> runs the next command only on success.</li>
  <li>A script runs with the rights of whoever runs it. Never run an unread script with sudo.</li>
</ul>` },
        { h: 'Where scripts matter in security', html: `
<p>Scripts automate checks across servers, parse logs, collect evidence and enforce configuration. On the defensive side, scheduled scripts (cron jobs, systemd timers) are also where unauthorized persistence can hide, so they're reviewed during audits.</p>` },
      ],
      misconceptions: ['If bash script.sh works, ./script.sh will too. (Direct execution also needs the x bit.)', 'Quoting variables is optional. (Unquoted variables break on spaces and special characters.)'],
      examTraps: ['"Permission denied" running a script you own → chmod +x.'],
      onTheJob: 'Admins and analysts write scripts constantly. Your Bash track and the Projects build this skill hands-on.',
      checks: [
        { q: 'A script runs with "bash backup.sh" but "./backup.sh" says Permission denied. Why?', options: ['The shebang is wrong', 'The file lacks execute permission; bash FILE only needs read', 'The disk is full', 'You need a different shell'], answer: 1, why: ['A wrong shebang gives a different error.', 'Direct execution checks the x bit; running it through bash doesn\'t.', 'Unrelated to this error.', 'Not the cause.'] },
      ],
      sources: [
        { title: 'GNU Bash Reference Manual', url: 'https://www.gnu.org/software/bash/manual/bash.html' },
        { title: 'ShellCheck: finds bugs in shell scripts', url: 'https://www.shellcheck.net/' },
      ],
    },

  });
})(typeof window !== 'undefined' ? window : globalThis);
