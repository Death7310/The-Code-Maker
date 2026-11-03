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
  const path = ['zero', 'aplus1', 'aplus2', 'network', 'secplus', 'practice'];

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
      name: 'CompTIA Network+',
      exam: 'N10-009',
      track: 'network',
      weeks: '2–4 months',
      domains: ['Networking Concepts 23% · Network Implementation 20% · Network Operations 19% · Network Security 14% · Network Troubleshooting 24%'],
      handsOn: 'Use Cisco Packet Tracer (free with a Cisco Networking Academy account) to build networks. Drill subnetting until it’s automatic. Read packet captures in Wireshark on your own lab traffic.',
    },
    {
      stage: 3,
      name: 'CompTIA Security+',
      exam: 'SY0-701',
      track: 'secplus',
      weeks: '2–4 months',
      domains: ['General Security Concepts 12% · Threats, Vulnerabilities & Mitigations 22% · Security Architecture 18% · Security Operations 28% · Security Program Management & Oversight 20%'],
      handsOn: 'Set up central logging in your lab. Practice hashing and verifying files. Write a short incident report about a simulated event.',
    },
    {
      stage: 4,
      name: 'Specialize: CompTIA PenTest+ (offensive) or CySA+ (defensive)',
      exam: 'PenTest+ PT0-003 · CySA+',
      track: 'practice',
      weeks: '3–6 months',
      domains: ['PenTest+: Engagement Management 13% · Reconnaissance & Enumeration 21% · Vulnerability Discovery & Analysis 17% · Attacks & Exploits 35% · Post-exploitation & Lateral Movement 14%'],
      handsOn: 'Practice only in your own lab or on training platforms whose terms authorize testing. Write full reports for each exercise and publish sanitized write-ups as a portfolio.',
    },
  ];

  const optional = [
    { name: 'Linux (CompTIA Linux+ or Red Hat RHCSA)', when: 'Any time after A+', why: 'Most servers and security tools run on Linux. RHCSA is entirely hands-on and highly regarded.' },
    { name: 'Cisco CCNA', when: 'Instead of, or after, Network+', why: 'Deeper and more hands-on networking. Harder than Network+, but carries more weight for network roles.' },
    { name: 'Cisco CCNA Automation (formerly DevNet)', when: 'After Network+ and some Python', why: 'Networking plus code and APIs. A strong combination for both versatility and AI resilience.' },
    { name: 'EC-Council CEH', when: 'Only if job postings ask for it', why: 'Wide catalog of attack techniques and recognized by HR filters. Many practitioners see it as wide but shallow.' },
  ];

  const tracks = path.concat(coding.map((c) => c.id)).map((id) => registry[id]).filter(Boolean);
  const api = { tracks, path, coding, roadmap, optional };
  CM.curriculum = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
