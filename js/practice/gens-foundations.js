/* Generators: Ground Zero, A+ Core 1/2, Linux. See practice/engine.js. */
(function (root) {
  'use strict';
  const P = (typeof module !== 'undefined' && module.exports) ? require('./engine.js') : root.CM.practice;
  const { register, int, pick, shuffle, sample, choice, input } = P;

  // ===== Ground Zero =====
  const IPOS = {
    Input: ['webcam', 'barcode scanner', 'touchscreen digitizer', 'fingerprint reader', 'game controller', 'document scanner', 'trackpad', 'MIDI keyboard'],
    Output: ['projector', 'headphones', 'monitor', 'braille display', '3D printer', 'speakers', 'smartwatch vibration motor'],
    Processing: ['CPU', 'GPU running a game', 'network router deciding where a packet goes', 'microcontroller in a thermostat'],
    Storage: ['SSD', 'USB flash drive', 'microSD card', 'external hard drive', 'tape cartridge', 'cloud backup folder'],
  };
  register('ipos.classify', { topic: 'Input, processing, output, storage' }, (r) => {
    const cat = pick(r, Object.keys(IPOS));
    const dev = pick(r, IPOS[cat]);
    const why = { Input: 'it brings data INTO the computer', Output: 'it presents results OUT of the computer', Processing: 'it transforms data by running instructions', Storage: 'it keeps data for later, even without power (or in a retrievable place)' }[cat];
    return choice(r, `A ${dev} is mainly which kind of component?`, cat, Object.keys(IPOS), `${cat}: ${why}. Ask "which way does the data flow?"`);
  });

  const PLACES = [128, 64, 32, 16, 8, 4, 2, 1];
  const EXAMPLE_VALUES = new Set([10, 255, 5]); // used in the lesson text/review; never test with them
  function byteValue(r) { let n; do { n = int(r, 1, 254); } while (EXAMPLE_VALUES.has(n)); return n; }
  function parts(n) { return PLACES.filter((v) => n & v); }
  register('bin.toDec', { topic: 'Binary to decimal' }, (r) => {
    const n = byteValue(r);
    const bin = n.toString(2).padStart(8, '0');
    return input(`Convert binary ${bin} to decimal.`, String(n),
      `Write the place values over the bits:\n128 64 32 16  8  4  2  1\n${bin.split('').map((b) => b.padStart(2)).join(' ')}\nAdd the values that have a 1: ${parts(n).join(' + ')} = ${n}.`,
      { hint: 'Each position is worth double the one to its right: 128 64 32 16 8 4 2 1.' });
  });
  register('bin.toBin', { topic: 'Decimal to binary' }, (r) => {
    const n = byteValue(r);
    const bin = n.toString(2).padStart(8, '0');
    let rem = n;
    const steps = PLACES.map((v) => { if (rem >= v) { rem -= v; return `${v}: yes (left ${rem})`; } return `${v}: no`; });
    return input(`Convert ${n} to an 8-bit binary number.`, bin,
      `Go from the biggest place value down; take it if it fits:\n${steps.join('\n')}\nResult: ${bin}.`,
      { hint: 'Start at 128. Does it fit into the number? If yes, write 1 and subtract it.' });
  });
  register('bin.bitsNeeded', { topic: 'How many bits?' }, (r) => {
    if (r() < 0.5) {
      const bits = pick(r, [3, 4, 5, 6, 7, 10, 12, 16]);
      return input(`How many different values can ${bits} bits represent?`, String(2 ** bits),
        `Each bit doubles the possibilities: 2^${bits} = ${2 ** bits}.`, { hint: '1 bit = 2 values, 2 bits = 4, 3 bits = 8...' });
    }
    const things = pick(r, [5, 12, 30, 50, 100, 200, 300, 600, 1000]);
    const bits = Math.ceil(Math.log2(things));
    return input(`What is the MINIMUM number of bits needed to give a unique code to ${things} different items?`, String(bits),
      `Find the smallest power of 2 that is at least ${things}: 2^${bits - 1} = ${2 ** (bits - 1)} (too few), 2^${bits} = ${2 ** bits} (enough). So ${bits} bits.`,
      { hint: 'List powers of 2 until one is at least as big as the number of items.' });
  });
  register('bits.bytes', { topic: 'Bits vs bytes' }, (r) => {
    const mbps = pick(r, [8, 16, 40, 80, 100, 200, 400, 800, 1000]);
    const mb = mbps / 8;
    return input(`An internet connection is ${mbps} Mbps (megaBITS per second). About how many megaBYTES per second can it download? (number only)`, [String(mb), mb.toFixed(1)],
      `There are 8 bits in a byte, so divide by 8: ${mbps} ÷ 8 = ${mb} MB/s. Network speeds are quoted in bits; file sizes in bytes. Watch for b vs B.`,
      { hint: 'Lowercase b = bits, uppercase B = bytes. How many bits per byte?' });
  });

  const HW = [
    ['Holds the programs and data the CPU is working on right now, and is wiped at power-off', 'RAM'],
    ['Converts AC wall power into the DC voltages the parts need', 'PSU'],
    ['Executes instructions; its speed is often quoted in GHz and cores', 'CPU'],
    ['Keeps files when the computer is turned off', 'SSD/HDD (storage)'],
    ['Renders images for the display and accelerates AI workloads', 'GPU'],
    ['The main circuit board that connects every other part', 'Motherboard'],
    ['A computer with plenty of free disk space slows to a crawl when 40 browser tabs are open', 'RAM'],
    ['A PC is completely dead: no fans, no lights, even with a known-good outlet', 'PSU'],
  ];
  register('hw.role', { topic: 'What each part does' }, (r) => {
    const [desc, part] = pick(r, HW);
    return choice(r, `Which component fits this description?\n"${desc}"`, part, ['RAM', 'PSU', 'CPU', 'SSD/HDD (storage)', 'GPU', 'Motherboard'].filter((p) => p !== part).slice(0, 5).sort(() => r() - 0.5).slice(0, 3),
      `${part}. Tie the description to the part's job: RAM = short-term working memory, storage = long-term, PSU = power, CPU = processing, GPU = graphics, motherboard = connects everything.`);
  });

  const DIRS = ['docs', 'pics', 'projects', 'reports', 'tmp', 'notes', 'audio', 'web'];
  const NAMES = ['sam', 'riya', 'kofi', 'mei', 'lars'];
  const FILES = ['plan.txt', 'logo.png', 'q3.csv', 'todo.md', 'run.sh', 'song.mp3'];
  register('path.resolve', { topic: 'Relative paths' }, (r) => {
    const user = pick(r, NAMES);
    const depth = int(r, 1, 3);
    const cwdParts = ['home', user].concat(sample(r, DIRS, depth));
    const ups = int(r, 1, depth);
    const target = sample(r, DIRS.filter((d) => !cwdParts.includes(d)), int(r, 0, 1));
    const file = pick(r, FILES);
    const rel = Array(ups).fill('..').concat(target, [file]).join('/');
    const absParts = cwdParts.slice(0, cwdParts.length - ups).concat(target, [file]);
    const abs = '/' + absParts.join('/');
    const cwd = '/' + cwdParts.join('/');
    return input(`You are in ${cwd}\nWhat is the ABSOLUTE path of: ${rel}`, abs,
      `Start at ${cwd}. Each ".." goes up one folder (${ups} time${ups > 1 ? 's' : ''}) to /${cwdParts.slice(0, cwdParts.length - ups).join('/')}, then follow ${target.length ? target[0] + '/' : ''}${file}. Answer: ${abs}`,
      { hint: 'Write the current folder down, cross off one folder per "..", then add the rest.' });
  });
  register('path.kind', { topic: 'Absolute vs relative' }, (r) => {
    const user = pick(r, NAMES);
    const f = pick(r, FILES);
    const d = pick(r, DIRS);
    const abs = pick(r, [`/home/${user}/${d}/${f}`, `/etc/${d}.conf`, `C:\\Users\\${user}\\${d}\\${f}`]);
    const rels = [`${d}/${f}`, `../${d}/${f}`, `./${f}`, `${user}/${f}`];
    return choice(r, 'Which of these is an ABSOLUTE path?', abs, sample(r, rels, 3),
      `${abs}: it starts from the top of the tree (/ on Linux, a drive letter like C:\\ on Windows), so it means the same thing no matter where you are. The others start from the current folder.`);
  });

  // ===== A+ Core 1 =====
  function randomIp(r, cat) {
    switch (cat) {
      case 'Private': {
        const k = int(r, 0, 2);
        if (k === 0) return `10.${int(r, 0, 255)}.${int(r, 0, 255)}.${int(r, 1, 254)}`;
        if (k === 1) return `172.${int(r, 16, 31)}.${int(r, 0, 255)}.${int(r, 1, 254)}`;
        return `192.168.${int(r, 0, 255)}.${int(r, 1, 254)}`;
      }
      case 'APIPA (self-assigned)': return `169.254.${int(r, 1, 254)}.${int(r, 1, 254)}`;
      case 'Loopback': return `127.${int(r, 0, 255)}.${int(r, 0, 255)}.${int(r, 1, 254)}`;
      default: {
        // Public: avoid every private/reserved range, including the tricky 172.32+ near-miss.
        const first = pick(r, [23, 45, 52, 64, 98, 104, 151, 172, 185, 203]);
        const second = first === 172 ? int(r, 32, 254) : int(r, 1, 254);
        return `${first}.${second}.${int(r, 0, 255)}.${int(r, 1, 254)}`;
      }
    }
  }
  const IP_CATS = ['Private', 'Public', 'APIPA (self-assigned)', 'Loopback'];
  register('ip.classify', { topic: 'IPv4 address types' }, (r) => {
    const cat = pick(r, IP_CATS);
    const ip = randomIp(r, cat);
    const why = {
      Private: 'it falls inside 10.0.0.0/8, 172.16.0.0–172.31.255.255, or 192.168.0.0/16',
      Public: ip.startsWith('172.') ? '172.x is only private from 172.16 to 172.31, and this one is outside that' : 'it is not in any private, loopback or APIPA range',
      'APIPA (self-assigned)': '169.254.x.x means the device could not reach a DHCP server',
      Loopback: '127.x.x.x always refers to the device itself',
    }[cat];
    return choice(r, `What kind of address is ${ip}?`, cat, IP_CATS, `${cat}: ${why}.`, { hint: 'Memorize three private ranges, plus 127 (loopback) and 169.254 (APIPA).' });
  });

  const PORTS = [
    [22, 'SSH', 'administrators need encrypted remote command-line access to Linux servers'],
    [53, 'DNS', 'clients must be able to resolve names to IP addresses'],
    [443, 'HTTPS', 'customers must reach the encrypted company website'],
    [80, 'HTTP', 'an old intranet site still serves unencrypted web pages'],
    [3389, 'RDP', 'a support tech needs a full graphical remote desktop on Windows'],
    [25, 'SMTP', 'the mail server must accept email being SENT to it from other mail servers'],
    [143, 'IMAP', 'users\' mail apps must sync mailboxes, keeping mail on the server'],
    [110, 'POP3', 'a legacy mail client downloads mail and removes it from the server'],
    [445, 'SMB', 'Windows PCs must map shared network drives'],
    [21, 'FTP', 'a legacy partner still uploads files with unencrypted file transfer (control channel)'],
    [23, 'Telnet', 'an ancient device only supports an unencrypted remote terminal'],
    [161, 'SNMP', 'the monitoring system must poll switches for health statistics'],
    [389, 'LDAP', 'applications query the directory service for user accounts'],
    [67, 'DHCP', 'new devices must automatically receive IP addresses (server side)'],
  ];
  register('port.scenario', { topic: 'Ports in scenarios' }, (r) => {
    const [port, name, need] = pick(r, PORTS);
    if (r() < 0.5) {
      return input(`A firewall rule is needed because ${need}. Which port number must be allowed?`, String(port), `${name} uses port ${port}.`, { hint: 'First name the protocol the scenario describes, then recall its port.' });
    }
    const others = sample(r, PORTS.filter((p) => p[0] !== port), 3).map((p) => p[1]);
    return choice(r, `A scan shows port ${port} open on a server. Which service is most likely listening?`, name, others, `Port ${port} = ${name}.`);
  });

  const TS = [
    ['Identify the problem', ['You ask the user what changed since it last worked', 'You back up the user\'s data before touching anything', 'You try to reproduce the error yourself']],
    ['Establish a theory of probable cause', ['You suspect the cable because the link light is off', 'You "question the obvious": is the monitor actually powered on?']],
    ['Test the theory to determine the cause', ['You swap in a known-good cable to see if the link comes up', 'You boot from a USB drive to see if the fault is the installed OS']],
    ['Establish a plan of action and implement the solution', ['You schedule the replacement for after hours and get approval', 'You replace the failed power supply following the plan']],
    ['Verify full system functionality and implement preventive measures', ['You have the user confirm everything works, then add a surge protector', 'You check all applications work after the repair']],
    ['Document findings, actions and outcomes', ['You record the cause and fix in the ticketing system', 'You update the knowledge base article for this error']],
  ];
  register('ts.step', { topic: 'Troubleshooting method' }, (r) => {
    const i = int(r, 0, TS.length - 1);
    const [step, acts] = TS[i];
    const act = pick(r, acts);
    if (r() < 0.5) {
      return choice(r, `Which step of the CompTIA troubleshooting method is this?\n"${act}"`, step, sample(r, TS.map((t) => t[0]).filter((s) => s !== step), 3),
        `${step} (step ${i + 1} of 6). Order: identify → theory → test → plan & implement → verify → document.`);
    }
    if (i === TS.length - 1) return choice(r, 'Which troubleshooting step comes LAST?', step, TS.slice(0, 5).map((t) => t[0]).slice(1, 4), 'Documentation is always last.');
    const next = TS[i + 1][0];
    return choice(r, `You just finished this step: "${act}". What step comes NEXT?`, next, sample(r, TS.map((t) => t[0]).filter((s) => s !== next && s !== step), 3),
      `That was "${step}" (step ${i + 1}). Next is "${next}" (step ${i + 2}).`);
  });

  const RAID = {
    0: { min: 2, usable: (n) => n, tol: 0, how: 'striping only: all disks hold data, no copies' },
    1: { min: 2, max: 2, usable: () => 1, tol: 1, how: 'mirroring: every disk holds the same data, so usable = one disk' },
    5: { min: 3, usable: (n) => n - 1, tol: 1, how: 'striping with parity: one disk\'s worth of space holds parity' },
    6: { min: 4, usable: (n) => n - 2, tol: 2, how: 'double parity: two disks\' worth of space holds parity' },
    10: { min: 4, even: true, usable: (n) => n / 2, tol: 1, how: 'mirrored pairs, striped: half the space is copies (survives 1 failure guaranteed, more if they hit different pairs)' },
  };
  register('raid.calc', { topic: 'RAID capacity and fault tolerance' }, (r) => {
    const lvl = pick(r, [0, 1, 5, 6, 10]);
    const R = RAID[lvl];
    let n = R.max || int(r, R.min, R.min + 4);
    if (R.even && n % 2) n++;
    const size = pick(r, [1, 2, 4, 8, 12]);
    if (r() < 0.6) {
      const usable = R.usable(n) * size;
      return input(`RAID ${lvl} with ${n} × ${size} TB drives. How many TB of usable capacity?`, String(usable),
        `RAID ${lvl} is ${R.how}. Usable = ${R.usable(n)} disk(s) × ${size} TB = ${usable} TB.`, { hint: 'How many disks\' worth of space are NOT used for copies or parity?' });
    }
    return input(`RAID ${lvl} with ${n} drives. How many drives can fail at the same time with GUARANTEED no data loss?`, String(R.tol),
      `RAID ${lvl}: ${R.how}. Guaranteed tolerance = ${R.tol}.`);
  });

  // ===== A+ Core 2 =====
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  register('backup.restore', { topic: 'Backup types and restores' }, (r) => {
    const fullDay = int(r, 0, 2);
    const failAfter = int(r, 2, 4); // number of daily backups after the full that completed
    const type = pick(r, ['incremental', 'differential']);
    const failDay = DAYS[(fullDay + failAfter + 1) % 7];
    const sets = type === 'incremental' ? 1 + failAfter : 2;
    const list = type === 'incremental'
      ? `the ${DAYS[fullDay]} full + every incremental (${Array.from({ length: failAfter }, (_, i) => DAYS[(fullDay + i + 1) % 7]).join(', ')})`
      : `the ${DAYS[fullDay]} full + only the latest differential (${DAYS[(fullDay + failAfter) % 7]})`;
    return input(`Full backup every ${DAYS[fullDay]} night, ${type} backups every other night. The server fails on ${failDay} morning. How many backup sets must you restore?`, String(sets),
      `${type === 'incremental' ? 'Each incremental only holds changes since the PREVIOUS backup, so you need all of them in order' : 'Each differential holds everything since the last FULL, so only the newest one matters'}: ${list} = ${sets} set${sets > 1 ? 's' : ''}.`,
      { hint: 'Incremental = since the last backup of any kind. Differential = since the last full.' });
  });

  register('fs.choose', { topic: 'Choosing a file system' }, (r) => {
    const cases = [
      () => { const gb = pick(r, [5, 8, 12, 20]); return [`A USB drive must hold a ${gb} GB video file and work on both Windows and macOS.`, 'exFAT', `exFAT: FAT32 can't store files over 4 GB, and NTFS is read-only on macOS by default. exFAT handles large files and both systems.`]; },
      () => [`An old car stereo only reads USB sticks with small music files (none over 100 MB).`, 'FAT32', 'FAT32: the most widely compatible with old devices, and no file here exceeds the 4 GB limit.'],
      () => [`The internal system drive of a Windows 11 PC that needs file permissions and BitLocker.`, 'NTFS', 'NTFS: the Windows system file system, with permissions and encryption.'],
      () => [`The root file system of an Ubuntu web server.`, 'ext4', 'ext4: a standard Linux file system.'],
    ];
    const [q, a, sol] = pick(r, cases)();
    return choice(r, `${q}\nWhich file system fits best?`, a, ['FAT32', 'exFAT', 'NTFS', 'ext4'], sol);
  });

  const MALWARE = {
    Worm: ['Within an hour, machines across three offices are infected, though nobody opened any file', 'Malware jumps from server to server by exploiting an unpatched network service'],
    Trojan: ['A free "PDF converter" works as promised, but also opens a hidden backdoor', 'A cracked game installer quietly installs remote-access software'],
    Ransomware: ['Files suddenly have a new extension and a note demands cryptocurrency', 'The file server\'s documents are unreadable and a countdown timer appears'],
    Keylogger: ['An attacker obtains a user\'s banking password typed only on their own laptop', 'Every keystroke on a kiosk is secretly recorded and uploaded'],
    Rootkit: ['Antivirus reports a clean system, but traffic analysis shows hidden connections; the malware hides from the OS itself', 'Malware modifies the kernel so its processes don\'t appear in Task Manager'],
    Spyware: ['Software tracks browsing habits and sends them to an advertiser without consent', 'An app silently collects location and contacts in the background'],
  };
  register('malware.type', { topic: 'Malware types' }, (r) => {
    const t = pick(r, Object.keys(MALWARE));
    return choice(r, `Which malware type best fits?\n"${pick(r, MALWARE[t])}"`, t, sample(r, Object.keys(MALWARE).filter((k) => k !== t), 3),
      `${t}. Key distinctions: worms spread by themselves; trojans hide inside something wanted; ransomware encrypts for payment; keyloggers capture keystrokes; rootkits hide from the OS; spyware collects data covertly.`);
  });
  const SE = {
    Phishing: ['A mass email claiming to be from "IT" asks everyone to re-enter their password on a linked page'],
    'Spear phishing': ['An email addressed to the payroll manager by name references a real vendor and asks to update bank details'],
    Vishing: ['A caller claiming to be from the bank\'s fraud team asks for a one-time code'],
    Smishing: ['A text message says a package is held and links to a "delivery fee" payment page'],
    Tailgating: ['Someone carrying boxes follows an employee through a badge-locked door'],
    'Shoulder surfing': ['A stranger in a coffee shop watches a laptop screen as a user logs in'],
    Pretexting: ['Someone poses as an auditor with an invented story to persuade staff to share internal reports'],
  };
  register('se.type', { topic: 'Social engineering' }, (r) => {
    const t = pick(r, Object.keys(SE));
    return choice(r, `Which social engineering technique is this?\n"${pick(r, SE[t])}"`, t, sample(r, Object.keys(SE).filter((k) => k !== t), 3),
      `${t}. Look at the CHANNEL (email, phone, SMS, in person) and whether it is mass or targeted.`);
  });
  const MAL_STEPS = ['Investigate and verify malware symptoms', 'Quarantine the infected system', 'Disable System Restore', 'Remediate (update anti-malware, scan and remove)', 'Schedule scans and run updates', 'Enable System Restore and create a restore point', 'Educate the end user'];
  register('malware.steps', { topic: 'Malware removal order' }, (r) => {
    const i = int(r, 0, MAL_STEPS.length - 2);
    return choice(r, `During malware removal you have just completed: "${MAL_STEPS[i]}". What is the NEXT step?`, MAL_STEPS[i + 1], sample(r, MAL_STEPS.filter((s, k) => k !== i + 1 && k !== i), 3),
      `Order: ${MAL_STEPS.map((s, k) => `${k + 1}. ${s}`).join(' → ')}.`);
  });

  // ===== Linux =====
  const modeStr = (m) => m.split('').map((d) => { const n = +d; return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-'); }).join('');
  const randMode = (r) => [pick(r, [7, 6, 5, 4]), pick(r, [7, 6, 5, 4, 0]), pick(r, [5, 4, 0, 1])].join('');
  register('perm.convert', { topic: 'Permissions: octal and rwx' }, (r) => {
    let m; do { m = randMode(r); } while (['600', '644', '755', '750', '640'].includes(m));
    const s = modeStr(m);
    const expl = s.match(/.{3}/g).map((g, i) => `${['owner', 'group', 'others'][i]} ${g} = ${[...g].map((c, k) => (c === '-' ? 0 : [4, 2, 1][k])).join('+')} = ${m[i]}`).join('; ');
    if (r() < 0.5) return input(`Write ${s} in octal (three digits).`, m, `r=4, w=2, x=1 per group: ${expl}. Octal ${m}.`, { hint: 'Split into three groups of three; add 4 for r, 2 for w, 1 for x.' });
    return input(`Write octal mode ${m} as rwx letters (9 characters, like rw-r--r--).`, s, `${expl}. So ${s}.`, { hint: 'Each digit is one group. Break it into 4+2+1.' });
  });
  const LUSERS = ['amir', 'bea', 'chen', 'dara'];
  register('perm.access', { topic: 'Who can access a file?' }, (r) => {
    const owner = pick(r, LUSERS);
    const group = pick(r, ['devs', 'ops', 'finance']);
    const m = randMode(r);
    const who = pick(r, ['owner', 'group', 'other', 'root']);
    const user = who === 'owner' ? owner : who === 'root' ? 'root' : pick(r, LUSERS.filter((u) => u !== owner));
    const op = pick(r, [['read', 4], ['write', 2], ['execute', 1]]);
    const digit = who === 'owner' ? +m[0] : who === 'group' ? +m[1] : +m[2];
    const allowed = who === 'root' ? (op[1] !== 1 || /[1357]/.test(m)) : (digit & op[1]) !== 0;
    const groupNote = who === 'group' ? ` ${user} is in group ${group} (not the owner), so the GROUP digit applies.` : who === 'other' ? ` ${user} is not the owner and not in ${group}, so the OTHERS digit applies.` : who === 'owner' ? ` ${user} is the owner, so the OWNER digit applies.` : '';
    const sol = who === 'root'
      ? `root bypasses read/write permission checks; for execute it needs at least one x bit somewhere (mode ${m} = ${modeStr(m)}). Answer: ${allowed ? 'Yes' : 'No'}.`
      : `Mode ${m} = ${modeStr(m)}.${groupNote} That digit is ${digit} (${modeStr(String(digit))}), which ${allowed ? 'includes' : 'does not include'} ${op[0]} (${op[1]}). Answer: ${allowed ? 'Yes' : 'No'}.`;
    return choice(r, `File report.txt: owner ${owner}, group ${group}, mode ${m}.\nUser ${user}${who === 'group' ? ` (member of ${group})` : who === 'other' ? ' (not in ' + group + ')' : ''} tries to ${op[0]} it. Allowed?`, allowed ? 'Yes' : 'No', [allowed ? 'No' : 'Yes'], sol,
      { hint: 'First decide which digit applies (owner, group or others), then check whether that digit contains the needed bit.' });
  });
  register('passwd.field', { topic: 'Reading /etc/passwd' }, (r) => {
    const u = pick(r, ['jlopez', 'pkhan', 'svc_backup', 'mwong', 'deploy']);
    const uid = int(r, 1001, 1999);
    const svc = u.startsWith('svc') || u === 'deploy';
    const home = svc ? `/var/lib/${u}` : `/home/${u}`;
    const shell = svc ? '/usr/sbin/nologin' : pick(r, ['/bin/bash', '/bin/zsh']);
    const line = `${u}:x:${uid}:${uid}:${u}:${home}:${shell}`;
    const ask = pick(r, [['home directory', home, 6], ['login shell', shell, 7], ['user ID (UID)', String(uid), 3]]);
    return input(`From this /etc/passwd line, what is the ${ask[0]}?\n${line}`, ask[1],
      `Fields (split on ":"): 1 name, 2 password placeholder, 3 UID, 4 GID, 5 comment, 6 home, 7 shell. Field ${ask[2]} = ${ask[1]}.`, { hint: 'Count the colon-separated fields: name:x:UID:GID:comment:home:shell.' });
  });

  // ===== Shell tasks with fresh random evidence =====
  const SHELL_USERS = ['alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'root', 'admin'];
  function authLog(r) {
    const lines = [];
    const counts = {};
    const ips = {};
    const n = int(r, 40, 70);
    for (let i = 0; i < n; i++) {
      const u = pick(r, SHELL_USERS);
      const ip = `10.0.${int(r, 1, 3)}.${int(r, 10, 60)}`;
      const ok = r() < 0.4;
      const ts = `Nov 0${int(r, 1, 9)} ${String(int(r, 0, 23)).padStart(2, '0')}:${String(int(r, 0, 59)).padStart(2, '0')}:${String(int(r, 0, 59)).padStart(2, '0')}`;
      lines.push(`${ts} web01 sshd: ${ok ? 'Accepted' : 'Failed'} password for ${u} from ${ip}`);
      if (!ok) { counts[u] = (counts[u] || 0) + 1; ips[ip] = (ips[ip] || 0) + 1; }
    }
    return { text: lines.join('\n') + '\n', counts, ips, total: n };
  }
  register('sh.countUser', { topic: 'grep + pipes on fresh logs' }, (r) => {
    let log;
    do { log = authLog(r); } while (!Object.keys(log.counts).length);
    const users = Object.keys(log.counts);
    const u = pick(r, users);
    return input(`A fresh log is at logs/auth.log (${log.total} lines). Using the terminal, how many FAILED logins are there for user "${u}"?`, String(log.counts[u]),
      `One way: grep Failed logs/auth.log | grep "for ${u} " | wc -l → ${log.counts[u]}. Note the trailing space in "for ${u} ", so "${u}" doesn't also match longer names.`,
      { kind: 'shell', shell: { files: { '/home/student/logs/auth.log': log.text } }, solve: `grep Failed logs/auth.log | grep -c "for ${u} "`, hint: 'Filter to Failed lines first, then to the user, then count. Pipes (|) chain the steps.' });
  });
  register('sh.topSource', { topic: 'Counting and ranking with pipes' }, (r) => {
    let log;
    let top;
    do {
      log = authLog(r);
      const sorted = Object.entries(log.ips).sort((a, b) => b[1] - a[1]);
      top = sorted.length > 1 && sorted[0][1] > sorted[1][1] ? sorted[0] : null;
    } while (!top);
    return input(`A fresh log is at logs/auth.log. Which source IP has the MOST failed logins?`, top[0],
      `grep Failed logs/auth.log | cut -d " " -f 11 | sort | uniq -c | sort -rn | head -n 1 → ${top[1]} ${top[0]}. (Field 11 is the IP when you split on spaces.)`,
      { kind: 'shell', shell: { files: { '/home/student/logs/auth.log': log.text } }, solve: 'grep Failed logs/auth.log | cut -d " " -f 11 | sort | uniq -c | sort -rn | head -n 1', hint: 'Isolate the IP column with cut, then sort | uniq -c to count, then sort -rn to rank.' });
  });
  register('sh.csv', { topic: 'Columns with cut' }, (r) => {
    const oses = ['linux', 'windows', 'macos'];
    const rows = ['hostname,ip,os,owner'];
    const tally = {};
    const n = int(r, 15, 30);
    for (let i = 0; i < n; i++) {
      const os = pick(r, oses);
      tally[os] = (tally[os] || 0) + 1;
      rows.push(`${pick(r, ['web', 'db', 'hr', 'dev', 'pc'])}${String(i + 1).padStart(2, '0')},10.20.${int(r, 0, 9)}.${int(r, 1, 254)},${os},${pick(r, ['it', 'hr', 'data', 'ops'])}`);
    }
    const os = pick(r, Object.keys(tally));
    return input(`inventory.csv was just regenerated (${n} machines). How many machines run ${os}?`, String(tally[os]),
      `cut -d, -f3 inventory.csv | grep -c ${os} → ${tally[os]}. (Or grep -c ",${os}," inventory.csv.)`,
      { kind: 'shell', shell: { files: { '/home/student/inventory.csv': rows.join('\n') + '\n' } }, solve: `cut -d, -f3 inventory.csv | grep -c ${os}`, hint: 'The OS is the 3rd comma-separated column: cut -d, -f3.' });
  });
  register('sh.perms', { topic: 'Finding risky permissions' }, (r) => {
    const files = {};
    const meta = {};
    const n = int(r, 6, 10);
    let risky = 0;
    for (let i = 0; i < n; i++) {
      const p = `/srv/app/${pick(r, ['config', 'cache', 'data', 'upload', 'key', 'log'])}${i}.${pick(r, ['txt', 'conf', 'db'])}`;
      files[p] = 'x\n';
      const ww = r() < 0.35;
      if (ww) risky++;
      meta[p] = { mode: ww ? pick(r, ['666', '777', '646']) : pick(r, ['644', '640', '600', '755']), owner: 'root', group: 'root' };
    }
    if (!risky) { const k = Object.keys(files)[0]; meta[k].mode = '666'; risky = 1; }
    return input(`Directory /srv/app has ${n} files. How many are WORLD-WRITABLE (others have w)? Use ls -l.`, String(risky),
      `In ls -l, the others group is the last 3 characters of the permission string. World-writable means the 9th character is "w". Count: ${risky}.`,
      { kind: 'shell', shell: { files, meta }, solve: 'ls -l /srv/app | grep -c "^.{8}w"', hint: 'ls -l /srv/app, then look at the last three of the nine rwx characters. (Advanced: grep a pattern for "w" in that position.)' });
  });

  if (typeof module !== 'undefined' && module.exports) module.exports = {};
})(typeof window !== 'undefined' ? window : globalThis);
