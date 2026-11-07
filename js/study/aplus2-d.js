/* study/aplus2-d.js — in-depth notes: A+ Core 2 lessons c10–c13. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    c10: {
      sections: [
        { h: 'The principle: contain first, clean second, prevent a repeat third', html: `
<p>The CompTIA malware removal process follows the same logic as incident response: stop the damage from spreading, remove the cause completely, then make sure it doesn't come back. Each step exists to prevent a specific failure.</p>` },
        { h: 'The seven steps, and why each one exists', html: `
<ol>
  <li><strong>Investigate and verify the symptoms:</strong> confirm it really is malware, not a hardware or software fault.</li>
  <li><strong>Quarantine the system:</strong> disconnect it from the network so it can't spread or keep sending data out.</li>
  <li><strong>Disable System Restore</strong> (Windows): existing restore points may contain the malware and could bring it back.</li>
  <li><strong>Remediate:</strong> update the anti-malware definitions, then scan and remove, using Safe Mode or an offline boot scan if needed.</li>
  <li><strong>Schedule scans and run updates:</strong> patch the hole it likely came through.</li>
  <li><strong>Enable System Restore and create a new restore point:</strong> a clean baseline for the future.</li>
  <li><strong>Educate the end user:</strong> how it likely arrived and how to avoid a repeat.</li>
</ol>` },
        { h: 'When to rebuild instead', html: `
<p>If there are signs of a rootkit, credential theft or administrator-level compromise, cleaning may not be trustworthy, so reimaging from a known-good source is the safer choice. Also change any passwords that were used on the infected machine.</p>` },
      ],
      misconceptions: ['Running one scan is enough. (Update definitions first, verify afterwards, and fix the cause.)', 'You can skip quarantine for a quick clean. (Spread and data loss can continue meanwhile.)'],
      examTraps: ['Know the exact order. Questions ask for the NEXT step.', 'System Restore is disabled before remediation and re-enabled after.'],
      onTheJob: 'Help desk and endpoint teams follow this process. In larger organizations it hands off to the incident response team when the infection is serious.',
      checks: [
        { q: 'A technician scans an infected PC with antivirus definitions that are two months old and finds nothing. What was missed?', options: ['Nothing; the PC is clean', 'Updating the anti-malware definitions before scanning (part of remediation)', 'Educating the user first', 'Creating a restore point first'], answer: 1, why: ['Old definitions can\'t detect newer malware.', 'Remediation starts by updating definitions, so the scan can recognize current threats.', 'Education is the last step.', 'Restore points come after cleaning.'] },
      ],
      sources: [
        { title: 'NIST SP 800-83: Guide to Malware Incident Prevention and Handling', url: 'https://csrc.nist.gov/publications/sp800' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    c11: {
      sections: [
        { h: 'The principle: scripts turn repeated work into reliable automation', html: `
<p>Anything you do more than a few times by hand, such as mapping drives, gathering system information, restarting services or installing software, can be scripted. Scripts are consistent (the same steps every time) and they scale (a hundred machines as easily as one).</p>` },
        { h: 'Script types A+ expects you to recognize', html: `
<pre>.bat   Windows batch (Command Prompt)
.ps1   PowerShell: Windows automation with objects
.vbs   VBScript (legacy Windows)
.sh    shell script: Linux/macOS (Bash)
.js    JavaScript
.py    Python: cross-platform automation and tooling</pre>` },
        { h: 'Risks, and how to manage them', html: `
<ul>
  <li>A script runs with the rights of whoever runs it. A mistake in an admin script can affect every machine it touches.</li>
  <li>Test in a lab first, read any script before running it, and keep scripts in version control.</li>
  <li>PowerShell's execution policy and code signing add guardrails.</li>
  <li>Never put passwords in scripts; use secure credential storage.</li>
</ul>
<p>Your Bash, PowerShell and Python tracks, and the Projects, build exactly these skills.</p>` },
      ],
      misconceptions: ['A script that worked once is safe to run everywhere. (Test, and check its assumptions.)'],
      examTraps: ['Match the file extension to its environment (.ps1 = PowerShell, .sh = Linux shell).'],
      onTheJob: 'Admins automate routine tasks; security teams automate log analysis, compliance checks and reporting. Scripting is one of the biggest career multipliers in IT.',
      checks: [
        { q: 'An admin wants to automate a task across Windows machines using an object-based shell. Which file type fits?', options: ['.sh', '.ps1', '.vbs', '.bat'], answer: 1, why: ['.sh is for Linux/macOS shells.', 'PowerShell scripts use .ps1 and pass objects between commands.', 'VBScript is legacy.', 'Batch files are text-based and much more limited.'] },
      ],
      sources: [
        { title: 'Microsoft Learn: PowerShell documentation', url: 'https://learn.microsoft.com/en-us/powershell/' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    c12: {
      sections: [
        { h: 'The principle: remote access is a door, so control who can open it', html: `
<p>Remote access tools let staff work from anywhere and support machines they can't touch. Each one is also a way into the network, so they need strong authentication, encryption and limited exposure.</p>` },
        { h: 'Common tools', html: `
<ul>
  <li><strong>RDP</strong> (port 3389): full Windows desktop. Keep it off the open internet; put it behind a VPN or a gateway, with MFA.</li>
  <li><strong>SSH</strong> (port 22): encrypted command-line access, mostly Linux. Prefer key-based login.</li>
  <li><strong>VPN:</strong> an encrypted tunnel into the company network.</li>
  <li><strong>RMM</strong> (remote monitoring and management): tools IT providers use to manage many machines. Protect these accounts carefully, because they control everything they manage.</li>
  <li><strong>Screen-sharing tools:</strong> always confirm who you're letting in. Fake "support" callers ask victims to install them.</li>
</ul>` },
        { h: 'Wireless authentication recap', html: `
<p>WPA3-Personal uses a shared passphrase (with SAE protection). WPA2/WPA3-Enterprise gives each user their own credentials through a RADIUS server, which can be revoked individually.</p>` },
      ],
      misconceptions: ['A non-standard port protects RDP. (Scanners find it; use a VPN, MFA and access restrictions.)'],
      examTraps: ['"Each user logs in to Wi-Fi with their own account" → Enterprise mode with RADIUS.'],
      onTheJob: 'IT teams secure remote access with VPNs, MFA and gateways. Exposed remote desktop services remain one of the most common ways attackers get in, so security teams audit them closely.',
      checks: [
        { q: 'A small business exposes RDP directly to the internet for staff working from home. Best improvement?', options: ['Change RDP to port 3390', 'Require a VPN (with MFA) to reach RDP, and stop exposing it directly', 'Turn off the firewall to reduce lag', 'Share one admin account among staff'], answer: 1, why: ['Obscurity only; scanners check every port.', 'Removing direct exposure and adding strong authentication closes a major attack path.', 'That increases risk.', 'Shared accounts destroy accountability.'] },
      ],
      sources: [
        { title: 'CISA: Guidance on securing remote access', url: 'https://www.cisa.gov/' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    c13: {
      sections: [
        { h: 'The principle: data has a lifecycle, and every stage needs care', html: `
<p>Data is created, stored, used, shared, archived and finally destroyed. Regulations and trust depend on handling each stage properly, especially for personal data (PII), health data (PHI) and payment card data.</p>` },
        { h: 'Handling and disposal', html: `
<ul>
  <li><strong>Classify</strong> data (public, internal, confidential, restricted) so people know how to handle it.</li>
  <li><strong>Chain of custody:</strong> record everyone who handled evidence, and when, so it stays trustworthy and admissible.</li>
  <li><strong>Disposal:</strong> physical destruction (shredding, drilling, incineration); degaussing works only on magnetic media, not SSDs; secure or cryptographic erase for reuse. Get a <strong>certificate of destruction</strong> from vendors.</li>
  <li><strong>Licensing:</strong> respect EULAs and personal vs business licenses; track open-source license terms.</li>
</ul>` },
        { h: 'Professionalism', html: `
<p>Be punctual, listen actively without interrupting, avoid jargon with users, set clear expectations and timelines, follow up, and keep customer information confidential. Never browse a user's personal files while fixing their machine.</p>` },
      ],
      misconceptions: ['Formatting a drive destroys the data. (A quick format leaves it recoverable.)', 'Degaussing erases any drive. (Not flash/SSD storage.)'],
      examTraps: ['"Prove the drives were destroyed" → certificate of destruction.', '"Evidence admissible in court" → chain of custody.'],
      onTheJob: 'IT staff follow disposal procedures, investigators maintain chain of custody, and every role involves handling confidential data professionally.',
      checks: [
        { q: 'During a repair, a technician notices personal photos on the customer\'s desktop. What\'s the professional response?', options: ['Browse them to check for malware', 'Leave them alone and work only on what\'s needed for the repair', 'Copy them as a backup without asking', 'Mention them to coworkers'], answer: 1, why: ['That isn\'t needed for the repair and violates privacy.', 'Confidentiality: only access what the task requires.', 'Copying customer data without consent is a privacy breach.', 'Unprofessional and a breach of confidentiality.'] },
      ],
      sources: [
        { title: 'NIST SP 800-88: Guidelines for Media Sanitization', url: 'https://csrc.nist.gov/publications/sp800' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
