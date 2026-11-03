/*
 * exams.js — practice exams. Questions come from the stage's lessons
 * (exercise + review items) plus an extra bank of scenario-style questions,
 * each tagged with an official exam domain. Results are broken down by
 * domain so weak areas are visible.
 *
 * Domain weights are from the exam objectives at the time of writing.
 * Always confirm against the current official objectives.
 */
(function (root) {
  'use strict';

  const EXAMS = [
    {
      id: 'aplus1', title: 'A+ Core 1 practice', code: '220-1201', track: 'aplus1', length: 30,
      domains: { mobile: ['Mobile Devices', 13], net: ['Networking', 23], hw: ['Hardware', 25], cloud: ['Virtualization & Cloud Computing', 11], ts: ['Hardware & Network Troubleshooting', 28] },
      lessonDomain: { a1: 'hw', a2: 'hw', a3: 'net', a4: 'net', a5: 'cloud', a6: 'mobile', a7: 'ts', a8: 'hw', a9: 'hw', a10: 'net', a11: 'net', a12: 'hw', a13: 'ts' },
      bank: [
        { d: 'mobile', question: 'A laptop’s battery is visibly swollen and the touchpad is bulging. What should the technician do?', options: ['Keep using it on AC power', 'Stop using it and replace the battery, following safe disposal procedures', 'Puncture it to release pressure', 'Update the BIOS'], answer: 1, explain: 'Swollen lithium-ion batteries are a fire hazard. Never puncture them.' },
        { d: 'mobile', question: 'A user wants their phone to pay at a store terminal by tapping it. Which technology?', options: ['Bluetooth', 'NFC', 'Infrared', 'Wi-Fi Direct'], answer: 1, explain: 'NFC works at a range of a few centimeters, which is used for tap-to-pay.' },
        { d: 'net', question: 'Which protocol automatically assigns IP addresses to clients?', options: ['DNS', 'DHCP', 'SMTP', 'SNMP'], answer: 1, explain: 'DHCP hands out addresses (ports 67/68).' },
        { d: 'net', question: 'Which device forwards traffic within a LAN based on MAC addresses?', options: ['Router', 'Switch', 'Modem', 'Firewall'], answer: 1, explain: 'Switches operate at Layer 2 using MAC addresses.' },
        { d: 'net', type: 'input', question: 'Which port does SNMP use?', accept: ['161'], explain: 'SNMP = UDP 161 (traps on 162).' },
        { d: 'net', question: 'Which cable category is the minimum commonly used for gigabit Ethernet?', options: ['Cat3', 'Cat5', 'Cat5e', 'RG-6'], answer: 2, explain: 'Cat5e supports 1 Gbps up to 100 m.' },
        { d: 'hw', question: 'A user needs the fastest boot drive for a new desktop. The board has an M.2 slot supporting PCIe. Best choice?', options: ['7,200 RPM HDD', 'SATA SSD', 'NVMe M.2 SSD', 'USB flash drive'], answer: 2, explain: 'NVMe over PCIe is far faster than SATA.' },
        { d: 'hw', question: 'A technician is installing RAM. What prevents damage from static electricity?', options: ['Wearing an ESD strap', 'Working on carpet', 'Keeping the PC plugged in and on', 'Using a magnetic screwdriver'], answer: 0, explain: 'An ESD strap equalizes the charge between you and the components.' },
        { d: 'hw', question: 'Which connector carries both digital video and audio to a TV?', options: ['VGA', 'HDMI', 'RJ11', 'PS/2'], answer: 1, explain: 'HDMI carries both video and audio.' },
        { d: 'cloud', question: 'A developer wants to deploy code without managing servers or operating systems. Which model?', options: ['IaaS', 'PaaS', 'On-premises', 'Type 1 hypervisor'], answer: 1, explain: 'PaaS provides the platform; you bring the code.' },
        { d: 'cloud', question: 'Which cloud characteristic lets resources grow and shrink automatically with demand?', options: ['Elasticity', 'Metered billing', 'Multitenancy', 'High latency'], answer: 0, explain: 'Elasticity means automatic scaling.' },
        { d: 'ts', question: 'A user reports "limited connectivity" and ipconfig shows 169.254.10.4. What should you check first?', options: ['The DNS server', 'The physical connection and DHCP availability', 'The monitor cable', 'The printer queue'], answer: 1, explain: 'APIPA means DHCP failed. Check the link first, then the DHCP server.' },
        { d: 'ts', question: 'A PC powers on, fans spin, but there’s no display and it beeps repeatedly. Most likely?', options: ['A DNS error', 'RAM not seated correctly', 'Expired license', 'Full hard drive'], answer: 1, explain: 'Beep codes at POST often point to memory or video problems.' },
        { d: 'ts', question: 'Laser printer output has a repeating mark at the same spot on every page. Likely cause?', options: ['Low Wi-Fi signal', 'A damaged drum or roller', 'Wrong paper size', 'Outdated driver'], answer: 1, explain: 'Repeating defects at fixed intervals point to a roller or drum.' },
      ],
    },
    {
      id: 'aplus2', title: 'A+ Core 2 practice', code: '220-1202', track: 'aplus2', length: 30,
      domains: { os: ['Operating Systems', 28], sec: ['Security', 28], sw: ['Software Troubleshooting', 23], ops: ['Operational Procedures', 21] },
      lessonDomain: { c1: 'os', c2: 'os', c3: 'sec', c4: 'sec', c5: 'sec', c6: 'ops', c7: 'os', c8: 'os', c9: 'sw', c10: 'sw', c11: 'ops', c12: 'sec', c13: 'ops' },
      bank: [
        { d: 'os', question: 'Which Windows command displays the IP configuration, including DNS servers?', options: ['ipconfig /all', 'netstat -a', 'chkdsk /f', 'gpupdate'], answer: 0, explain: 'ipconfig /all shows full adapter details.' },
        { d: 'os', question: 'Which Linux command shows the current directory?', options: ['ls', 'pwd', 'cd', 'grep'], answer: 1, explain: 'pwd = print working directory.' },
        { d: 'os', question: 'Which file system should be used for a USB drive that must hold a 10 GB file and work on Windows and macOS?', options: ['FAT32', 'exFAT', 'ext4', 'NTFS only'], answer: 1, explain: 'exFAT has no 4 GB file limit and is widely supported.' },
        { d: 'sec', question: 'An attacker calls the help desk pretending to be a manager and requests a password reset. This is…', options: ['Phishing', 'Impersonation / social engineering', 'Brute force', 'Shoulder surfing'], answer: 1, explain: 'Pretending to be someone else to manipulate staff is impersonation.' },
        { d: 'sec', question: 'Which is the strongest Wi-Fi security option for a small office?', options: ['WEP', 'WPA', 'WPA2-TKIP', 'WPA3'], answer: 3, explain: 'WPA3 is the current standard.' },
        { d: 'sec', question: 'Which principle says users should have only the access they need for their job?', options: ['Least privilege', 'Implicit allow', 'Defense in depth', 'Separation of duties'], answer: 0, explain: 'Least privilege.' },
        { d: 'sec', question: 'Malware encrypts files and demands payment. Best defense for recovery?', options: ['Antivirus only', 'Tested, offline backups', 'A stronger Wi-Fi password', 'A bigger hard drive'], answer: 1, explain: 'Offline backups let you restore without paying.' },
        { d: 'sw', question: 'A browser keeps redirecting to unwanted sites and shows pop-ups. Most likely cause?', options: ['Failing RAM', 'Browser hijacker / adware', 'Bad network cable', 'Low disk space'], answer: 1, explain: 'Redirects and pop-ups are classic signs of adware or a browser hijacker.' },
        { d: 'sw', question: 'A Windows PC is slow right after login. Where do you check which programs launch at startup?', options: ['Task Manager > Startup', 'Disk Management', 'Device Manager', 'regedit only'], answer: 0, explain: 'Task Manager’s Startup tab lists startup apps and their impact.' },
        { d: 'sw', question: 'An application crashes on launch after an update. What’s a reasonable first step?', options: ['Reinstall Windows', 'Repair or reinstall the application', 'Replace the CPU', 'Disable the firewall'], answer: 1, explain: 'Start with the least invasive fix aimed at the changed component.' },
        { d: 'ops', question: 'Before making a major change to a production server, what should be in place?', options: ['Nothing; just do it', 'An approved change request with a rollback plan', 'A new monitor', 'A user survey'], answer: 1, explain: 'Change management requires approval and a backout plan.' },
        { d: 'ops', question: 'A customer is upset about a repeated failure. What’s the most professional response?', options: ['Argue that it isn’t your fault', 'Listen without interrupting, acknowledge the problem, and set clear expectations', 'Use lots of technical jargon', 'Take a personal call'], answer: 1, explain: 'Active listening and clear expectations are core professionalism topics.' },
        { d: 'ops', question: 'Which backup type copies only the changes since the last backup of any type?', options: ['Full', 'Differential', 'Incremental', 'Synthetic full'], answer: 2, explain: 'Incremental = changes since the last backup of any kind.' },
      ],
    },
    {
      id: 'network', title: 'Network+ practice', code: 'N10-009', track: 'network', length: 25,
      domains: { con: ['Networking Concepts', 23], impl: ['Network Implementation', 20], ops: ['Network Operations', 19], sec: ['Network Security', 14], ts: ['Network Troubleshooting', 24] },
      lessonDomain: { n1: 'con', n2: 'con', n3: 'impl', n4: 'impl', n5: 'con', n6: 'ts' },
      bank: [
        { d: 'impl', question: 'Which technology splits one physical switch into multiple separate broadcast domains?', options: ['VLANs', 'DNS', 'NAT', 'RAID'], answer: 0, explain: 'VLANs logically segment a switch.' },
        { d: 'impl', type: 'input', question: 'How many usable hosts does a /29 provide?', accept: ['6'], explain: '3 host bits: 8 − 2 = 6.' },
        { d: 'ops', question: 'Which protocol is used to collect device health information from network equipment?', options: ['SNMP', 'FTP', 'SMTP', 'Telnet'], answer: 0, explain: 'SNMP is used for monitoring network devices.' },
        { d: 'ops', question: 'Which document shows how devices are physically and logically connected?', options: ['A network diagram', 'A EULA', 'An SLA only', 'A purchase order'], answer: 0, explain: 'Network diagrams document topology.' },
        { d: 'sec', question: 'Which attack floods a service with traffic to make it unavailable?', options: ['DoS/DDoS', 'Phishing', 'Tailgating', 'Shoulder surfing'], answer: 0, explain: 'Denial of service targets availability.' },
        { d: 'sec', question: 'Which security approach requires verification for every access request, even inside the network?', options: ['Zero trust', 'Implicit trust', 'Open access', 'Security through obscurity'], answer: 0, explain: 'Zero trust: never trust, always verify.' },
        { d: 'ts', question: 'A user can reach local resources but not the internet. Other users are fine. What do you check?', options: ['Their default gateway setting', 'The building power', 'The DNS root servers', 'The ISP contract'], answer: 0, explain: 'A wrong or missing gateway blocks traffic leaving the local subnet.' },
        { d: 'ts', question: 'Which tool shows each router hop along the path to a destination?', options: ['ping', 'traceroute / tracert', 'nslookup', 'ipconfig'], answer: 1, explain: 'traceroute lists each hop.' },
        { d: 'con', question: 'Which OSI layer handles IP addressing and routing?', options: ['Layer 2', 'Layer 3', 'Layer 4', 'Layer 7'], answer: 1, explain: 'Layer 3, Network.' },
        { d: 'impl', question: 'Which protocol prevents switching loops in a network with redundant links?', options: ['Spanning Tree Protocol (STP)', 'DHCP', 'SMTP', 'ARP'], answer: 0, explain: 'STP blocks redundant paths to prevent loops.' },
        { d: 'impl', question: 'Which technology lets many private IP addresses share one public IP address?', options: ['NAT/PAT', 'VLAN', 'STP', 'DNS'], answer: 0, explain: 'Port address translation maps many internal hosts to one public address.' },
        { d: 'ops', question: 'Which document defines the uptime a provider guarantees to a customer?', options: ['SLA', 'AUP', 'NDA', 'MOU'], answer: 0, explain: 'A service-level agreement defines guaranteed performance and availability.' },
        { d: 'sec', question: 'Which protocol should replace Telnet for managing network devices?', options: ['SSH', 'HTTP', 'FTP', 'TFTP'], answer: 0, explain: 'SSH encrypts the session; Telnet is plain text.' },
        { d: 'sec', question: 'An attacker sets up a Wi-Fi access point with the same name as the company’s network. This is…', options: ['An evil twin', 'A VLAN', 'A honeypot', 'A DHCP reservation'], answer: 0, explain: 'An evil twin imitates a legitimate SSID to capture traffic.' },
        { d: 'ts', question: 'Two hosts report "duplicate IP address" errors. What’s the most likely cause?', options: ['A static IP set inside the DHCP pool', 'A bad monitor', 'An expired SSL certificate', 'Too much RAM'], answer: 0, explain: 'Static addresses must sit outside the DHCP scope, or be reserved.' },
        { d: 'ts', question: 'A long Ethernet run (150 m) has intermittent errors. What’s the likely issue?', options: ['It exceeds the ~100 m copper limit', 'Wrong DNS server', 'Wrong VLAN name', 'Too many SSIDs'], answer: 0, explain: 'Twisted-pair Ethernet is limited to about 100 m.' },
        { d: 'con', question: 'Which protocol is connectionless?', options: ['TCP', 'UDP'], answer: 1, explain: 'UDP has no handshake.' },
      ],
    },
    {
      id: 'secplus', title: 'Security+ practice', code: 'SY0-701', track: 'secplus', length: 25,
      domains: { gen: ['General Security Concepts', 12], thr: ['Threats, Vulnerabilities & Mitigations', 22], arch: ['Security Architecture', 18], ops: ['Security Operations', 28], gov: ['Security Program Management & Oversight', 20] },
      lessonDomain: { s1: 'gen', s2: 'gen', s3: 'gen', s4: 'gov', s5: 'ops', s6: 'gov' },
      bank: [
        { d: 'thr', question: 'A vulnerability is exploited before the vendor knows about it or has a patch. This is a…', options: ['Zero-day', 'Legacy system', 'Misconfiguration', 'Insider threat'], answer: 0, explain: 'Zero-day: no fix exists yet.' },
        { d: 'thr', question: 'A former employee still has working credentials and deletes files. Which threat actor type?', options: ['Nation-state', 'Insider threat', 'Hacktivist', 'Script kiddie'], answer: 1, explain: 'Someone with (former) legitimate access is an insider threat.' },
        { d: 'thr', question: 'Which mitigation BEST reduces the impact of credential stuffing (reused passwords from other breaches)?', options: ['MFA', 'Longer screen timeout', 'RAID 5', 'Disabling DNS'], answer: 0, explain: 'MFA makes a stolen password insufficient by itself.' },
        { d: 'arch', question: 'Placing public web servers in a separate network zone from internal systems is called…', options: ['Segmentation (a screened subnet / DMZ)', 'Hashing', 'Tokenization', 'Steganography'], answer: 0, explain: 'Segmentation limits what an attacker reaches if a public server falls.' },
        { d: 'arch', question: 'Which control protects data stored on a stolen laptop?', options: ['Full-disk encryption', 'A screen saver', 'A longer Wi-Fi password', 'Port forwarding'], answer: 0, explain: 'Full-disk encryption protects data at rest.' },
        { d: 'ops', question: 'Which tool collects and correlates logs from many systems to detect attacks?', options: ['SIEM', 'IDE', 'UPS', 'KVM'], answer: 0, explain: 'A SIEM aggregates and correlates security events.' },
        { d: 'ops', question: 'A vulnerability scan finds 300 issues. How should remediation be prioritized?', options: ['Alphabetically', 'By severity and exposure (e.g. CVSS plus asset criticality)', 'Oldest first', 'Randomly'], answer: 1, explain: 'Risk-based prioritization: severe flaws on critical, exposed assets first.' },
        { d: 'gov', question: 'Which document defines how users may use company systems?', options: ['Acceptable use policy (AUP)', 'SLA', 'MOU', 'Bill of materials'], answer: 0, explain: 'The AUP defines acceptable behavior.' },
        { d: 'gen', question: 'Which concept means using several layers of security controls so one failure doesn’t expose everything?', options: ['Defense in depth', 'Single point of failure', 'Shadow IT', 'Fail open'], answer: 0, explain: 'Layered controls back each other up.' },
        { d: 'gen', question: 'A digital signature primarily provides integrity and…', options: ['Non-repudiation', 'Availability', 'Compression', 'Anonymity'], answer: 0, explain: 'Only the private key holder could have signed it.' },
        { d: 'thr', question: 'An email crafted for one specific executive, using details about them, is…', options: ['Whaling / spear phishing', 'Vishing', 'Smishing', 'Typosquatting'], answer: 0, explain: 'Targeted phishing of senior executives is whaling.' },
        { d: 'thr', question: 'An attacker registers "harb0rview.example" to trick users. This is…', options: ['Typosquatting / a lookalike domain', 'A DDoS', 'Tailgating', 'A rootkit'], answer: 0, explain: 'Lookalike domains exploit typos and quick glances.' },
        { d: 'arch', question: 'Which cloud model shares responsibility, with the customer always responsible for their data and access configuration?', options: ['All of them: IaaS, PaaS and SaaS', 'Only IaaS', 'Only SaaS', 'None'], answer: 0, explain: 'Data and identity/access settings stay with the customer in every model.' },
        { d: 'arch', question: 'Which technique replaces sensitive data such as card numbers with a non-sensitive stand-in value?', options: ['Tokenization', 'Hashing', 'Compression', 'Load balancing'], answer: 0, explain: 'Tokenization swaps data for a token that maps back only inside a secure vault.' },
        { d: 'ops', question: 'During an incident, what should happen BEFORE eradication?', options: ['Containment', 'Lessons learned', 'Recovery', 'Closing the ticket'], answer: 0, explain: 'Contain first, then eradicate, then recover.' },
        { d: 'ops', question: 'Which document records every person who handled forensic evidence?', options: ['Chain of custody', 'AUP', 'SLA', 'Risk register'], answer: 0, explain: 'Chain of custody keeps evidence admissible.' },
        { d: 'gov', question: 'Where are identified risks, their owners and their treatments tracked?', options: ['A risk register', 'A DNS zone', 'A RAID array', 'A SIEM dashboard only'], answer: 0, explain: 'The risk register is the central risk-tracking document.' },
        { d: 'gov', question: 'A penetration test must be preceded by what?', options: ['Written authorization and agreed rules of engagement', 'A verbal OK from any employee', 'Nothing', 'A press release'], answer: 0, explain: 'Testing without written authorization is illegal in most countries.' },
        { d: 'gen', question: 'Which control type is a security guard at a door?', options: ['Physical', 'Technical', 'Managerial', 'Compensating only'], answer: 0, explain: 'Guards, fences and locks are physical controls.' },
      ],
    },
  ];

  // Fisher–Yates shuffle with an injectable random().
  function shuffle(arr, random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Every question available for an exam, tagged with a domain key.
  function pool(exam, tracks) {
    const t = tracks.find((x) => x.id === exam.track);
    const items = [];
    if (t) {
      for (const l of t.lessons) {
        const d = exam.lessonDomain[l.id];
        if (!d) continue;
        const ex = l.exercise;
        if (ex.type === 'quiz' || ex.type === 'input') items.push(Object.assign({ d, id: l.id + ':ex' }, ex));
        (l.review || []).forEach((r, i) => items.push(Object.assign({ type: 'quiz', d, id: l.id + ':r' + i }, r)));
      }
    }
    exam.bank.forEach((b, i) => items.push(Object.assign({ type: 'quiz', id: exam.id + ':b' + i }, b)));
    return items;
  }

  // Pick questions in proportion to the official domain weights (like the real
  // exam blueprint), then fill any shortfall at random from what's left.
  function stratify(exam, items, random) {
    const byD = {};
    shuffle(items, random).forEach((q) => { (byD[q.d] = byD[q.d] || []).push(q); });
    const picked = [];
    for (const k of Object.keys(exam.domains)) {
      const want = Math.max(1, Math.round((exam.domains[k][1] / 100) * exam.length));
      picked.push(...(byD[k] || []).splice(0, want));
    }
    const rest = shuffle([].concat(...Object.values(byD)), random);
    while (picked.length < exam.length && rest.length) picked.push(rest.pop());
    return shuffle(picked.slice(0, exam.length), random);
  }

  // Build a randomized exam: weighted pick, then shuffle answer options (remapping the answer index).
  function build(exam, tracks, random) {
    const picked = stratify(exam, pool(exam, tracks), random);
    return picked.map((q) => {
      if (q.type === 'input') return q;
      const order = shuffle(q.options.map((_, i) => i), random);
      return Object.assign({}, q, { options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) });
    });
  }

  function isCorrect(q, a) {
    if (a === undefined || a === null || a === '') return false;
    if (q.type === 'input') {
      const n = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
      return q.accept.some((x) => n(x) === n(a));
    }
    return a === q.answer;
  }

  // Returns {correct, total, pct, byDomain: {key: {name, weight, correct, total}}}
  function grade(exam, questions, answers) {
    const byDomain = {};
    Object.keys(exam.domains).forEach((k) => { byDomain[k] = { name: exam.domains[k][0], weight: exam.domains[k][1], correct: 0, total: 0 }; });
    let correct = 0;
    questions.forEach((q, i) => {
      const ok = isCorrect(q, answers[i]);
      if (ok) correct++;
      byDomain[q.d].total++;
      if (ok) byDomain[q.d].correct++;
    });
    return { correct, total: questions.length, pct: questions.length ? Math.round((correct / questions.length) * 100) : 0, byDomain };
  }

  const api = { EXAMS, pool, build, grade, isCorrect, shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CM = root.CM || {}; root.CM.exams = api; }
})(typeof window !== 'undefined' ? window : globalThis);
