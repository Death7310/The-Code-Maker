/*
 * practice/map.js — which generators each lesson uses, how many consecutive
 * unaided correct answers it needs, and its self-explanation prompt.
 *
 * Explaining a principle in your own words improves understanding and
 * transfer (self-explanation effect; Chi et al., 1994). Free text can't be
 * graded reliably here, so the learner compares against a model answer
 * and checklist (honest self-assessment, not automated scoring).
 */
(function (root) {
  'use strict';
  const MAP = {
    // ----- Ground Zero -----
    z1: { gens: ['ipos.classify'], need: 4, explain: { prompt: 'A smartphone touchscreen is both input and output. Explain how one device can be both, using the idea of data flow.', points: ['Input = data flowing INTO the system (touch sensing)', 'Output = data flowing OUT (the display)', 'Classify by direction of data flow, not by the physical object'] } },
    z2: { gens: ['bin.toDec', 'bin.toBin', 'bin.bitsNeeded', 'bits.bytes'], need: 5, explain: { prompt: 'Why does adding ONE bit double the number of values you can represent? Then explain why a 100 Mbps connection doesn\'t download 100 MB per second.', points: ['Each new bit can be 0 or 1 for every existing pattern, so the count of patterns doubles', 'n bits → 2^n values', 'Network speeds are in bits, file sizes in bytes; 8 bits = 1 byte, so divide by 8'] } },
    z3: { gens: ['hw.role'], need: 4, explain: { prompt: 'A computer has a huge SSD but only 4 GB of RAM, and it slows down with many apps open. Explain why more storage wouldn\'t fix it.', points: ['RAM is the working space for running programs; storage keeps files long-term', 'When RAM fills, the system swaps to slower storage', 'The bottleneck is working memory, not file space'] } },
    z5: { gens: ['path.resolve', 'path.kind'], need: 4, explain: { prompt: 'Explain the difference between an absolute and a relative path, and why scripts that use relative paths can break when run from a different folder.', points: ['Absolute starts at the root (/ or C:\\) and means the same thing everywhere', 'Relative is interpreted from the current working directory', 'Running from a different folder changes what a relative path points to'] } },
    // ----- A+ Core 1 -----
    a3: { gens: ['ip.classify'], need: 5, explain: { prompt: 'A user\'s PC shows 169.254.40.12. Walk through what that tells you and what you would check, in order.', points: ['169.254 = APIPA, self-assigned because no DHCP response came back', 'Check the physical link/Wi-Fi first', 'Then whether the DHCP server or relay is reachable/working', 'Then renew the lease (ipconfig /release, /renew)'] } },
    a4: { gens: ['port.scenario'], need: 5, explain: { prompt: 'Pick two protocols that do the same job, one insecure and one secure (e.g. Telnet/SSH, HTTP/HTTPS). Explain the security difference and why the port number alone doesn\'t make traffic secure.', points: ['The insecure one sends data (including passwords) in plain text', 'The secure one encrypts the session', 'Ports are only conventions; security comes from the protocol, not the number'] } },
    a7: { gens: ['ts.step'], need: 4, explain: { prompt: 'Why does the method say to TEST a theory before making changes? Give an example of what goes wrong if you skip it.', points: ['Testing confirms the actual cause instead of guessing', 'Skipping it leads to unnecessary changes that may not fix anything (e.g. reinstalling the OS for a cabling fault)', 'Unnecessary changes cost time and can create new problems'] } },
    a9: { gens: ['raid.calc'], need: 4, explain: { prompt: 'Explain why RAID 5 loses exactly one disk of capacity, while RAID 1 loses half. Then explain why RAID is still not a backup.', points: ['RAID 5 stores parity equal to one disk\'s worth, spread across all disks', 'RAID 1 stores a full copy, so half the raw space holds duplicates', 'RAID protects against disk failure, not deletion, ransomware or disasters, which corrupt or remove every copy at once'] } },
    a13: { gens: ['hw.role'], need: 3 },
    // ----- A+ Core 2 -----
    c2: { gens: ['fs.choose'], need: 4 },
    c3: { gens: ['malware.type'], need: 5, explain: { prompt: 'Explain the difference between a worm and a trojan in terms of HOW each one spreads, and what that means for defending against them.', points: ['A worm self-propagates across networks without user action', 'A trojan relies on a user running something that looks legitimate', 'Worms: patching and segmentation matter most. Trojans: user awareness, application control and least privilege matter most'] } },
    c4: { gens: ['se.type'], need: 5 },
    c6: { gens: ['backup.restore'], need: 4, explain: { prompt: 'Explain the trade-off between incremental and differential backups: which is faster to create, which is faster to restore, and why.', points: ['Incremental copies only changes since the last backup, so it\'s fastest and smallest to create', 'Restoring incrementals needs the full plus every incremental in order, which is slower and riskier', 'Differential grows each day, but a restore needs only the full plus the latest differential'] } },
    c10: { gens: ['malware.steps'], need: 4, explain: { prompt: 'Why does the malware removal process disable System Restore BEFORE remediation, and re-enable it afterwards?', points: ['Existing restore points may contain the malware', 'Disabling clears or prevents use of infected points', 'Re-enabling afterwards creates a clean point to roll back to in future'] } },
    // ----- Linux -----
    l3: { gens: ['passwd.field'], need: 3 },
    l4: { gens: ['perm.convert', 'perm.access', 'sh.perms'], need: 5, explain: { prompt: 'A user who is in a file\'s group is denied write access, even though "others" have write permission. Explain how Linux decides which permission digit applies.', points: ['Linux checks owner first, then group, then others, and uses only the FIRST category that matches', 'A group member gets the group digit, even if the others digit is more generous', 'So permissions are not "added together" across categories'] } },
    // ----- Bash -----
    b3: { gens: ['sh.countUser'], need: 3 },
    b4: { gens: ['sh.countUser', 'sh.topSource', 'sh.csv'], need: 4, explain: { prompt: 'Explain what each stage of this pipeline does and why the order matters:\ngrep Failed auth.log | cut -d " " -f 11 | sort | uniq -c | sort -rn', points: ['grep keeps only failed attempts', 'cut extracts the IP field', 'sort groups identical IPs next to each other, which uniq needs because it only collapses ADJACENT duplicates', 'uniq -c counts each group; sort -rn ranks the counts highest first'] } },
    // ----- Network+ -----
    n1: { gens: ['osi.layer'], need: 5, explain: { prompt: 'Explain why a switch is a Layer 2 device and a router a Layer 3 device, in terms of the addresses each uses.', points: ['Switches forward frames using MAC addresses, which are local to a network segment', 'Routers forward packets using IP addresses, which identify networks', 'Routing between networks requires Layer 3 addressing'] } },
    n2: { gens: ['net.tcpudp'], need: 4 },
    n3: { gens: ['sub.mixed'], need: 5, explain: { prompt: 'Explain, without a formula sheet, how you find the network and broadcast address of any IP with a /26 mask.', points: ['/26 → mask 255.255.255.192 → block size 256 − 192 = 64', 'Networks start at multiples of 64 in the last octet', 'Network = the block start at or below the address; broadcast = next block start minus 1'] } },
    n4: { gens: ['sub.mixed'], need: 5 },
    n5: { gens: ['dns.record'], need: 4 },
    n6: { gens: ['net.diagnose'], need: 4, explain: { prompt: 'Why is working bottom-up (physical first, DNS last) more efficient than starting with whatever the user complains about?', points: ['Higher layers depend on lower ones; a lower-layer failure makes everything above it fail too', 'The first failing test points to the real fault', 'Starting at the top chases symptoms instead of causes'] } },
    // ----- Security+ -----
    s1: { gens: ['cia.classify'], need: 5 },
    s3: { gens: ['crypto.keys'], need: 5, explain: { prompt: 'Explain why you encrypt with the RECIPIENT\'s public key, but sign with your OWN private key.', points: ['Confidentiality: only the holder of the matching private key (the recipient) can decrypt', 'Authenticity: only you hold your private key, so a signature made with it proves origin', 'Anyone can verify a signature with your public key'] } },
    s4: { gens: ['risk.ale', 'risk.response'], need: 5, explain: { prompt: 'A control costs $15,000/year and cuts a risk\'s ALE from $40,000 to $10,000. Is it worth it? Explain the reasoning.', points: ['Risk reduction = 40,000 − 10,000 = $30,000 per year', 'The control costs $15,000, so the net benefit is $15,000 per year', 'Worth it on cost grounds, unless other factors (like a better control or compliance needs) change the decision'] } },
    s5: { gens: ['ir.phase'], need: 4 },
    // ----- Cloud -----
    cl5: { gens: ['policy.eval'], need: 5, explain: { prompt: 'Explain the order in which cloud permission policies are evaluated, and why "explicit deny always wins" is a useful safety design.', points: ['Default is deny (implicit)', 'Any matching explicit Deny overrides every Allow', 'Otherwise a matching Allow grants access', 'Explicit denies act as guardrails that can\'t be accidentally overridden by a broad Allow'] } },
    cl6: { gens: ['cidr.contains'], need: 4 },
    aw1: { gens: ['aws.service'], need: 4 },
    aw4: { gens: ['aws.sgnacl'], need: 3 },
    az3: { gens: ['rbac.scope'], need: 5, explain: { prompt: 'Explain why granting Contributor at the subscription scope is riskier than at a resource group, using inheritance.', points: ['Assignments inherit down to every resource group and resource beneath', 'A subscription-level grant reaches everything in it, including unrelated systems', 'A narrower scope limits the blast radius if the account is misused or compromised'] } },
    az4: { gens: ['nsg.eval'], need: 5 },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = MAP;
  else { root.CM = root.CM || {}; root.CM.practiceMap = MAP; }
})(typeof window !== 'undefined' ? window : globalThis);
