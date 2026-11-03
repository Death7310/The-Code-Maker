/* Generators: Network+, Security+, Cloud (vendor-neutral, AWS, Azure). See practice/engine.js. */
(function (root) {
  'use strict';
  const isNode = typeof module !== 'undefined' && module.exports;
  const P = isNode ? require('./engine.js') : root.CM.practice;
  const D = isNode ? require('../drills.js') : root.CM.drills;
  const { register, int, pick, sample, choice, input } = P;

  // ===== Network+ =====
  const OSI = [
    ['A switch forwarding frames by MAC address', 2], ['A router choosing a path by IP address', 3], ['TCP retransmitting a lost segment', 4],
    ['UDP port numbers identifying an application', 4], ['An HTTP request for a web page', 7], ['A DNS query', 7], ['Voltage on a copper cable', 1],
    ['A fiber transceiver converting light to signals', 1], ['ARP resolving an IP address to a MAC address', 2], ['ICMP ping messages', 3],
    ['TLS encryption of the data format', 6], ['A wireless access point bridging radio to Ethernet frames', 2], ['A hub repeating signals to every port', 1],
    ['A layer 4 load balancer splitting traffic by port', 4], ['SMTP transferring an email', 7],
  ];
  register('osi.layer', { topic: 'OSI layers' }, (r) => {
    const [what, layer] = pick(r, OSI);
    const names = ['', 'Physical', 'Data Link', 'Network', 'Transport', 'Session', 'Presentation', 'Application'];
    return input(`At which OSI layer (number 1–7) does this operate?\n"${what}"`, [String(layer), `layer ${layer}`, names[layer]],
      `Layer ${layer} (${names[layer]}). Anchors: 1 signals/cables, 2 MAC/switches, 3 IP/routers, 4 ports/TCP/UDP, 7 the application protocol itself.`,
      { hint: 'Is it about signals, MAC addresses, IP addresses, ports, or the application protocol?' });
  });
  const TU = [
    ['A live voice call where a late packet is useless', 'UDP'], ['Downloading a software installer that must arrive intact', 'TCP'], ['Online multiplayer game position updates', 'UDP'],
    ['Loading a web page over HTTPS', 'TCP'], ['A typical DNS lookup', 'UDP'], ['Sending email between servers (SMTP)', 'TCP'], ['Video livestream to thousands of viewers', 'UDP'],
    ['SSH remote administration', 'TCP'], ['DHCP address assignment', 'UDP'], ['Syslog messages to a collector (traditional)', 'UDP'],
  ];
  register('net.tcpudp', { topic: 'TCP vs UDP' }, (r) => {
    const [what, a] = pick(r, TU);
    return choice(r, `Which transport fits best?\n"${what}"`, a, [a === 'TCP' ? 'UDP' : 'TCP'],
      `${a}. TCP = reliable, ordered, connection-based (handshake, retransmission). UDP = fast, connectionless, no delivery guarantee, so it suits real-time traffic where waiting for resends is worse than a gap.`);
  });
  const DNS = [
    ['Point www.shop.example to the IPv4 address 203.0.113.10', 'A'], ['Point api.shop.example to an IPv6 address', 'AAAA'],
    ['Make blog.shop.example an alias of shop-blog.hosting.example', 'CNAME'], ['Say which server receives email for shop.example', 'MX'],
    ['Publish an SPF policy listing allowed email senders', 'TXT'], ['Let 203.0.113.10 resolve back to a hostname (reverse lookup)', 'PTR'],
    ['Delegate the zone to specific authoritative name servers', 'NS'],
  ];
  register('dns.record', { topic: 'DNS record types' }, (r) => {
    const [need, rec] = pick(r, DNS);
    return choice(r, `Which DNS record type do you create?\n"${need}"`, rec, sample(r, DNS.map((d) => d[1]).filter((x) => x !== rec), 3),
      `${rec}. A = IPv4, AAAA = IPv6, CNAME = alias, MX = mail, TXT = text (SPF/DKIM/DMARC), PTR = reverse, NS = delegation.`);
  });

  // Diagnose from a consistent set of test results: the first failing test points to the layer.
  const DIAG = [
    { fault: 'Physical connection (cable / Wi-Fi link)', fail: 0, detail: 'The link light is off / Wi-Fi shows disconnected' },
    { fault: 'Addressing (DHCP failure)', fail: 1, detail: 'ipconfig shows 169.254.23.9' },
    { fault: 'Default gateway / local routing', fail: 2, detail: 'ping to the gateway 10.20.0.1 times out' },
    { fault: 'Upstream / ISP connectivity', fail: 3, detail: 'ping 9.9.9.9 (outside IP) times out' },
    { fault: 'DNS name resolution', fail: 4, detail: 'nslookup example.com fails' },
  ];
  const TESTS = ['Link light / Wi-Fi connected', 'Valid IP address (ipconfig)', 'ping default gateway', 'ping an outside IP address', 'nslookup a name'];
  register('net.diagnose', { topic: 'Bottom-up network diagnosis' }, (r) => {
    const d = pick(r, DIAG);
    const lines = TESTS.map((t, i) => (i < d.fail ? `✔ ${t}` : i === d.fail ? `✘ ${t} (${d.detail})` : `– ${t}: not reached`));
    return choice(r, `A user can't browse the web. Your bottom-up tests:\n${lines.join('\n')}\nWhere is the fault?`, d.fault, DIAG.map((x) => x.fault).filter((x) => x !== d.fault).slice(0, 4).sort(() => r() - 0.5).slice(0, 3),
      `Everything below the first failure works, so the problem is at the first ✘: ${d.fault}. Working bottom-up avoids chasing symptoms.`);
  });
  register('sub.mixed', { topic: 'Subnetting' }, (r) => {
    const p = D.subnetProblem(r);
    return input(p.question, p.accept, p.explain, { hint: 'Find the block size: 256 minus the interesting octet of the mask.' });
  });

  // ===== Security+ =====
  const CIA = [
    ['A DDoS attack makes the online store unreachable', 'Availability'], ['An attacker reads patient records they shouldn\'t see', 'Confidentiality'],
    ['Someone alters a bank transfer amount in transit', 'Integrity'], ['A laptop with unencrypted customer data is stolen', 'Confidentiality'],
    ['A power outage takes down the only data center', 'Availability'], ['File hashes are compared to detect tampering', 'Integrity'],
    ['Encryption is applied to backups', 'Confidentiality'], ['A web server cluster spans two regions', 'Availability'],
    ['Malware silently changes values in a database', 'Integrity'], ['Screen privacy filters on open-plan desks', 'Confidentiality'],
  ];
  register('cia.classify', { topic: 'CIA triad' }, (r) => {
    const [s, a] = pick(r, CIA);
    return choice(r, `Which part of the CIA triad is MOST directly involved?\n"${s}"`, a, ['Confidentiality', 'Integrity', 'Availability'],
      `${a}. Confidentiality = who can SEE it; Integrity = whether it was CHANGED; Availability = whether it can be USED when needed.`);
  });
  const PEOPLE = ['Ana', 'Ben', 'Chloe', 'Dev', 'Eli', 'Fatima'];
  register('crypto.keys', { topic: 'Which key?' }, (r) => {
    const [a, b] = sample(r, PEOPLE, 2);
    const keys = [`${a}'s public key`, `${a}'s private key`, `${b}'s public key`, `${b}'s private key`];
    const task = pick(r, [
      [`${a} wants to send ${b} a message only ${b} can read. ${a} encrypts it with…`, `${b}'s public key`, `Encrypt with the RECIPIENT's public key; only the recipient's private key can decrypt it.`],
      [`${b} receives a message encrypted for them by ${a}. ${b} decrypts it with…`, `${b}'s private key`, `Only the recipient's own private key decrypts what was encrypted to their public key.`],
      [`${a} wants to digitally sign a contract so anyone can confirm it came from ${a}. ${a} signs with…`, `${a}'s private key`, `Sign with your OWN private key; only you have it, which proves origin (non-repudiation).`],
      [`${b} wants to verify ${a}'s digital signature. ${b} uses…`, `${a}'s public key`, `Verify with the SIGNER's public key, which anyone can obtain.`],
    ]);
    return choice(r, task[0], task[1], keys.filter((k) => k !== task[1]), task[2] + ' Rule of thumb: encrypt → recipient\'s public; sign → sender\'s private.');
  });
  register('risk.ale', { topic: 'Quantitative risk (SLE, ALE)' }, (r) => {
    const av = pick(r, [20000, 50000, 80000, 120000, 250000, 400000]);
    const ef = pick(r, [0.1, 0.2, 0.25, 0.4, 0.5, 0.75]);
    const aro = pick(r, [0.1, 0.2, 0.25, 0.5, 2, 3]);
    const sle = Math.round(av * ef);
    const ale = Math.round(sle * aro);
    const fmt = (n) => n.toLocaleString('en-US');
    if (r() < 0.4) return input(`An asset is worth $${fmt(av)}. One incident destroys ${ef * 100}% of its value. What is the single loss expectancy (SLE) in dollars?`, [String(sle), fmt(sle), '$' + fmt(sle)],
      `SLE = asset value × exposure factor = ${fmt(av)} × ${ef} = $${fmt(sle)}.`, { hint: 'SLE = AV × EF.' });
    return input(`Asset value $${fmt(av)}, exposure factor ${ef * 100}%, and the incident is expected ${aro} time(s) per year. What is the annualized loss expectancy (ALE) in dollars?`, [String(ale), fmt(ale), '$' + fmt(ale)],
      `SLE = ${fmt(av)} × ${ef} = $${fmt(sle)}. ALE = SLE × ARO = ${fmt(sle)} × ${aro} = $${fmt(ale)}. If a control costs less per year than the ALE it removes, it's usually worth it.`,
      { hint: 'First SLE = AV × EF, then ALE = SLE × ARO.' });
  });
  const RISK = [
    ['Buying cyber-insurance for breach costs', 'Transfer'], ['Deploying MFA to reduce account takeover', 'Mitigate'],
    ['Shutting down a risky legacy service entirely', 'Avoid'], ['Formally documenting that a low-impact risk will be tolerated', 'Accept'],
    ['Outsourcing payment processing to a PCI-compliant provider', 'Transfer'], ['Patching a vulnerable server', 'Mitigate'],
    ['Deciding not to launch a product in a high-risk market', 'Avoid'],
  ];
  register('risk.response', { topic: 'Risk responses' }, (r) => {
    const [s, a] = pick(r, RISK);
    return choice(r, `Which risk response is this?\n"${s}"`, a, ['Mitigate', 'Transfer', 'Avoid', 'Accept'],
      `${a}. Mitigate = reduce it; Transfer = shift the impact to someone else; Avoid = stop the activity; Accept = knowingly live with it.`);
  });
  const IR = [
    ['Writing the incident response plan and running a tabletop exercise', 'Preparation'], ['A SIEM alert is confirmed as a real intrusion', 'Detection & analysis'],
    ['Isolating infected hosts from the network', 'Containment'], ['Removing the malware and closing the exploited vulnerability', 'Eradication'],
    ['Restoring systems from clean backups and monitoring them', 'Recovery'], ['A post-incident review updates procedures', 'Lessons learned'],
    ['Disabling a compromised account so it can\'t be used further', 'Containment'],
  ];
  register('ir.phase', { topic: 'Incident response phases' }, (r) => {
    const [s, a] = pick(r, IR);
    return choice(r, `Which incident response phase is this?\n"${s}"`, a, sample(r, ['Preparation', 'Detection & analysis', 'Containment', 'Eradication', 'Recovery', 'Lessons learned'].filter((x) => x !== a), 3),
      `${a}. Order: preparation → detection & analysis → containment → eradication → recovery → lessons learned.`);
  });

  // ===== Cloud =====
  const ACTIONS = ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'];
  const matches = (pat, act) => pat === '*' || pat === act || (pat.endsWith('*') && act.startsWith(pat.slice(0, -1)));
  register('policy.eval', { topic: 'Evaluating permission policies' }, (r) => {
    const stmts = [];
    const n = int(r, 1, 3);
    for (let i = 0; i < n; i++) {
      stmts.push({ Effect: r() < 0.3 && i > 0 ? 'Deny' : 'Allow', Action: pick(r, ['s3:*', 's3:Get*', 's3:Put*', 's3:GetObject', 's3:DeleteObject', 's3:List*']) });
    }
    const act = pick(r, ACTIONS);
    const hit = stmts.filter((s) => matches(s.Action, act));
    const denied = hit.some((s) => s.Effect === 'Deny');
    const allowed = !denied && hit.some((s) => s.Effect === 'Allow');
    const why = denied ? `A matching statement explicitly DENIES ${act}, and an explicit deny always wins.`
      : allowed ? `At least one Allow matches ${act} and no Deny matches, so it's allowed.`
        : `No statement matches ${act}, so the default (implicit) deny applies.`;
    return choice(r, `A user's policy (all on the same bucket):\n${stmts.map((s) => `  ${s.Effect.padEnd(5)} ${s.Action}`).join('\n')}\nCan they perform ${act}?`, allowed ? 'Allowed' : 'Denied', [allowed ? 'Denied' : 'Allowed'],
      `${why} Evaluation: (1) explicit deny? → denied. (2) any allow? → allowed. (3) otherwise → implicit deny. Wildcards: s3:Get* matches every action starting with s3:Get.`,
      { hint: 'Check for a matching Deny first. Then a matching Allow. Nothing matching = denied.' });
  });
  register('cidr.contains', { topic: 'Is the address in the network?' }, (r) => {
    const prefix = pick(r, [16, 20, 22, 24, 26]);
    const base = `10.${int(r, 0, 250)}.${int(r, 0, 255)}.${int(r, 0, 255)}`;
    const s = D.subnet(base, prefix);
    const inside = r() < 0.5;
    const baseInt = D.toInt(s.network);
    const ipInt = inside ? baseInt + int(r, 1, s.size - 2) : (r() < 0.5 ? baseInt + s.size + int(r, 0, 300) : baseInt - int(r, 1, 300));
    const ip = D.toIp(ipInt >>> 0);
    const yes = D.subnet(ip, prefix).network === s.network;
    return choice(r, `A cloud subnet is ${s.network}/${prefix}. Is ${ip} inside it?`, yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes'],
      `${s.network}/${prefix} covers ${s.network} – ${s.broadcast}. ${ip} is ${yes ? 'inside' : 'outside'} that range.`, { hint: 'Work out the range: network address to broadcast address.' });
  });
  register('nsg.eval', { topic: 'Firewall rule priority (NSG)' }, (r) => {
    const port = pick(r, [22, 80, 443, 3389]);
    const src = pick(r, ['Internet', '10.20.0.0/24 (office)']);
    const rules = [];
    const used = new Set();
    const n = int(r, 2, 4);
    for (let i = 0; i < n; i++) {
      let pr; do { pr = pick(r, [100, 110, 200, 300, 400, 500]); } while (used.has(pr)); used.add(pr);
      rules.push({ pr, port: pick(r, [port, port, 'Any', pick(r, [22, 80, 443, 3389])]), src: pick(r, ['Any', src, 'Internet', '10.20.0.0/24 (office)']), act: pick(r, ['Allow', 'Deny']) });
    }
    rules.sort((a, b) => a.pr - b.pr);
    const m = rules.find((x) => (x.port === 'Any' || x.port === port) && (x.src === 'Any' || x.src === src));
    const result = m ? m.act : 'Deny';
    return choice(r, `Azure NSG inbound rules:\n${rules.map((x) => `  ${String(x.pr).padEnd(4)} port ${String(x.port).padEnd(4)} from ${x.src.padEnd(22)} ${x.act}`).join('\n')}\n  65500 (default) Any from Any Deny\nTraffic arrives on port ${port} from ${src}. Result?`, result === 'Allow' ? 'Allowed' : 'Denied', [result === 'Allow' ? 'Denied' : 'Allowed'],
      m ? `Rules are checked from the LOWEST priority number up; the first match wins. Rule ${m.pr} (port ${m.port}, from ${m.src}) matches first → ${m.act}.` : 'No custom rule matches, so the default DenyAllInbound (65500) applies → Denied.',
      { hint: 'Sort by priority number (low first). The first rule matching BOTH port and source decides.' });
  });
  // The target VM is vm-web-01 in resource group rg-web. An assignment covers it only
  // if it is made at the VM itself or at an ancestor scope (inheritance flows downward).
  const SCOPES = [
    ['the management group "corp"', true], ['the subscription "prod"', true], ['resource group rg-web', true],
    ['resource group rg-data', false], ['the VM vm-web-01 itself', true], ['the VM vm-data-01', false],
  ];
  register('rbac.scope', { topic: 'Azure RBAC scope and roles' }, (r) => {
    const role = pick(r, ['Owner', 'Contributor', 'Reader']);
    const [scope, covers] = pick(r, SCOPES);
    const action = pick(r, [['view vm-web-01\'s settings', 'read'], ['restart vm-web-01', 'write'], ['grant another user access to vm-web-01', 'assign']]);
    const roleOk = role === 'Owner' || (role === 'Contributor' && action[1] !== 'assign') || (role === 'Reader' && action[1] === 'read');
    const can = covers && roleOk;
    const roleNote = { Owner: 'Owner can do everything, including granting access', Contributor: 'Contributor can manage resources but cannot grant access', Reader: 'Reader can only view' }[role];
    return choice(r, `Hierarchy: management group "corp" → subscription "prod" → resource groups rg-web and rg-data. vm-web-01 is in rg-web; vm-data-01 is in rg-data.\nA user has ${role} on ${scope}. Can they ${action[0]}?`, can ? 'Yes' : 'No', [can ? 'No' : 'Yes'],
      `Step 1, scope: assignments inherit DOWNWARD only. ${scope} ${covers ? 'is vm-web-01 or one of its ancestors, so it covers it' : 'is NOT above vm-web-01 (it is a sibling branch), so it does not cover it'}. Step 2, role: ${roleNote}. Answer: ${can ? 'Yes' : 'No'}.`,
      { hint: 'Two checks: does the assignment\'s scope sit above (or at) vm-web-01? Does the role allow this action?' });
  });
  const SVC = [
    ['Run code on upload events without managing servers', 'Lambda'], ['Store millions of images as objects', 'S3'], ['Rent a Linux virtual machine', 'EC2'],
    ['Find out who deleted a bucket yesterday', 'CloudTrail'], ['Detect unusual API activity and crypto-mining automatically', 'GuardDuty'],
    ['A managed relational database', 'RDS'], ['Host DNS records for your domain', 'Route 53'], ['Set an alarm when CPU stays above 90%', 'CloudWatch'],
  ];
  register('aws.service', { topic: 'Choosing AWS services' }, (r) => {
    const [need, svc] = pick(r, SVC);
    return choice(r, `Which AWS service fits?\n"${need}"`, svc, sample(r, SVC.map((s) => s[1]).filter((x) => x !== svc), 3), `${svc}.`);
  });
  const SGNACL = [
    ['Explicitly BLOCK one IP range for an entire subnet', 'Network ACL'], ['Allow HTTPS to a single web instance; return traffic should be automatic', 'Security group'],
    ['Rules must be evaluated in numbered order, with allow and deny', 'Network ACL'], ['A stateful firewall attached to an instance', 'Security group'],
  ];
  register('aws.sgnacl', { topic: 'Security groups vs NACLs' }, (r) => {
    const [need, a] = pick(r, SGNACL);
    return choice(r, `Security group or network ACL?\n"${need}"`, a, [a === 'Security group' ? 'Network ACL' : 'Security group'],
      'Security groups: instance-level, stateful, allow-only. NACLs: subnet-level, stateless, numbered allow AND deny rules.');
  });

  if (isNode) module.exports = {};
})(typeof window !== 'undefined' ? window : globalThis);
