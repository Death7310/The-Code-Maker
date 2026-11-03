/* Track content: CompTIA A+ Core 2 (220-1202) foundations. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.aplus2 = {
    id: 'aplus2',
    title: 'A+ Core 2: Operating Systems & Security',
    lang: 'A+ 220-1202',
    blurb: 'Windows and Linux tools, file systems, malware, social engineering, authentication and operational procedures.',
    lessons: [
      {
        id: 'c1',
        title: 'Windows command-line tools',
        body: `
<p>Commands you need to know for the exam (run them in Windows Command Prompt):</p>
<pre>ipconfig        show IP settings (/all for detail, /release /renew for DHCP)
ping HOST       can I reach it?
tracert HOST    which route do packets take?
nslookup NAME   query DNS
netstat         show network connections
sfc /scannow    scan and repair Windows system files
chkdsk          check a disk for errors
gpupdate /force re-apply Group Policy
whoami          which account am I using?</pre>`,
        exercise: {
          type: 'quiz',
          question: 'Windows is behaving oddly and you suspect corrupted system files. Which command checks and repairs them?',
          options: ['chkdsk', 'sfc /scannow', 'ipconfig /renew', 'gpupdate /force'],
          answer: 1,
          explain: 'System File Checker (sfc) verifies protected Windows files. chkdsk checks the disk’s file system.',
        },
        review: [
          { question: 'Which command shows a PC’s IP address configuration on Windows?', options: ['ipconfig', 'netstat', 'tracert', 'sfc'], answer: 0, explain: 'ipconfig (ipconfig /all for full details).' },
        ],
      },
      {
        id: 'c2',
        title: 'File systems and permissions',
        body: `
<ul>
  <li><strong>NTFS</strong>: the standard Windows file system. Supports permissions, encryption and large files.</li>
  <li><strong>FAT32</strong>: old and very compatible, but individual files are limited to <strong>4 GB</strong>.</li>
  <li><strong>exFAT</strong>: for flash drives. Large files, and broad compatibility.</li>
  <li><strong>ext4</strong>: common Linux file system.</li>
</ul>
<p><strong>Least privilege:</strong> give each user only the access their job requires. It's one of the most important ideas in all of security, and you'll see it in every certification on this path.</p>`,
        exercise: {
          type: 'quiz',
          question: 'A user can’t copy a 6 GB video onto a USB drive, though the drive has plenty of free space. The likely cause?',
          options: ['The drive is formatted FAT32', 'The drive is NTFS', 'RAM is full', 'DNS is down'],
          answer: 0,
          explain: 'FAT32 caps individual files at 4 GB. Reformat as exFAT or NTFS.',
        },
        review: [
          { question: 'Giving users only the access their job needs is called…', options: ['Defense in depth', 'Least privilege', 'Zero day', 'Single sign-on'], answer: 1, explain: 'The principle of least privilege.' },
        ],
      },
      {
        id: 'c3',
        title: 'Malware types',
        body: `
<ul>
  <li><strong>Virus</strong>: attaches to files and spreads when they're run.</li>
  <li><strong>Worm</strong>: spreads <em>by itself</em> across networks, with no user action needed.</li>
  <li><strong>Trojan</strong>: disguised as something legitimate.</li>
  <li><strong>Ransomware</strong>: encrypts data and demands payment.</li>
  <li><strong>Spyware / keylogger</strong>: secretly collects information or keystrokes.</li>
  <li><strong>Rootkit</strong>: hides deep in the OS to avoid detection.</li>
</ul>
<p>The best protection against ransomware is tested, offline backups.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Malware spreads from computer to computer across a network with no one clicking anything. What is it?',
          options: ['Trojan', 'Worm', 'Keylogger', 'Spyware'],
          answer: 1,
          explain: 'Worms self-propagate. Viruses and trojans need a user to run something.',
        },
        review: [
          { question: 'Malware that hides deep in the OS to avoid detection is a…', options: ['Rootkit', 'Worm', 'Adware', 'Botnet'], answer: 0, explain: 'Rootkits conceal themselves, often at kernel level.' },
        ],
      },
      {
        id: 'c4',
        title: 'Social engineering',
        body: `
<p>Social engineering means manipulating <em>people</em> rather than technology. It's behind a large share of real breaches.</p>
<ul>
  <li><strong>Phishing</strong>: fraudulent email. <strong>Spear phishing</strong> targets a specific person.</li>
  <li><strong>Vishing</strong>: done by voice/phone. <strong>Smishing</strong>: done by SMS text.</li>
  <li><strong>Tailgating</strong>: following someone through a secure door without authorization.</li>
  <li><strong>Shoulder surfing</strong>: watching someone type a password.</li>
  <li><strong>Impersonation / pretexting</strong>: posing as IT, a vendor or a boss.</li>
</ul>
<p>Defenses: training, verifying requests through a second channel, and MFA.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Someone follows an employee through a badge-controlled door without scanning a badge. What is this?',
          options: ['Phishing', 'Vishing', 'Tailgating', 'Shoulder surfing'],
          answer: 2,
          explain: 'Tailgating (also called piggybacking) gets around physical access controls.',
        },
        review: [
          { question: 'A fake "IT support" phone call asking for your password is…', options: ['Smishing', 'Vishing', 'Tailgating', 'Whaling'], answer: 1, explain: 'Voice phishing = vishing.' },
        ],
      },
      {
        id: 'c5',
        title: 'Authentication and MFA',
        body: `
<p>Authentication factors:</p>
<ul>
  <li><strong>Something you know</strong>: a password or PIN.</li>
  <li><strong>Something you have</strong>: a phone, hardware key or smart card.</li>
  <li><strong>Something you are</strong>: a fingerprint or face.</li>
</ul>
<p><strong>MFA</strong> requires factors from <em>different</em> categories. A password plus a PIN is still just one factor type, so it isn't MFA.</p>
<p>Use a password manager and long, unique passphrases.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Which combination is true multi-factor authentication?',
          options: ['Password + PIN', 'Password + security question', 'Password + code from an authenticator app', 'Two different passwords'],
          answer: 2,
          explain: 'Password (know) + authenticator app on your phone (have) = two different categories.',
        },
      },
      {
        id: 'c6',
        title: 'Operational procedures',
        body: `
<p><strong>Backups:</strong></p>
<ul>
  <li><strong>Full</strong>: everything.</li>
  <li><strong>Incremental</strong>: changes since the <em>last backup of any kind</em>. Fastest to create; to restore, you need the full backup plus <em>every</em> incremental since.</li>
  <li><strong>Differential</strong>: changes since the <em>last full</em>. To restore, you need the full backup plus the <em>latest</em> differential.</li>
  <li><strong>3-2-1 rule</strong>: 3 copies of your data, on 2 different types of media, with 1 kept offsite.</li>
</ul>
<p><strong>Change management:</strong> plan, approve, test and document changes, and have a rollback plan ready. <strong>Safety:</strong> use an anti-static (ESD) strap, and unplug before opening a case.</p>
<p>Penetration testers work under change management too. Clients approve testing windows the same way they approve changes.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Full backup Sunday, differential backups every other day. The server dies Thursday. What do you restore?',
          options: ['Only Thursday’s differential', 'Sunday full + every differential', 'Sunday full + the latest differential', 'Nothing can be restored'],
          answer: 2,
          explain: 'Each differential holds everything changed since the last full, so you only need the full plus the newest differential.',
        },
        review: [
          { question: 'The 3-2-1 backup rule requires how many copies offsite?', options: ['0', '1', '2', '3'], answer: 1, explain: '3 copies, 2 media types, 1 offsite.' },
        ],
      },
      {
        id: 'c7',
        title: 'Linux basics for A+',
        body: `
<p>A+ expects basic Linux commands:</p>
<pre>ls, cd, pwd      move around
cat, grep        read and search files
cp, mv, rm       copy, move/rename, delete
chmod, chown     change permissions / owner
sudo             run a command as administrator (root)
apt / dnf        install software (Debian/Ubuntu vs Red Hat/Fedora)
ip a             show network addresses (older: ifconfig)
man COMMAND      read the manual for a command</pre>
<p>You've already used several of these. Keep building on them in the <a href="#/track/bash">Bash track</a>.</p>`,
        exercise: {
          type: 'quiz',
          question: 'On Ubuntu, a command fails with "permission denied" because it needs administrator rights. What do you put in front of it?',
          options: ['chmod', 'sudo', 'man', 'grep'],
          answer: 1,
          explain: 'sudo runs a single command with elevated (root) privileges.',
        },
      },
      {
        id: 'c8',
        title: 'Windows editions and built-in tools',
        body: `
<p><strong>Home vs Pro</strong>: Pro adds <strong>BitLocker</strong>, <strong>Group Policy Editor</strong> (gpedit.msc), <strong>joining a domain</strong>, and acting as a <strong>Remote Desktop host</strong>. Exam scenarios often hinge on "this feature doesn't exist in Home".</p>
<p>Tools to know, and how to launch them:</p>
<pre>taskmgr        Task Manager: processes, performance, startup apps
eventvwr.msc   Event Viewer: system, application and security logs
devmgmt.msc    Device Manager: hardware and drivers
diskmgmt.msc   Disk Management: partitions, volumes
services.msc   Services: start/stop/disable services
taskschd.msc   Task Scheduler: scheduled jobs (also where malware hides)
msconfig       System Configuration: boot options, Safe Mode
regedit        Registry Editor (be careful!)
resmon / perfmon  Resource and Performance Monitor</pre>`,
        exercise: {
          type: 'quiz',
          question: 'A user on Windows 11 Home wants to encrypt their drive with BitLocker and can’t find it. Why?',
          options: ['BitLocker requires Pro (or higher)', 'Their RAM is too small', 'BitLocker is only on Linux', 'They need a new monitor'],
          answer: 0,
          explain: 'BitLocker management needs Pro/Enterprise/Education. Home has only the more limited "Device Encryption".',
        },
        review: [
          { question: 'Which tool shows hardware with driver problems (yellow warning icons)?', options: ['Event Viewer', 'Device Manager', 'Disk Management', 'Task Scheduler'], answer: 1, explain: 'devmgmt.msc.' },
          { question: 'Where would you look for a record of failed logon attempts on Windows?', options: ['Event Viewer (Security log)', 'Disk Management', 'msconfig', 'Device Manager'], answer: 0, explain: 'The Security log records logon events (4624/4625).' },
          { question: 'Which edition can join a corporate Active Directory domain?', options: ['Home', 'Pro'], answer: 1, explain: 'Domain join requires Pro or higher.' },
        ],
      },
      {
        id: 'c9',
        title: 'Troubleshooting Windows problems',
        body: `
<pre>Symptom                          First things to try
Blue screen (BSOD)               Note the stop code; recent driver/update? Roll back the driver, check RAM
Very slow                        Task Manager: CPU/RAM/disk hogs; startup apps; malware scan
Won't boot after an update       Startup Repair / System Restore / uninstall the update (WinRE)
App crashes                      Update/repair/reinstall the app; check Event Viewer
Unable to start in normal mode   Safe Mode (minimal drivers) to isolate the cause</pre>
<p><strong>System Restore</strong> rolls back system files, drivers and settings, but <em>not</em> personal files. A <strong>reset</strong> reinstalls Windows, with the option to keep files.</p>`,
        exercise: {
          type: 'quiz',
          question: 'BSODs started right after installing a new graphics driver. Best first step?',
          options: ['Replace the motherboard', 'Roll back the driver in Device Manager', 'Reinstall Windows', 'Replace the monitor'],
          answer: 1,
          explain: 'Undo the most recent change first: it’s the most likely cause and the least disruptive fix.',
        },
        review: [
          { question: 'Does System Restore delete your personal documents?', options: ['Yes', 'No'], answer: 1, explain: 'It changes system files and settings, not personal files.' },
        ],
      },
      {
        id: 'c10',
        title: 'Malware removal: the CompTIA steps',
        body: `
<p>Memorize this order. It's tested directly.</p>
<ol>
  <li><strong>Investigate and verify</strong> the malware symptoms.</li>
  <li><strong>Quarantine</strong> the infected system (disconnect it from the network).</li>
  <li><strong>Disable System Restore</strong> (Windows), so infected restore points can't bring it back.</li>
  <li><strong>Remediate</strong>: update the anti-malware software, then scan and remove (Safe Mode or a boot-time scan if needed).</li>
  <li><strong>Schedule scans and run updates.</strong></li>
  <li><strong>Enable System Restore</strong> and create a new, clean restore point.</li>
  <li><strong>Educate the end user.</strong></li>
</ol>`,
        exercise: {
          type: 'quiz',
          question: 'You’ve confirmed a PC is infected. What’s the NEXT step?',
          options: ['Educate the user', 'Quarantine the system', 'Create a restore point', 'Schedule scans'],
          answer: 1,
          explain: 'Isolate it before it spreads: quarantine is step 2.',
        },
        review: [
          { question: 'Why disable System Restore during malware removal?', options: ['It speeds up the PC', 'Restore points may contain the malware', 'It is required by law', 'To free RAM'], answer: 1, explain: 'An infected restore point could reinstall the malware later.' },
          { question: 'What is the LAST step of the malware removal process?', options: ['Remediate', 'Educate the end user', 'Quarantine', 'Disable System Restore'], answer: 1, explain: 'Education helps prevent the next infection.' },
        ],
      },
      {
        id: 'c11',
        title: 'Scripting basics in A+',
        body: `
<p>A+ expects you to recognize script types and what they're used for (not to write complex code):</p>
<pre>.bat   Windows batch file (Command Prompt)
.ps1   PowerShell
.vbs   VBScript (legacy Windows)
.sh    Bash / Linux shell script
.js    JavaScript
.py    Python</pre>
<p>Common uses: automating backups, mapping network drives, installing software, restarting machines, gathering information.</p>
<p>Risks: a script can accidentally make destructive changes, open security holes, or use up resources. Test scripts first, and know what any script does before you run it. Your Bash, PowerShell and Python tracks build on exactly this.</p>`,
        exercise: {
          type: 'quiz',
          question: 'An admin wants to automate a Windows task using Windows’ modern object-based shell. Which file type?',
          options: ['.sh', '.ps1', '.vbs', '.py'],
          answer: 1,
          explain: '.ps1 is a PowerShell script.',
        },
        review: [
          { question: 'A .sh file is a script for…', options: ['PowerShell', 'Linux/Unix shells like Bash', 'Excel', 'VBScript'], answer: 1, explain: '.sh = shell script.' },
        ],
      },
      {
        id: 'c12',
        title: 'Remote access and wireless security',
        body: `
<ul>
  <li><strong>RDP</strong> (port 3389): full Windows desktop remotely. Don't expose it directly to the internet; put it behind a VPN or gateway.</li>
  <li><strong>SSH</strong> (port 22): secure command-line access, mostly Linux.</li>
  <li><strong>VPN</strong>: an encrypted tunnel into the company network.</li>
  <li><strong>RMM</strong> (remote monitoring and management): tools IT providers use to manage many machines. Attackers abuse them too.</li>
  <li><strong>Screen-sharing tools</strong>: always verify who you're letting in. "Tech support" scams rely on them.</li>
</ul>
<p>Wireless authentication: <strong>WPA3-Personal</strong> (uses SAE) or <strong>WPA2/WPA3-Enterprise</strong> (each user authenticates through <strong>RADIUS</strong> instead of a shared password).</p>`,
        exercise: {
          type: 'quiz',
          question: 'A company wants each employee to log in to Wi-Fi with their own credentials instead of a shared password. What do they need?',
          options: ['WEP', 'WPA2/WPA3-Enterprise with RADIUS', 'An open network', 'WPS'],
          answer: 1,
          explain: 'Enterprise mode authenticates each user individually through a RADIUS server.',
        },
        review: [
          { question: 'A caller says they’re from "Microsoft support" and asks you to install a screen-sharing app. This is most likely…', options: ['Routine support', 'A tech support scam', 'A Windows update', 'An RMM upgrade'], answer: 1, explain: 'Legitimate vendors don’t cold-call for remote access.' },
        ],
      },
      {
        id: 'c13',
        title: 'Data handling, disposal and professionalism',
        body: `
<ul>
  <li><strong>PII</strong> (personally identifiable information), <strong>PHI</strong> (health information) and payment data need special care and are often regulated.</li>
  <li><strong>Chain of custody</strong>: documenting everyone who handled evidence, and when. Without it, evidence can be challenged.</li>
  <li><strong>Data destruction</strong>: shredding, drilling, incineration, or <strong>degaussing</strong> (which only works on <em>magnetic</em> media like HDDs and tape, <em>not SSDs</em>). Get a <strong>certificate of destruction</strong> from vendors.</li>
  <li>To <em>reuse</em> a drive: a secure erase or overwrite. A quick format alone doesn't remove the data.</li>
  <li><strong>Licensing</strong>: personal vs corporate licenses, open source, EULAs.</li>
  <li><strong>Professionalism</strong>: be on time, listen actively, don't interrupt, avoid jargon with users, set expectations, and keep customers' data confidential.</li>
</ul>`,
        exercise: {
          type: 'quiz',
          question: 'A company is retiring SSDs that held customer data. Which method does NOT reliably destroy the data?',
          options: ['Shredding', 'Degaussing', 'Incineration', 'Drilling through the chips'],
          answer: 1,
          explain: 'SSDs store data in flash memory, not magnetically, so degaussing doesn’t affect them.',
        },
        review: [
          { question: 'The documented history of who handled evidence is called…', options: ['Chain of custody', 'EULA', 'Change management', 'RAID'], answer: 0, explain: 'Chain of custody keeps evidence admissible.' },
          { question: 'Does a quick format remove the data from a drive?', options: ['Yes, permanently', 'No, the data can often be recovered'], answer: 1, explain: 'A quick format only resets the file system structures.' },
        ],
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
