/*
 * drills.js — endless generated practice: subnetting, binary, ports.
 * Every problem comes with a worked solution, because novices learn most
 * from worked examples (Sweller & Cooper, 1985; Kalyuga, 2007).
 * Pure functions; pass a random() function in for deterministic tests.
 */
(function (root) {
  'use strict';

  // ---------- IPv4 helpers ----------
  const toInt = (ip) => ip.split('.').reduce((a, o) => ((a << 8) >>> 0) + Number(o), 0) >>> 0;
  const toIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');
  const maskInt = (p) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);

  function subnet(ip, prefix) {
    const m = maskInt(prefix);
    const net = (toInt(ip) & m) >>> 0;
    const bc = (net | (~m >>> 0)) >>> 0;
    const size = 2 ** (32 - prefix);
    return {
      mask: toIp(m),
      network: toIp(net),
      broadcast: toIp(bc),
      first: toIp(net + 1),
      last: toIp(bc - 1),
      size,
      usable: prefix >= 31 ? 0 : size - 2,
    };
  }

  // Worked explanation using the "block size" method.
  function workedBlock(ip, prefix) {
    const s = subnet(ip, prefix);
    const octIdx = Math.min(3, Math.floor(prefix / 8)); // the "interesting" octet
    const maskOct = Number(s.mask.split('.')[octIdx]);
    const block = 256 - maskOct;
    const v = Number(ip.split('.')[octIdx]);
    const start = Math.floor(v / block) * block;
    const names = ['1st', '2nd', '3rd', '4th'];
    return `/${prefix} → mask ${s.mask}. The interesting octet is the ${names[octIdx]} (mask value ${maskOct}). ` +
      `Block size = 256 − ${maskOct} = ${block}. ${v} falls in the block starting at ${start} ` +
      `(${start} to ${start + block - 1}). Network = ${s.network}, broadcast = ${s.broadcast}.`;
  }

  function rnd(random, lo, hi) { return lo + Math.floor(random() * (hi - lo + 1)); }
  function randomIp(random) {
    const first = [10, 172, 192][rnd(random, 0, 2)];
    const second = first === 10 ? rnd(random, 0, 255) : first === 172 ? rnd(random, 16, 31) : 168;
    return [first, second, rnd(random, 0, 255), rnd(random, 1, 254)].join('.');
  }

  // ---------- generators ----------
  const SUBNET_KINDS = ['hosts', 'mask', 'network', 'broadcast', 'first', 'last', 'same'];

  function subnetProblem(random, kind) {
    kind = kind || SUBNET_KINDS[rnd(random, 0, SUBNET_KINDS.length - 1)];
    const prefix = rnd(random, 17, 30);
    const ip = randomIp(random);
    const s = subnet(ip, prefix);
    const hostBits = 32 - prefix;
    switch (kind) {
      case 'hosts':
        return { kind, question: `How many usable host addresses are in a /${prefix} network?`, accept: [String(s.usable)],
          explain: `Host bits = 32 − ${prefix} = ${hostBits}. 2^${hostBits} = ${s.size}, minus network and broadcast = ${s.usable}.` };
      case 'mask':
        return { kind, question: `Write /${prefix} as a dotted-decimal subnet mask.`, accept: [s.mask],
          explain: `${prefix} ones followed by ${hostBits} zeros = ${s.mask}.` };
      case 'network':
        return { kind, question: `What is the network address of ${ip}/${prefix}?`, accept: [s.network], explain: workedBlock(ip, prefix) };
      case 'broadcast':
        return { kind, question: `What is the broadcast address of ${ip}/${prefix}?`, accept: [s.broadcast], explain: workedBlock(ip, prefix) };
      case 'first':
        return { kind, question: `What is the FIRST usable host address in ${ip}/${prefix}?`, accept: [s.first], explain: workedBlock(ip, prefix) + ` First usable = network + 1 = ${s.first}.` };
      case 'last':
        return { kind, question: `What is the LAST usable host address in ${ip}/${prefix}?`, accept: [s.last], explain: workedBlock(ip, prefix) + ` Last usable = broadcast − 1 = ${s.last}.` };
      case 'same': {
        // Pick a second address either in the same block or just outside it.
        const inside = random() < 0.5;
        const base = toInt(s.network);
        const other = inside
          ? toIp(base + rnd(random, 1, Math.max(1, s.size - 2)))
          : toIp((base + s.size + rnd(random, 0, Math.min(s.size - 1, 200))) >>> 0);
        const same = subnet(other, prefix).network === s.network;
        return { kind, question: `Are ${ip} and ${other} in the same /${prefix} subnet? (yes/no)`, accept: [same ? 'yes' : 'no', same ? 'y' : 'n'],
          explain: `${ip}/${prefix} is in ${s.network}–${s.broadcast}. ${other}/${prefix} is in network ${subnet(other, prefix).network}. ${same ? 'Same network.' : 'Different networks.'}` };
      }
      default:
        throw new Error('unknown kind ' + kind);
    }
  }

  function binaryProblem(random) {
    const n = rnd(random, 1, 255);
    const bin = n.toString(2).padStart(8, '0');
    const parts = [128, 64, 32, 16, 8, 4, 2, 1].filter((v, i) => bin[i] === '1');
    if (random() < 0.5) {
      return { kind: 'bin2dec', question: `Convert binary ${bin} to decimal.`, accept: [String(n)], explain: `Add the place values where there is a 1: ${parts.join(' + ')} = ${n}.` };
    }
    return { kind: 'dec2bin', question: `Convert ${n} to 8-bit binary.`, accept: [bin], explain: `${n} = ${parts.join(' + ')} → put a 1 under each of those place values (128 64 32 16 8 4 2 1): ${bin}.` };
  }

  const PORTS = [
    [20, 'FTP data'], [21, 'FTP control'], [22, 'SSH'], [23, 'Telnet'], [25, 'SMTP'], [53, 'DNS'],
    [67, 'DHCP server'], [80, 'HTTP'], [110, 'POP3'], [137, 'NetBIOS name service'], [143, 'IMAP'],
    [161, 'SNMP'], [389, 'LDAP'], [443, 'HTTPS'], [445, 'SMB'], [3389, 'RDP'],
  ];
  function portProblem(random) {
    const [port, name] = PORTS[rnd(random, 0, PORTS.length - 1)];
    if (random() < 0.5) {
      return { kind: 'port', question: `Which port number does ${name} use?`, accept: [String(port)], explain: `${name} = ${port}.` };
    }
    return { kind: 'service', question: `Which service/protocol uses port ${port}?`, accept: [name, name.split(' ')[0]], explain: `Port ${port} = ${name}.` };
  }

  const DRILLS = {
    subnet: { title: 'Subnetting', blurb: 'Hosts, masks, network/broadcast, ranges and same-subnet checks. Network+ and Security+ assume you can do these quickly.', make: (r) => subnetProblem(r) },
    binary: { title: 'Binary ↔ decimal', blurb: 'The skill underneath subnetting. Aim for under 10 seconds per problem.', make: binaryProblem },
    ports: { title: 'Ports & protocols', blurb: 'The port numbers every CompTIA exam expects you to know cold.', make: portProblem },
  };

  function check(problem, answer) {
    const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
    return problem.accept.some((a) => norm(a) === norm(answer));
  }

  const api = { subnet, subnetProblem, binaryProblem, portProblem, DRILLS, SUBNET_KINDS, check, toInt, toIp };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CM = root.CM || {}; root.CM.drills = api; }
})(typeof window !== 'undefined' ? window : globalThis);
