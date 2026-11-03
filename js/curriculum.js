/*
 * curriculum.js — puts the tracks registered by js/content/*.js in order and
 * defines the certification roadmap.
 *
 * Exercise types (see js/app.js):
 *   shell  — type a command in the sandbox; passes when output === expect
 *   python — edit code, run in-browser; passes when stdout === expect
 *   quiz   — multiple choice; `answer` is the correct option's index
 *   input  — short typed answer; passes if it matches any of `accept`
 * Lessons may also carry `review`: extra quiz/input items that feed the
 * spaced-review queue once the lesson is complete.
 *
 * Exam details change. Always confirm against CompTIA's official objectives.
 */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  const registry = CM.tracks || {};

  // The certification path, in order. Each stage points at one track.
  // Ordered by leverage: each stage reuses what the earlier ones taught
  // (prerequisite ordering, after Gagne's learning hierarchies).
  const path = ['zero', 'aplus1', 'aplus2', 'linux', 'network', 'secplus', 'cloud', 'aws', 'azure', 'practice'];

  // Coding tracks run alongside the path; `start` says when to begin each one.
  const coding = [
    { id: 'bash', start: 'Start after Ground Zero' },
    { id: 'powershell', start: 'Start during A+ Core 2' },
    { id: 'python', start: 'Start during Network+' },
  ];

  const roadmap = [
    {
      stage: 0,
      name: 'Ground Zero',
      exam: 'No exam',
      track: 'zero',
      weeks: '1–2 weeks',
      domains: [],
      handsOn: 'Set up a study routine. If you can, get an old PC to take apart (unplugged).',
    },
    {
      stage: 1,
      name: 'CompTIA A+ (two exams)',
      exam: '220-1201 (Core 1) + 220-1202 (Core 2)',
      track: 'aplus1',
      weeks: '3–6 months for both',
      domains: [
        'Core 1: Mobile Devices 13% · Networking 23% · Hardware 25% · Virtualization & Cloud 11% · Hardware & Network Troubleshooting 28%',
        'Core 2: Operating Systems 28% · Security 28% · Software Troubleshooting 23% · Operational Procedures 21%',
      ],
      handsOn: 'Install VirtualBox. Build Windows and Linux VMs. Reinstall an OS, break and fix network settings, practice the command-line tools.',
    },
    {
      stage: 2,
      name: 'Linux hands-on',
      exam: 'Optional: CompTIA Linux+ or Red Hat RHCSA',
      track: 'linux',
      weeks: '4–8 weeks',
      domains: [],
      handsOn: 'Install a Linux VM (Ubuntu or Rocky Linux) and redo every sandbox exercise for real. Set up SSH keys, create users and groups, write a backup script, and read your own auth.log.',
    },
    {
      stage: 3,
      name: 'CompTIA Network+',
      exam: 'N10-009',
      track: 'network',
      weeks: '2–4 months',
      domains: ['Networking Concepts 23% · Network Implementation 20% · Network Operations 19% · Network Security 14% · Network Troubleshooting 24%'],
      handsOn: 'Use Cisco Packet Tracer (free with a Cisco Networking Academy account) to build networks. Drill subnetting until it’s automatic. Read packet captures in Wireshark on your own lab traffic.',
    },
    {
      stage: 4,
      name: 'CompTIA Security+',
      exam: 'SY0-701',
      track: 'secplus',
      weeks: '2–4 months',
      domains: ['General Security Concepts 12% · Threats, Vulnerabilities & Mitigations 22% · Security Architecture 18% · Security Operations 28% · Security Program Management & Oversight 20%'],
      handsOn: 'Set up central logging in your lab. Practice hashing and verifying files. Write a short incident report about a simulated event.',
    },
    {
      stage: 5,
      name: 'Cloud: vendor-neutral foundations, then AWS and Azure',
      exam: 'AWS Cloud Practitioner CLF-C02 · Microsoft Azure Fundamentals AZ-900',
      track: 'cloud',
      weeks: '1–2 months each',
      domains: [
        'CLF-C02: Cloud Concepts 24% · Security & Compliance 30% · Cloud Technology & Services 34% · Billing, Pricing & Support 12%',
        'AZ-900: Cloud Concepts 25–30% · Azure Architecture & Services 35–40% · Management & Governance 30–35% (check the current Microsoft Learn study guide)',
      ],
      handsOn: 'Open free-tier accounts and set a budget alert BEFORE building anything. Create users with MFA, a private storage bucket and a small virtual network. Read your own audit logs (CloudTrail / Activity Log). Delete everything when you finish each session.',
    },
    {
      stage: 6,
      name: 'Specialize: CompTIA PenTest+ (offensive) or CySA+ (defensive)',
      exam: 'PenTest+ PT0-003 · CySA+',
      track: 'practice',
      weeks: '3–6 months',
      domains: ['PenTest+: Engagement Management 13% · Reconnaissance & Enumeration 21% · Vulnerability Discovery & Analysis 17% · Attacks & Exploits 35% · Post-exploitation & Lateral Movement 14%'],
      handsOn: 'Practice only in your own lab or on training platforms whose terms authorize testing. Write full reports for each exercise and publish sanitized write-ups as a portfolio.',
    },
  ];

  const optional = [
    { name: 'Cisco CCNA', when: 'Instead of, or after, Network+', why: 'Deeper and more hands-on networking. Harder than Network+, but carries more weight for network roles.' },
    { name: 'Cisco CCNA Automation (formerly DevNet)', when: 'After Network+ and some Python', why: 'Networking plus code and APIs. A strong combination for both versatility and AI resilience.' },
    { name: 'Cloud security next steps (AWS Security Specialty, Microsoft AZ-500 / SC-200)', when: 'After the cloud fundamentals and Security+', why: 'Cloud security engineering and cloud SOC roles. Highly versatile, because nearly every organization now runs in the cloud.' },
    { name: 'EC-Council CEH', when: 'Only if job postings ask for it', why: 'Wide catalog of attack techniques and recognized by HR filters. Many practitioners see it as wide but shallow.' },
  ];

  const tracks = path.concat(coding.map((c) => c.id)).map((id) => registry[id]).filter(Boolean);
  // Why the path is in this order, shown on the Roadmap page.
  const rationale = [
    'Each stage is a prerequisite for the next. Skills are learned in dependency order, so nothing new arrives without the foundation it rests on (Gagne, 1968, learning hierarchies).',
    'A+ gives you hardware and operating systems, which every later stage assumes. Linux comes next because servers, cloud machines and nearly every security tool run on it, and it turns your Bash practice into real system administration. Network+ gives you networking, which cloud and security both depend on. Security+ gives you identity, risk and incident response, which cloud security and testing apply.',
    'Cloud comes after Security+ because it is mostly reuse: CIDR subnets, Linux and Windows servers, least privilege and logging, in a new environment. That makes it high leverage for little new material.',
    'Coding runs alongside instead of in a block, because each language becomes useful at a specific stage: Bash for Linux, PowerShell for Windows and Azure, Python for automation across everything.',
    'Missions fade support as you advance: Guided, then Supported, then Independent. Novices learn best from worked guidance, but the same guidance gets in the way once you know more (Kalyuga, 2007, expertise reversal effect).',
  ];

  const api = { tracks, path, coding, roadmap, optional, rationale };
  CM.curriculum = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
