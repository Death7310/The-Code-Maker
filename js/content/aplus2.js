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
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
