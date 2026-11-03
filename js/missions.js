/*
 * missions.js — scenario-based exercises ("missions") that unlock as the
 * learner finishes stages of the path.
 *
 * Each mission is an investigation inside a simulated company (Harborview
 * Logistics, fictional). The learner digs through evidence files in the
 * sandbox terminal, answers questions, and makes decisions. A simulated
 * adversary reacts to those decisions.
 *
 * Support fades as missions advance (Kalyuga, 2007, expertise reversal effect):
 *   Guided      — hints are shown up front
 *   Supported   — hints are available on request
 *   Independent — no hints
 *
 * All names, domains (.example) and IP addresses (RFC 5737 documentation
 * ranges) are reserved for documentation, so none of them are real.
 *
 * Step types:
 *   question — {q: quiz|input item, hint?, solve?}; solve = a reference shell
 *              command, checked by the test suite against the mission files
 *   event    — narrative: what the adversary or the environment does next
 *   decision — {prompt, options:[{text, score 0–2, outcome}]}; no retries
 */
(function (root) {
  'use strict';

  // ---------- generated evidence ----------
  function pad(n) { return String(n).padStart(2, '0'); }

  function bruteForceLog() {
    const out = [];
    const users = ['root', 'admin', 'test', 'oracle', 'ubuntu', 'backup', 'git', 'postgres'];
    let pid = 3100;
    // Normal activity earlier in the day.
    out.push('Nov 03 01:02:11 web01 sshd[3001]: Accepted publickey for deploy from 10.20.0.5 port 50122 ssh2');
    out.push('Nov 03 01:40:55 web01 sshd[3017]: Accepted publickey for alice from 10.20.0.21 port 50877 ssh2');
    // Noisy scanner: 12 failures from 192.0.2.77.
    for (let i = 0; i < 12; i++) {
      out.push(`Nov 03 02:0${Math.floor(i / 6)}:${pad((i * 9) % 60)} web01 sshd[${pid++}]: Failed password for ${users[i % 3]} from 192.0.2.77 port ${41000 + i} ssh2`);
    }
    // Main attacker: 40 failures from 198.51.100.23, cycling through usernames.
    for (let i = 0; i < 40; i++) {
      const m = 14 + Math.floor(i / 12);
      out.push(`Nov 03 02:${m}:${pad((i * 5) % 60)} web01 sshd[${pid++}]: Failed password for ${users[i % users.length]} from 198.51.100.23 port ${52000 + i} ssh2`);
    }
    out.push(`Nov 03 02:18:02 web01 sshd[${pid++}]: Accepted password for backup from 198.51.100.23 port 52090 ssh2`);
    out.push('Nov 03 02:18:02 web01 sshd[' + (pid - 1) + ']: pam_unix(sshd:session): session opened for user backup');
    out.push('Nov 03 08:15:40 web01 sshd[' + (pid++) + ']: Failed password for carol from 10.20.0.22 port 50311 ssh2');
    out.push('Nov 03 08:15:49 web01 sshd[' + (pid++) + ']: Accepted password for carol from 10.20.0.22 port 50312 ssh2');
    return out.join('\n') + '\n';
  }

  function s3AccessLog() {
    const lines = [];
    const role = 'arn:aws:sts::111122223333:assumed-role/app-server/i-0abc12';
    const files = ['exports/customers-2026-09.csv', 'exports/customers-2026-10.csv', 'exports/orders-2026-10.csv'];
    // Normal app traffic.
    for (let d = 1; d <= 4; d++) lines.push(`2026-11-0${d}T01:00:0${d}Z hv-customer-exports ${role} 10.20.0.40 REST.PUT.OBJECT ${files[d % 3]} 200`);
    // Anonymous downloads ("-" requester) from an unknown address.
    const anon = [1, 1, 1, 1, 1, 1, 0, 0, 2];
    anon.forEach((f, i) => lines.push(`2026-11-02T03:${pad(10 + i)}:4${i}Z hv-customer-exports - 198.51.100.200 REST.GET.OBJECT ${files[f]} 200`));
    lines.push(`2026-11-02T03:30:00Z hv-customer-exports - 198.51.100.200 REST.GET.OBJECT exports/../ 403`);
    return lines.sort().join('\n') + '\n';
  }

  function azureActivityLog() {
    const L = [];
    const e = (o) => L.push(JSON.stringify(o));
    e({ time: '2026-11-01T09:12:00Z', caller: 'priya.n@harborview.example', operation: 'Microsoft.Compute/virtualMachines/write', resource: 'vm-web-01', status: 'Succeeded', ip: '10.20.0.31' });
    for (let i = 1; i <= 6; i++) {
      e({ time: `2026-11-02T02:0${i}:15Z`, caller: 'ci-deploy-sp', operation: 'Microsoft.Compute/virtualMachines/write', resource: `gpu-node-${i}`, size: 'Standard_NC24', status: 'Succeeded', ip: '203.0.113.9' });
    }
    e({ time: '2026-11-02T02:09:51Z', caller: 'ci-deploy-sp', operation: 'Microsoft.Authorization/roleAssignments/write', role: 'Contributor', assignee: 'svc-backup-sync', scope: '/subscriptions/0000-prod', status: 'Succeeded', ip: '203.0.113.9' });
    e({ time: '2026-11-02T10:30:00Z', caller: 'ci-deploy-sp', operation: 'Microsoft.Web/sites/write', resource: 'app-orders', status: 'Succeeded', ip: '10.20.0.5' });
    return L.join('\n') + '\n';
  }

  // ---------- missions ----------
  const missions = [
    {
      id: 'm1',
      title: 'First Ticket',
      requires: 'aplus1',
      level: 'Guided',
      adversary: 'None yet. Your opponent is a vague problem report and the urge to guess.',
      briefing: `<p>It's your first day on the Harborview Logistics help desk. A ticket arrives: <em>"The internet is broken. Nothing works. Please fix ASAP!!"</em></p>
<p>The user's laptop details are in your home folder. Use the terminal: <code>ls</code> to see the files, <code>cat FILE</code> to read one.</p>`,
      files: {
        'ticket.txt': 'Ticket #4471\nUser: dana.cho (Accounting)\nReported: "The internet is broken. Nothing works. Please fix ASAP!!"\nNotes: User moved desks this morning. Laptop is docked.\n',
        'ipconfig.txt': 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . :\n   Autoconfiguration IPv4 Address. . : 169.254.33.10\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . :\n',
      },
      steps: [
        { type: 'question', hint: 'cat ipconfig.txt', solve: 'cat ipconfig.txt', q: { type: 'input', question: 'What IPv4 address does the laptop have?', accept: ['169.254.33.10'], explain: 'It’s in the "Autoconfiguration IPv4 Address" line.' } },
        { type: 'question', hint: 'Remember the A+ lesson on APIPA.', q: { type: 'quiz', question: 'What does an address starting with 169.254 tell you?', options: ['DNS failed', 'The PC could not get an address from DHCP', 'The PC is hacked', 'Everything is fine'], answer: 1, explain: 'APIPA addresses are self-assigned when DHCP fails. No default gateway confirms it.' } },
        { type: 'question', hint: 'cat ticket.txt and look at the Notes line.', solve: 'grep Notes ticket.txt', q: { type: 'quiz', question: 'Which detail in the ticket is the best clue?', options: ['The user is in Accounting', 'The user moved desks this morning', 'The ticket number', 'They wrote ASAP'], answer: 1, explain: 'Something changed: always ask what changed. A new desk means a new cable, dock or wall port.' } },
        { type: 'decision', prompt: 'What do you do first?', options: [
          { text: 'Reimage the laptop with a fresh copy of Windows', score: 0, outcome: 'Two hours later the laptop is freshly installed, and still shows 169.254. The user has lost their unsaved work. Question the obvious first.' },
          { text: 'Check the physical connection: the dock’s network cable and the wall port', score: 2, outcome: 'The dock’s network cable is plugged into the wrong wall port: one that isn’t patched to a switch. You move it, run ipconfig /renew, and get 10.20.0.57. Fixed.' },
          { text: 'Call the internet provider', score: 0, outcome: 'The provider confirms the building connection is fine. Everyone else is working, so the problem is local to this one laptop.' },
          { text: 'Escalate to the network team immediately', score: 1, outcome: 'The network team, slightly annoyed, points out it’s a cabling issue you could have checked yourself. Escalating is fine, but only after you’ve tested the obvious theories.' },
        ] },
        { type: 'question', q: { type: 'quiz', question: 'The user is back online and confirms everything works. Per the CompTIA method, what’s left?', options: ['Nothing, close the ticket', 'Document findings, actions and outcomes', 'Reboot again to be sure', 'Order a new laptop'], answer: 1, explain: 'Document it. The next tech who sees "169.254 after a desk move" will thank you.' } },
      ],
      debrief: [
        'Gather evidence before acting. The ipconfig output told you the problem layer.',
        'Ask "what changed?" Recent changes cause most problems.',
        'Question the obvious: Physical → Addressing → Gateway → DNS.',
        'The investigation habit you just used (evidence, theory, test, act, document) is the same one a SOC analyst uses on an intrusion.',
      ],
    },

    {
      id: 'm2',
      title: 'The Phish',
      requires: 'aplus2',
      level: 'Guided',
      adversary: 'A credential-phishing crew using a lookalike domain and MFA push-spamming.',
      briefing: `<p>Monday, 08:30. Several Harborview staff have forwarded a suspicious email to the security inbox. Your job: work out what it is, who's affected, and contain it.</p>
<p>Evidence: <code>inbox/suspicious.eml</code>, <code>logs/mail.log</code> (mail gateway), <code>logs/proxy.log</code> (web proxy), and <code>logs/signin.log</code> (identity provider).</p>`,
      files: {
        'inbox/suspicious.eml': [
          'From: "Harborview IT Service Desk" <it-support@harb0rview-it.example>',
          'Reply-To: reset@harb0rview-it.example',
          'To: jordan.lee@harborview.example',
          'Subject: URGENT: Your password expires in 2 hours',
          'Date: Mon, 03 Nov 2026 08:02:44 +0000',
          '',
          'Dear user,',
          'Your mailbox password will expire in 2 hours. To avoid losing access,',
          'verify your account now:',
          '',
          '  https://login.harb0rview-it.example/verify?u=jordan.lee',
          '',
          'Harborview IT Service Desk',
        ].join('\n') + '\n',
        'logs/mail.log': [
          '2026-11-03T08:02:44Z delivered from=it-support@harb0rview-it.example to=jordan.lee@harborview.example',
          '2026-11-03T08:02:44Z delivered from=it-support@harb0rview-it.example to=sam.ortiz@harborview.example',
          '2026-11-03T08:02:45Z delivered from=it-support@harb0rview-it.example to=priya.n@harborview.example',
          '2026-11-03T08:02:45Z delivered from=it-support@harb0rview-it.example to=dana.cho@harborview.example',
          '2026-11-03T08:02:46Z delivered from=it-support@harb0rview-it.example to=lee.wong@harborview.example',
          '2026-11-03T08:05:10Z delivered from=payroll@harborview.example to=all-staff@harborview.example',
        ].join('\n') + '\n',
        'logs/proxy.log': [
          '2026-11-03T08:01:12Z user=priya.n GET https://intranet.harborview.example/ 200',
          '2026-11-03T08:06:30Z user=jordan.lee GET https://login.harb0rview-it.example/verify?u=jordan.lee 200',
          '2026-11-03T08:06:58Z user=jordan.lee POST https://login.harb0rview-it.example/verify 302',
          '2026-11-03T08:11:03Z user=sam.ortiz GET https://login.harb0rview-it.example/verify?u=sam.ortiz 200',
          '2026-11-03T08:11:40Z user=sam.ortiz POST https://login.harb0rview-it.example/verify 302',
          '2026-11-03T08:14:22Z user=dana.cho GET https://news.example.org/ 200',
        ].join('\n') + '\n',
        'logs/signin.log': [
          '2026-11-03T07:58:00Z user=jordan.lee ip=10.20.0.44 result=success mfa=approved',
          '2026-11-03T08:07:31Z user=jordan.lee ip=203.0.113.50 result=mfa_denied',
          '2026-11-03T08:07:52Z user=jordan.lee ip=203.0.113.50 result=mfa_denied',
          '2026-11-03T08:08:14Z user=jordan.lee ip=203.0.113.50 result=mfa_denied',
          '2026-11-03T08:08:40Z user=jordan.lee ip=203.0.113.50 result=success mfa=approved',
          '2026-11-03T08:12:20Z user=sam.ortiz ip=203.0.113.50 result=mfa_denied',
          '2026-11-03T08:13:01Z user=sam.ortiz ip=203.0.113.50 result=mfa_denied',
        ].join('\n') + '\n',
      },
      steps: [
        { type: 'question', hint: 'cat inbox/suspicious.eml and read the From: line carefully, character by character.', solve: 'grep From inbox/suspicious.eml', q: { type: 'input', question: 'What domain did the email REALLY come from (the part after the @)?', accept: ['harb0rview-it.example'], explain: 'harb0rview, with a zero, not the real harborview.example. The display name "Harborview IT Service Desk" can be set to anything.' } },
        { type: 'question', hint: 'grep -c harb0rview logs/mail.log', solve: 'grep -c harb0rview logs/mail.log', q: { type: 'input', question: 'How many employees received the phishing email?', accept: ['5', 'five'], explain: 'Five deliveries came from the lookalike domain.' } },
        { type: 'question', hint: 'grep harb0rview logs/proxy.log, then look for POST lines (form submissions).', solve: 'grep POST logs/proxy.log | grep -c harb0rview', q: { type: 'input', question: 'How many users SUBMITTED the fake login form (POST)?', accept: ['2', 'two'], explain: 'jordan.lee and sam.ortiz both POSTed to the fake site, so assume their passwords are stolen.' } },
        { type: 'event', text: 'The adversary moves: within a minute of each submission, someone at 203.0.113.50 starts trying to sign in as those users, firing off MFA push requests again and again, hoping someone taps "Approve" just to make it stop.' },
        { type: 'question', hint: 'grep 203.0.113.50 logs/signin.log and look for result=success.', solve: 'grep 203.0.113.50 logs/signin.log | grep success', q: { type: 'input', question: 'Which account did the attacker actually get into? (username)', accept: ['jordan.lee'], explain: 'After three denied pushes, jordan.lee approved the fourth. This is "MFA fatigue". sam.ortiz kept denying.' } },
        { type: 'decision', prompt: 'jordan.lee’s account is in the attacker’s hands right now. What’s your first containment move?', options: [
          { text: 'Email all staff a warning, then wait to see what happens', score: 1, outcome: 'The warning helps, but the attacker is still inside jordan.lee’s mailbox and quietly creates a rule forwarding all mail to an outside address.' },
          { text: 'Reset jordan.lee’s password, revoke all active sessions, and review their MFA methods and mailbox rules', score: 2, outcome: 'The attacker’s session drops. They try the stolen password again and fail. You find and remove a forwarding rule they created 40 seconds earlier. Contained.' },
          { text: 'Delete jordan.lee’s account entirely', score: 0, outcome: 'The attacker is out, but so is jordan.lee, and you’ve destroyed the mailbox evidence you needed to see what was taken. Containment shouldn’t wreck the investigation.' },
          { text: 'Reply to the attacker to let them know they’ve been caught', score: 0, outcome: 'The attacker, now warned, rushes to download as much as possible before you act. Never tip off the adversary.' },
        ] },
        { type: 'decision', prompt: 'sam.ortiz also gave away their password, but denied every MFA push. What now?', options: [
          { text: 'Nothing. MFA stopped it.', score: 0, outcome: 'Two days later the attacker tries again with the same password, and this time sam.ortiz is tired and taps Approve.' },
          { text: 'Reset sam.ortiz’s password too, and thank them for reporting the pushes', score: 2, outcome: 'The stolen password is now useless. Praising the report encourages others to speak up.' },
        ] },
        { type: 'decision', prompt: 'How do you make this less likely next time?', options: [
          { text: 'Ban all links in email', score: 0, outcome: 'The business can’t function, and staff route around the rule using personal email. Controls must be workable.' },
          { text: 'Phishing-resistant MFA (FIDO2 keys or number matching), block the lookalike domain, and run short targeted training', score: 2, outcome: 'Defense in depth: even a successful phish no longer yields a usable login.' },
          { text: 'Annual training slideshow only', score: 1, outcome: 'Better than nothing, but training alone doesn’t stop a well-crafted phish. Pair it with technical controls.' },
        ] },
      ],
      debrief: [
        'The display name is decoration. Check the actual sending domain.',
        'Correlate logs: mail (who received), proxy (who clicked and submitted), sign-in (who was compromised).',
        'Contain the identity first (reset, revoke sessions), and preserve evidence.',
        'MFA push fatigue is real. Phishing-resistant MFA closes that gap.',
        'Maps to: A+ Core 2 (social engineering), Security+ (security operations, incident response).',
      ],
    },

    {
      id: 'm3',
      title: 'Knocking at the Door',
      requires: 'network',
      level: 'Supported',
      adversary: 'An automated password-guessing campaign against an internet-facing SSH server.',
      briefing: `<p>The overnight on-call engineer noticed "a lot of SSH noise" on <strong>web01</strong>, an internet-facing Linux server. Find out who was knocking, whether anyone got in, and what to do about it.</p>
<p>Evidence: <code>logs/auth.log</code>. This log is too long to read line by line. Use pipes: <code>grep</code>, <code>cut</code>, <code>sort</code>, <code>uniq -c</code>, <code>wc -l</code>.</p>`,
      files: { 'logs/auth.log': bruteForceLog() },
      steps: [
        { type: 'question', hint: 'grep Failed logs/auth.log | cut -d " " -f 11 | sort | uniq -c | sort -rn', solve: 'grep Failed logs/auth.log | cut -d " " -f 11 | sort | uniq -c | sort -rn | head -n 1', q: { type: 'input', question: 'Which source IP has the MOST failed logins?', accept: ['198.51.100.23'], explain: 'Counting failures per IP (cut the IP field, sort, uniq -c, sort -rn) shows 198.51.100.23 at the top.' } },
        { type: 'question', hint: 'grep Failed logs/auth.log | grep 198.51.100.23 | wc -l', solve: 'grep Failed logs/auth.log | grep -c 198.51.100.23', q: { type: 'input', question: 'How many failed attempts came from that IP?', accept: ['40'], explain: '40 failures in about four minutes, cycling through common usernames: an automated guessing attack.' } },
        { type: 'question', hint: 'grep Accepted logs/auth.log', solve: 'grep Accepted logs/auth.log | grep 198.51.100.23', q: { type: 'input', question: 'Did the attacker get in? If so, which account did they get into?', accept: ['backup'], explain: 'An "Accepted password for backup from 198.51.100.23" line confirms it. A service account with a guessable password.' } },
        { type: 'question', q: { type: 'quiz', question: 'The other IP, 192.0.2.77, failed 12 times and never succeeded. How should you treat it?', options: ['Ignore it; the internet is noisy', 'Note it as background scanning, possibly block it, and focus on the successful intrusion', 'Treat it as the main incident', 'Report it to the police first'], answer: 1, explain: 'Triage: prioritize confirmed compromise over unsuccessful noise.' } },
        { type: 'decision', prompt: 'It’s 08:30. The attacker has had shell access as "backup" since 02:18. What do you do?', options: [
          { text: 'Block 198.51.100.23 at the firewall and close the ticket', score: 0, outcome: 'At 09:02, a new login for "backup" arrives from 203.0.113.80. The attacker still has the password and just switched IPs. Blocking an IP treats the symptom, not the cause.' },
          { text: 'Lock the backup account, kill its sessions, preserve the logs and a disk snapshot, then block the IP and investigate what was done', score: 2, outcome: 'The attacker is cut off, and when they try again from a new IP, the login fails. Your snapshot later shows they installed a crypto-miner, which you can now eradicate with confidence.' },
          { text: 'Immediately shut down and wipe web01', score: 1, outcome: 'The attacker is out, but the company’s website is down for a day, and with no evidence you can’t tell what they took or whether they reached other machines.' },
          { text: 'Do nothing; it’s only a backup account', score: 0, outcome: 'The "backup" account can read the database dumps. Customer data leaves the network that night.' },
        ] },
        { type: 'event', text: 'The adversary probes again: twenty minutes after containment, the same campaign starts guessing passwords from three new IP addresses. This attacker is automated and patient.' },
        { type: 'decision', prompt: 'How do you harden SSH so this whole class of attack stops working?', options: [
          { text: 'Disable password logins (keys only), stop allowing SSH from 0.0.0.0/0, and add rate-limiting/lockout', score: 2, outcome: 'Password guessing becomes pointless, because there’s no password to guess and the port isn’t open to the world.' },
          { text: 'Move SSH from port 22 to port 2222', score: 0, outcome: 'Scanners find the new port within hours. Hiding something isn’t the same as securing it.' },
          { text: 'Make the backup account’s password longer', score: 1, outcome: 'Helps for that one account, but every other password-based account is still exposed.' },
        ] },
      ],
      debrief: [
        'Pipelines turn thousands of log lines into answers: grep → cut → sort → uniq -c → sort -rn.',
        'Separate noise (failed scans) from signal (a success after many failures).',
        'Contain at the root cause (credentials), not just the symptom (one IP).',
        'Preserve evidence before you change things.',
        'Maps to: Network+ (network security), Security+ (security operations), PenTest+ (why weak credentials are a top finding).',
      ],
    },

    {
      id: 'm4',
      title: 'Ransom Note',
      requires: 'secplus',
      level: 'Supported',
      adversary: 'A ransomware affiliate group using phishing for initial access and data theft as extra leverage ("double extortion").',
      briefing: `<p>Tuesday, 06:40. Finance staff can't open anything on the shared drive. Every file now ends in <code>.locked</code>, and a note has appeared. You're leading the response.</p>
<p>Evidence: <code>share/finance/</code>, <code>logs/edr.log</code> (endpoint detection), <code>backups/report.txt</code>.</p>`,
      files: {
        'share/finance/Q3-budget.xlsx.locked': '\u0000\u0013encrypted\u0007\n',
        'share/finance/payroll-oct.csv.locked': '\u0000\u0013encrypted\u0007\n',
        'share/finance/vendors.docx.locked': '\u0000\u0013encrypted\u0007\n',
        'share/finance/README_RESTORE.txt': 'Your files are encrypted. We have also copied your data.\nContact us within 72 hours or the data will be published.\n(Training scenario. Fictional.)\n',
        'logs/edr.log': [
          '2026-11-03T16:41:02Z host=ACCT-PC07 user=dana.cho process=OUTLOOK.EXE event=attachment_opened file=Invoice_8841.docm',
          '2026-11-03T16:41:09Z host=ACCT-PC07 user=dana.cho process=WINWORD.EXE event=macro_executed',
          '2026-11-03T16:41:10Z host=ACCT-PC07 user=dana.cho process=powershell.exe parent=WINWORD.EXE event=network_connect dest=198.51.100.77:443',
          '2026-11-04T01:52:30Z host=ACCT-PC07 user=dana.cho process=rclone.exe event=network_upload dest=198.51.100.77:443 bytes=4210000000',
          '2026-11-04T02:30:12Z host=ACCT-PC07 user=dana.cho process=vssadmin.exe event=shadow_copy_delete_attempt',
          '2026-11-04T02:31:00Z host=ACCT-PC07 user=dana.cho process=svch0st.exe event=mass_file_rename ext=.locked target=\\\\FS01\\finance',
          '2026-11-04T02:31:05Z host=FS01 process=System event=mass_file_modify source=ACCT-PC07',
        ].join('\n') + '\n',
        'backups/report.txt': 'Backup report FS01\n2026-11-01 23:00 FULL      status=success  copy=offline-tape  verified=yes\n2026-11-02 23:00 INCREMENT status=success  copy=online-nas    verified=yes\n2026-11-03 23:00 INCREMENT status=success  copy=online-nas    verified=no\nNOTE: online-nas is mounted on FS01\n',
      },
      steps: [
        { type: 'question', hint: 'grep mass_file_rename logs/edr.log, or look at which host appears first.', solve: 'grep mass_file_rename logs/edr.log', q: { type: 'input', question: 'Which host started the encryption ("patient zero")?', accept: ['ACCT-PC07', 'acct-pc07'], explain: 'ACCT-PC07 ran the renaming process against \\\\FS01\\finance.' } },
        { type: 'question', hint: 'grep powershell logs/edr.log and look at parent=', solve: 'grep -o "parent=[A-Z.]*" logs/edr.log', q: { type: 'input', question: 'Which program launched PowerShell (the parent process)?', accept: ['WINWORD.EXE', 'winword.exe', 'winword', 'word'], explain: 'Word ran a macro from Invoice_8841.docm, opened from Outlook. Initial access was a phishing attachment, the day BEFORE encryption.' } },
        { type: 'question', hint: 'grep upload logs/edr.log', solve: 'grep upload logs/edr.log', q: { type: 'quiz', question: 'What does the rclone.exe upload at 01:52 tell you?', options: ['A normal backup ran', 'About 4.2 GB of data was stolen before encryption', 'Windows Update ran', 'Nothing important'], answer: 1, explain: 'Exfiltration before encryption is "double extortion": they can threaten to publish even if you restore from backup.' } },
        { type: 'decision', prompt: 'Encryption may still be spreading. What do you do first?', options: [
          { text: 'Isolate ACCT-PC07 (and FS01) from the network using the EDR tool, keeping them powered on', score: 2, outcome: 'Spread stops. Because you didn’t power them off, the memory contents (which may hold encryption keys and attacker tools) are preserved for forensics.' },
          { text: 'Pay the ransom right away to get the business running', score: 0, outcome: 'You fund the criminals, there’s no guarantee the decryptor works, and the stolen data may be published anyway. Payment decisions belong to leadership and legal counsel, not the first responder.' },
          { text: 'Start restoring backups onto FS01 immediately', score: 0, outcome: 'The attacker still has access through ACCT-PC07, and your freshly restored files get encrypted again. Contain before you recover.' },
          { text: 'Power off every server in the company', score: 1, outcome: 'Spread stops, but so does the whole business, and volatile evidence in memory is lost. Isolate in a targeted way where you can.' },
        ] },
        { type: 'event', text: 'The adversary turns up the pressure: an email arrives at the CEO’s address with a sample of the stolen payroll file. "72 hours. Then everything is public."' },
        { type: 'decision', prompt: 'Who needs to be involved now?', options: [
          { text: 'Keep it inside IT so it doesn’t leak', score: 0, outcome: 'Leadership learns about it from a journalist. Breach notification deadlines may now be missed, which is a legal problem on top of a technical one.' },
          { text: 'Follow the incident response plan: leadership, legal counsel, the cyber-insurer, and law enforcement as advised', score: 2, outcome: 'Legal assesses notification duties for the stolen payroll data, the insurer brings in a specialist firm, and decisions are made by the people who own the risk.' },
          { text: 'Negotiate with the attackers yourself to buy time', score: 0, outcome: 'Untrained negotiation can make things worse and creates legal exposure. Leave it to specialists, if anyone does it at all.' },
        ] },
        { type: 'question', hint: 'cat backups/report.txt and read the NOTE line.', solve: 'cat backups/report.txt', q: { type: 'quiz', question: 'Which backup can you trust most for recovery?', options: ['The 11-03 increment on online-nas', 'The 11-01 FULL on offline tape (verified)', 'The ransomware note', 'None'], answer: 1, explain: 'The NAS was mounted on FS01, so assume it’s compromised too. The offline, verified full backup is your clean restore point. This is the 3-2-1 rule paying off.' } },
        { type: 'question', q: { type: 'quiz', question: 'After containment, the incident response process goes on to…', options: ['Lessons learned', 'Eradication, then recovery', 'Preparation', 'Detection'], answer: 1, explain: 'Remove the attacker’s foothold (eradication) before restoring (recovery). Lessons learned comes last.' } },
      ],
      debrief: [
        'The visible event (encryption) came about 10 hours after the real breach (phishing and macro). Look back further.',
        'Data theft before encryption means restoring backups doesn’t end the incident.',
        'Isolate, don’t power off: you keep the evidence and stop the spread.',
        'Offline, verified backups (3-2-1) are what make recovery possible.',
        'Ransomware is a business crisis. Leadership, legal and insurers own the key decisions.',
        'Maps to: Security+ (incident response, threats and mitigations), A+ Core 2 (malware, backups).',
      ],
    },

    {
      id: 'm5',
      title: 'Open Bucket',
      requires: 'aws',
      level: 'Independent',
      adversary: 'Opportunistic scanners that constantly sweep the internet for publicly readable cloud storage.',
      briefing: `<p>Harborview's AWS cost report shows unusual data-transfer charges on the <strong>hv-customer-exports</strong> S3 bucket. The bucket should be private. Investigate.</p>
<p>Evidence: <code>aws/bucket-policy.json</code>, <code>aws/s3-access.log</code> (format: time bucket requester ip operation key status; a requester of "-" means anonymous), <code>aws/cloudtrail.log</code>.</p>`,
      files: {
        'aws/bucket-policy.json': JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            { Sid: 'AllowAppServerRole', Effect: 'Allow', Principal: { AWS: 'arn:aws:iam::111122223333:role/app-server' }, Action: 's3:*', Resource: ['arn:aws:s3:::hv-customer-exports', 'arn:aws:s3:::hv-customer-exports/*'] },
            { Sid: 'TempShareForVendor', Effect: 'Allow', Principal: '*', Action: 's3:GetObject', Resource: 'arn:aws:s3:::hv-customer-exports/*' },
          ],
        }, null, 2) + '\n',
        'aws/s3-access.log': s3AccessLog(),
        'aws/cloudtrail.log': [
          '{"eventTime":"2026-10-20T16:02:11Z","eventName":"DeletePublicAccessBlock","userName":"dev-temp","sourceIP":"10.20.0.66","bucket":"hv-customer-exports"}',
          '{"eventTime":"2026-10-20T16:03:40Z","eventName":"PutBucketPolicy","userName":"dev-temp","sourceIP":"10.20.0.66","bucket":"hv-customer-exports"}',
          '{"eventTime":"2026-10-28T09:00:00Z","eventName":"ConsoleLogin","userName":"priya.n","sourceIP":"10.20.0.31"}',
        ].join('\n') + '\n',
      },
      steps: [
        { type: 'question', solve: 'grep Sid aws/bucket-policy.json', q: { type: 'input', question: 'Which policy statement (its "Sid") makes the bucket readable by anyone?', accept: ['TempShareForVendor'], explain: '"Principal": "*" with s3:GetObject means anyone on the internet can download every object.' } },
        { type: 'question', solve: 'grep " - " aws/s3-access.log | grep -c "GET.OBJECT.* 200"', q: { type: 'input', question: 'How many SUCCESSFUL anonymous downloads (status 200) are in the access log?', accept: ['9', 'nine'], explain: 'Nine GET requests by "-" (anonymous) returned 200. Customer data was taken.' } },
        { type: 'question', solve: 'grep " - " aws/s3-access.log | cut -d " " -f 4 | sort | uniq', q: { type: 'input', question: 'From which IP address did the anonymous downloads come?', accept: ['198.51.100.200'], explain: 'All anonymous requests came from 198.51.100.200.' } },
        { type: 'question', solve: 'grep " - " aws/s3-access.log | grep " 200" | cut -d " " -f 6 | sort | uniq -c | sort -rn | head -n 1', q: { type: 'input', question: 'Which file was downloaded anonymously the most times? (give the key, e.g. exports/name.csv)', accept: ['exports/customers-2026-10.csv'], explain: 'customers-2026-10.csv was pulled 6 times. That’s the file at the heart of the breach assessment.' } },
        { type: 'question', solve: 'grep PutBucketPolicy aws/cloudtrail.log', q: { type: 'input', question: 'Which IAM user changed the bucket policy?', accept: ['dev-temp'], explain: 'CloudTrail shows dev-temp removed Block Public Access, then put the new policy, on 2026-10-20.' } },
        { type: 'decision', prompt: 'What’s your response?', options: [
          { text: 'Delete the bucket so nobody can get the data', score: 0, outcome: 'The live application breaks, you lose the data and the server-side evidence, and the downloads have already happened. Deleting isn’t the same as containing.' },
          { text: 'Remove the public statement, re-enable Block Public Access, preserve the logs, then work out exactly what data was exposed and bring in legal for notification', score: 2, outcome: 'Exposure is closed within minutes. Legal confirms the October customer export includes personal data, so notification obligations apply. You had the evidence they needed.' },
          { text: 'Block 198.51.100.200 in the bucket policy', score: 0, outcome: 'Another scanner, from a different IP, finds the bucket that evening. The bucket is still public to everyone else.' },
          { text: 'Ask dev-temp why they did it before doing anything else', score: 1, outcome: 'It was a "temporary" vendor share that was never removed: useful context. But the data kept leaking while you talked. Contain first, ask questions second.' },
        ] },
        { type: 'decision', prompt: 'How do you prevent this class of mistake across the whole AWS account?', options: [
          { text: 'Turn on account-level S3 Block Public Access, use presigned URLs for vendor sharing, and alert on PutBucketPolicy and DeletePublicAccessBlock events', score: 2, outcome: 'A single developer can no longer make a bucket public by accident, and if anyone tries, you’ll know.' },
          { text: 'Remove dev-temp’s account and move on', score: 1, outcome: 'It addresses one person, not the process. The next developer with similar permissions can make the same mistake.' },
          { text: 'Tell developers to be more careful', score: 0, outcome: 'Hoping isn’t a control.' },
        ] },
      ],
      debrief: [
        'Most cloud breaches are configuration mistakes on the customer side of the shared responsibility model.',
        '"Principal": "*" in a resource policy means the whole internet.',
        'Access logs tell you WHAT left; CloudTrail tells you WHO changed the control.',
        'Temporary exceptions become permanent unless they expire automatically, which is why presigned URLs are better than open buckets.',
        'Maps to: AWS CLF-C02 (Security & Compliance), Security+ (security architecture, data protection).',
      ],
    },

    {
      id: 'm6',
      title: 'Leaked Secret',
      requires: 'azure',
      level: 'Independent',
      adversary: 'An attacker who harvests credentials from public code repositories and uses them for crypto-mining and to keep a way back in (persistence).',
      briefing: `<p>Azure Cost Management alert: spending on the production subscription is up 3,800% overnight. Investigate.</p>
<p>Evidence: <code>azure/activity.log</code> (one JSON event per line), <code>azure/role-assignments.txt</code>, <code>repo/commit-7f3a.txt</code> (a commit to a public repository).</p>`,
      files: {
        'azure/activity.log': azureActivityLog(),
        'azure/role-assignments.txt': 'PRINCIPAL           TYPE               ROLE         SCOPE\npriya.n             User               Owner        /subscriptions/0000-prod\nci-deploy-sp        ServicePrincipal   Owner        /subscriptions/0000-prod\nsvc-backup-sync     ServicePrincipal   Contributor  /subscriptions/0000-prod\nanalysts            Group              Reader       /subscriptions/0000-prod\n',
        'repo/commit-7f3a.txt': 'commit 7f3a91c  (public repo: harborview/deploy-scripts)\nAuthor: ci-bot\nDate:   2026-11-01\n\n+ # deploy.env\n+ AZURE_CLIENT_ID=ci-deploy-sp\n+ AZURE_CLIENT_SECRET=REDACTED-EXAMPLE-VALUE\n+ AZURE_TENANT=harborview.example\n',
      },
      steps: [
        { type: 'question', solve: 'grep ci-deploy-sp azure/role-assignments.txt', q: { type: 'quiz', question: 'What access does ci-deploy-sp have?', options: ['Reader on one resource group', 'Contributor on one resource group', 'Owner on the entire production subscription', 'No access'], answer: 2, explain: 'Owner at subscription scope: it can do anything, including granting access to others. Far more than a deployment pipeline needs.' } },
        { type: 'question', solve: 'grep 203.0.113.9 azure/activity.log | grep -c virtualMachines/write', q: { type: 'input', question: 'How many VMs were created from the unknown IP 203.0.113.9?', accept: ['6', 'six'], explain: 'Six Standard_NC24 GPU VMs: crypto-mining on your bill.' } },
        { type: 'question', solve: 'cat repo/commit-7f3a.txt', q: { type: 'quiz', question: 'How did the attacker most likely get the credential?', options: ['They guessed it', 'The client secret was committed to a public code repository', 'A Microsoft data center was breached', 'An employee sold it'], answer: 1, explain: 'deploy.env, with AZURE_CLIENT_SECRET in it, was pushed to a public repo the day before. Automated bots scan public repositories for secrets within minutes.' } },
        { type: 'event', text: 'The adversary plans to keep access: before you even noticed the bill, they made one more change. Experienced attackers expect to be discovered, so they build a way back in.' },
        { type: 'question', solve: 'grep roleAssignments azure/activity.log', q: { type: 'input', question: 'The attacker granted access to another identity as a backdoor. What is that principal’s name?', accept: ['svc-backup-sync'], explain: 'A roleAssignments/write from 203.0.113.9 gave svc-backup-sync Contributor on the subscription. Its name is chosen to look routine.' } },
        { type: 'decision', prompt: 'Containment. What do you do?', options: [
          { text: 'Delete the six GPU VMs', score: 1, outcome: 'The spending stops, for about an hour. Then six new VMs appear: the leaked secret and the backdoor identity both still work.' },
          { text: 'Revoke ci-deploy-sp’s secret, remove svc-backup-sync’s role assignment and credentials, snapshot one GPU VM for evidence, then delete the rogue VMs and review the logs for anything else', score: 2, outcome: 'Both ways in are closed, the evidence is kept, and the cost stops. The log review finds nothing else. Contained.' },
          { text: 'Delete the production subscription', score: 0, outcome: 'You’ve taken down the company’s production systems yourself. That’s a bigger outage than the attacker caused.' },
        ] },
        { type: 'decision', prompt: 'How do you fix the root causes?', options: [
          { text: 'Switch the pipeline to workload identity federation (no stored secret), reduce it to Contributor on its resource group only, enable secret scanning on repositories, and keep the budget alerts', score: 2, outcome: 'There’s no secret left to leak, a compromise would be limited to one resource group, and leaks get caught before they’re pushed. Every root cause is addressed.' },
          { text: 'Rotate the secret every 90 days', score: 1, outcome: 'Helps a little, but a leaked secret is exploited within minutes, not months, and Owner on the subscription is still far too much.' },
          { text: 'Make the repository private', score: 1, outcome: 'Good hygiene, but the secret is already in the commit history, and private repos can leak too. Remove the secret entirely.' },
        ] },
      ],
      debrief: [
        'Cost anomalies are security signals.',
        'Attackers keep a way back in (persistence). Always check for new identities, role assignments and credentials, not just the obvious damage.',
        'Secrets in code will leak. Prefer managed identities or workload identity federation.',
        'Least privilege limits the damage: Owner on a subscription for a pipeline turned a leak into a full takeover.',
        'Maps to: Azure AZ-900 (identity, governance), Security+ (identity and access management, security operations).',
      ],
    },

    {
      id: 'm7',
      title: 'The Engagement',
      requires: 'practice',
      level: 'Independent',
      adversary: 'Two of them: the pressure to go beyond your authorization, and a real intruder who got there before you.',
      briefing: `<p>You're a junior tester on an authorized penetration test of Harborview Logistics. Professional testers are judged as much on discipline and judgment as on technical skill. This mission tests both.</p>
<p>Evidence: <code>engagement/scope.txt</code>, <code>engagement/roe.txt</code>, <code>engagement/notes.txt</code>.</p>`,
      files: {
        'engagement/scope.txt': 'ENGAGEMENT SCOPE (signed 2026-10-28)\nIn scope:\n  10.20.0.0/24 (internal server network)\n  app.harborview.example (customer web app)\nOut of scope:\n  payroll.paycloud.example (third-party SaaS payroll)\n  any 10.30.0.0/16 address (OT / warehouse systems)\n  denial-of-service testing of any kind\n',
        'engagement/roe.txt': 'RULES OF ENGAGEMENT\nTesting window: Mon-Fri 19:00-23:00 local\nEmergency contact: Morgan Diaz, CISO, +1-555-0100\nIf evidence of a prior or ongoing compromise is found: STOP testing that system and notify the emergency contact immediately.\nAll test accounts and files must be removed at close.\n',
        'engagement/notes.txt': 'Day 2 notes\n19:40 10.20.0.40 web server: directory listing enabled on /uploads\n19:52 /uploads contains file "img_cache.php" dated 2026-09-14 (before engagement start)\n19:55 web log shows requests to img_cache.php?cmd= from 198.51.100.150 since 2026-09-14\n20:10 created test account pt_tester01 on app.harborview.example (approved method)\n',
      },
      steps: [
        { type: 'question', solve: 'cat engagement/scope.txt', q: { type: 'quiz', question: 'Is 10.20.1.15 in scope?', options: ['Yes, it starts with 10.20', 'No, 10.20.0.0/24 only covers 10.20.0.0–10.20.0.255', 'Only during the testing window'], answer: 1, explain: 'A /24 covers just the last octet. 10.20.1.15 is outside it. Subnetting is a legal skill too.' } },
        { type: 'question', solve: 'grep window engagement/roe.txt', q: { type: 'quiz', question: 'You have spare time on Saturday at 20:00. May you keep testing?', options: ['Yes, it’s within hours', 'No, the window is Monday–Friday only', 'Yes, if nobody notices'], answer: 1, explain: 'The rules of engagement set when you may test, not just what.' } },
        { type: 'event', text: 'Pressure, the first adversary: Harborview’s IT manager calls. "While you’re at it, can you take a quick look at our payroll site, payroll.paycloud.example? I’m giving you verbal permission."' },
        { type: 'decision', prompt: 'How do you respond?', options: [
          { text: 'Go ahead. A manager gave permission.', score: 0, outcome: 'PayCloud’s security team detects your activity and reports it. The IT manager had no authority over a third party’s system, so you’ve tested without authorization. That can be a crime.' },
          { text: 'Decline for now: it’s out of scope and owned by a third party. Explain that testing it would need a written scope change from Harborview AND written permission from PayCloud.', score: 2, outcome: 'The manager grumbles, but your lead backs you. The request goes through the proper process for a future engagement. This is what professionalism looks like.' },
          { text: 'Do a "light" check only, nothing intrusive', score: 0, outcome: 'There’s no such thing as a little bit of unauthorized testing. Even light probing of an out-of-scope system breaches the contract and potentially the law.' },
        ] },
        { type: 'event', text: 'The second adversary: back on 10.20.0.40, your notes show something that wasn’t put there by you.' },
        { type: 'question', solve: 'grep 2026-09-14 engagement/notes.txt', q: { type: 'quiz', question: 'What do the notes about img_cache.php most likely mean?', options: ['A normal image cache', 'A web shell planted by a real attacker before the engagement started', 'A file created by your own testing', 'A harmless test file from the vendor'], answer: 1, explain: 'It’s dated before the engagement, takes commands (?cmd=), and has been used from an outside IP for weeks. Someone else is already inside.' } },
        { type: 'decision', prompt: 'What does your RoE require?', options: [
          { text: 'Use the web shell yourself to see how far the attacker got', score: 0, outcome: 'You’ve tampered with evidence of a real crime and acted outside your authorization. The client’s forensics firm can no longer tell your actions apart from the attacker’s.' },
          { text: 'Stop testing that host, preserve your notes, and immediately call the emergency contact (Morgan Diaz)', score: 2, outcome: 'The CISO starts the incident response process within the hour. Your timestamped notes become key evidence. The client later says this was the most valuable finding of the engagement.' },
          { text: 'Keep testing and mention it in the final report next week', score: 0, outcome: 'The intruder spends another week inside the network while you knew about it. The RoE required immediate notification.' },
        ] },
        { type: 'question', solve: 'grep account engagement/notes.txt', q: { type: 'input', question: 'At the end of the engagement, which account you created must be removed? (username)', accept: ['pt_tester01'], explain: 'Clean up everything you add. Leftover test accounts become someone else’s way in.' } },
        { type: 'decision', prompt: 'Which statement belongs in the final report for the directory listing finding?', options: [
          { text: '"The web server is badly configured and insecure."', score: 0, outcome: 'Vague and unhelpful: no evidence, no affected asset, no fix.' },
          { text: '"Directory listing is enabled on 10.20.0.40:/uploads (observed 2026-11-04 19:40, screenshot E-7), exposing file names to unauthenticated users. Disable autoindex in the web server configuration."', score: 2, outcome: 'Specific asset, timestamped evidence, impact and a concrete fix. This is a finding someone can act on.' },
          { text: '"We hacked your web server easily."', score: 0, outcome: 'Unprofessional, and gives the reader nothing to act on.' },
        ] },
      ],
      debrief: [
        'Your authorization is your legal shield. Scope, time window and asset owner all matter.',
        'Verbal permission from someone who doesn’t own the system is not authorization.',
        'Finding a real intruder means stop, preserve and notify, exactly as the RoE says.',
        'Good findings are specific, evidenced and actionable.',
        'Leave nothing behind: clean up test accounts and files.',
        'Maps to: PenTest+ (engagement management, reporting and communication), Security+ (governance).',
      ],
    },
  ];

  // ---------- scoring ----------
  function maxScore(m) {
    return m.steps.filter((s) => s.type === 'question' || s.type === 'decision').length * 2;
  }
  function rating(score, max) {
    const pct = max ? score / max : 0;
    if (pct >= 0.85) return 'Excellent';
    if (pct >= 0.6) return 'Solid';
    return 'Needs another run';
  }
  // Full paths for the shell's virtual filesystem.
  function shellFiles(m) {
    const out = {};
    Object.keys(m.files).forEach((k) => { out['/home/student/' + k] = m.files[k]; });
    return out;
  }

  const api = { missions, maxScore, rating, shellFiles };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CM = root.CM || {}; root.CM.missions = api; }
})(typeof window !== 'undefined' ? window : globalThis);
