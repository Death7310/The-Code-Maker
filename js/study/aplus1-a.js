/* study/aplus1-a.js — in-depth notes: A+ Core 1 lessons a1–a4. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    a1: {
      sections: [
        { h: 'The principle: match the memory to the job', html: `
<p>RAM and storage solve different problems. <strong>RAM</strong> is fast, short-term working space that's wiped at power-off. <strong>Storage</strong> is slower, long-term and persistent. A slow computer is usually short on one of them, and the symptoms tell you which: constant slowdowns with many apps open point to RAM; slow boots and file opens point to storage.</p>` },
        { h: 'RAM in detail', html: `
<ul>
  <li><strong>Generations:</strong> DDR4 and DDR5 are physically keyed differently (the notch is in a different place) and run at different voltages, so they can't be mixed. The motherboard decides which one you can use.</li>
  <li><strong>Form factors:</strong> DIMMs for desktops, the smaller SO-DIMMs for laptops. Many thin laptops have RAM soldered to the board, so it can't be upgraded.</li>
  <li><strong>Multi-channel:</strong> installing modules in matched pairs in the correct slots lets the memory controller use two channels at once, roughly doubling bandwidth. Check the motherboard manual for which slots pair up.</li>
  <li><strong>ECC RAM</strong> detects and corrects single-bit errors. Servers use it because silent memory corruption can damage data.</li>
</ul>` },
        { h: 'Storage in detail', html: `
<pre>Type            Interface          Typical speed       Notes
HDD 5,400/7,200 SATA               ~100–250 MB/s       cheap per TB; moving parts
SATA SSD        SATA (6 Gb/s max)  ~550 MB/s           capped by the SATA link
NVMe SSD        PCIe (x4 lanes)    ~3,500–7,000+ MB/s  usually the M.2 form factor</pre>
<p><strong>M.2 is a shape, not a protocol.</strong> An M.2 slot may support SATA, NVMe or both, and drives use different notches ("keys"; NVMe drives are usually M-key). Always check that the slot supports the drive's protocol.</p>
<p>SSDs wear out after a very large number of writes; the OS's <strong>TRIM</strong> command helps the drive manage this. HDDs fail mechanically: clicking or grinding noises are a back-up-now warning.</p>` },
        { h: 'The security angle: deleting data from SSDs vs HDDs', html: `
<p>On an HDD, overwriting the sectors removes the data. On an SSD, the drive's controller spreads writes around (wear leveling), so "overwriting a file" may leave old copies in cells you can't address. For SSDs, use the drive's built-in <strong>secure erase</strong> or <strong>cryptographic erase</strong> (destroying the encryption key of a self-encrypting drive), or physically destroy it. This matters for disposal policies and for forensics.</p>` },
      ],
      misconceptions: ['Any M.2 drive works in any M.2 slot. (SATA vs NVMe support and keying both matter.)', 'More storage will fix a slow computer that runs out of memory. (It needs more RAM.)', 'Deleting files, or a quick format, erases an SSD. (Use secure or cryptographic erase.)'],
      examTraps: ['A scenario says "the new RAM won\'t fit": think generation mismatch (DDR4 vs DDR5) or DIMM vs SO-DIMM.', '"The fastest storage" is NVMe, not "SSD" in general.'],
      onTheJob: 'Technicians size RAM for workloads and choose storage for speed vs capacity. Security teams write data-sanitization procedures that treat SSDs and HDDs differently, and forensic investigators know that SSD TRIM can make deleted data unrecoverable quickly.',
      checks: [
        { q: 'A video editor\'s PC has 8 GB of RAM and a fast NVMe SSD. Rendering is slow and the disk light flickers constantly. Best upgrade?', options: ['A second NVMe SSD', 'More RAM', 'A faster monitor', 'A 7,200 RPM HDD'], answer: 1, why: ['Storage is already fast. The disk activity is the system swapping because RAM is full.', 'Constant disk activity under load with little RAM is the classic swapping symptom. More RAM stops it.', 'Display has nothing to do with rendering speed here.', 'Slower than what it already has.'] },
        { q: 'A company is donating old laptops with SSDs. Which method reliably removes the data?', options: ['Delete all files and empty the recycle bin', 'Quick format the drive', 'Use the drive\'s secure erase / cryptographic erase function (or destroy the drive)', 'Degauss the drive'], answer: 2, why: ['The data stays on the flash cells.', 'A quick format only rebuilds the file system index.', 'These target every flash cell (or destroy the key), which handles wear leveling.', 'Degaussing works on magnetic media, not flash.'] },
      ],
      sources: [
        { title: 'NIST SP 800-88: Guidelines for Media Sanitization', url: 'https://csrc.nist.gov/publications/sp800' },
        { title: 'CompTIA A+ exam objectives (official, free)', url: 'https://www.comptia.org/certifications/a' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    a2: {
      sections: [
        { h: 'The principle: a connector is not a speed', html: `
<p>The physical plug (the <em>connector</em>) and the technology running over it (the <em>protocol</em>) are separate things. A USB-C port might carry USB 2.0 at 480 Mb/s, USB4 at 40 Gb/s, video, or power. Many "it should work but it's slow" tickets come from mixing these up.</p>` },
        { h: 'USB and display', html: `
<pre>USB 2.0           480 Mb/s
USB 3.x           5 / 10 / 20 Gb/s (marketing names vary)
USB4 / Thunderbolt 3–4   up to 40 Gb/s, usually over USB-C</pre>
<ul>
  <li><strong>HDMI:</strong> TVs and monitors; carries video and audio.</li>
  <li><strong>DisplayPort:</strong> common on PCs and monitors; supports daisy-chaining monitors.</li>
  <li><strong>VGA / DVI:</strong> legacy. VGA is analog, so image quality degrades over long cables.</li>
</ul>` },
        { h: 'Network cabling', html: `
<pre>Category  Max speed            Max distance
Cat5e     1 Gb/s               100 m
Cat6      10 Gb/s (to ~55 m)   100 m at 1 Gb/s
Cat6a     10 Gb/s              100 m</pre>
<ul>
  <li>Twisted-pair cable ends in <strong>RJ45</strong> connectors, wired to the <strong>T568A</strong> or <strong>T568B</strong> standard. The same standard on both ends makes a straight-through cable, which is normal today.</li>
  <li><strong>Fiber:</strong> <em>single-mode</em> (laser, very long distances, kilometers) or <em>multi-mode</em> (shorter runs within buildings). Connectors include LC, SC and ST. Fiber is immune to electrical interference and much harder to tap without detection.</li>
  <li><strong>Coaxial (RG-6):</strong> cable internet and TV.</li>
</ul>` },
        { h: 'The security angle', html: `
<p>Physical ports are an attack surface. Unknown USB devices can pretend to be keyboards and type commands, and open network jacks in lobbies let anyone plug in. Organizations disable unused switch ports, use port security or 802.1X, and control USB devices with policy. Fiber is used where interference or eavesdropping risk matters.</p>` },
      ],
      misconceptions: ['Every USB-C cable is the same. (Speed, power and video support vary.)', 'Cat6 always gives 10 Gb/s. (Only up to about 55 m; Cat6a covers 100 m.)'],
      examTraps: ['Distance clues point to fiber: "between buildings" or "a 500 m run".', 'RJ11 is the smaller phone connector; RJ45 is Ethernet.'],
      onTheJob: 'Technicians choose cables for the distance and speed needed and troubleshoot "slow" links caused by the wrong cable or a damaged one. Security teams lock down physical ports and control USB devices.',
      checks: [
        { q: 'An external SSD rated at 1,000 MB/s copies at about 40 MB/s on one laptop, but at full speed on another. Most likely cause?', options: ['The SSD is failing', 'The slow laptop\'s port (or the cable) only supports USB 2.0 speeds', 'The file system is FAT32', 'The laptop needs more RAM'], answer: 1, why: ['It runs at full speed elsewhere, so the drive is fine.', '~40 MB/s is about the practical limit of USB 2.0 (480 Mb/s). The port or cable is the bottleneck.', 'FAT32 limits file size, not speed in this way.', 'RAM doesn\'t cap USB transfer like this.'] },
        { q: 'You must connect two buildings 800 m apart with a link that is immune to electrical interference. Choose:', options: ['Cat6a', 'Cat5e with a repeater in the parking lot', 'Single-mode fiber', 'HDMI'], answer: 2, why: ['Copper twisted pair is limited to about 100 m.', 'Impractical, and still vulnerable to interference.', 'Fiber covers long distances and is immune to electrical interference.', 'HDMI is a display cable.'] },
      ],
      sources: [
        { title: 'USB Implementers Forum: USB specifications and naming', url: 'https://www.usb.org/' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    a3: {
      sections: [
        { h: 'The principle: an address only works with its three companions', html: `
<p>A device needs four settings to communicate beyond itself: an <strong>IP address</strong> (who am I?), a <strong>subnet mask</strong> (which addresses are local?), a <strong>default gateway</strong> (where do I send everything else?) and <strong>DNS servers</strong> (how do I turn names into addresses?). Most connectivity problems come down to one of these four being missing or wrong.</p>` },
        { h: 'How DHCP hands them out: DORA', html: `
<ol>
  <li><strong>Discover:</strong> the client broadcasts "is there a DHCP server?"</li>
  <li><strong>Offer:</strong> a server offers an address plus the mask, gateway and DNS settings.</li>
  <li><strong>Request:</strong> the client asks for the offered address.</li>
  <li><strong>Acknowledge:</strong> the server confirms and starts the <em>lease</em> timer.</li>
</ol>
<p>Leases expire, and clients renew them. Administrators define a <em>scope</em> (the range of addresses to hand out), <em>exclusions</em> (addresses kept out of the scope) and <em>reservations</em> (the same IP every time for a specific MAC address, which is good for printers).</p>` },
        { h: 'Address ranges you must know', html: `
<pre>Private (RFC 1918)    10.0.0.0/8, 172.16.0.0/12 (172.16–172.31), 192.168.0.0/16
Loopback              127.0.0.0/8 (usually 127.0.0.1)
APIPA / link-local    169.254.0.0/16 (self-assigned when DHCP fails)
IPv6 link-local       fe80::/10</pre>
<p>Private addresses aren't routed on the internet. Your router uses <strong>NAT</strong> to share one public address. IPv6 uses 128-bit addresses written in hex, so there are effectively enough for every device.</p>` },
        { h: 'Worked example: reading ipconfig', html: `
<pre>IPv4 Address . . . : 169.254.88.12
Subnet Mask  . . . : 255.255.0.0
Default Gateway. . :</pre>
<p>A 169.254 address with no gateway means the PC gave up waiting for DHCP. Check in order: is the link up (cable or Wi-Fi)? Is the DHCP server or relay reachable? Then run <code>ipconfig /release</code> and <code>ipconfig /renew</code>.</p>` },
      ],
      misconceptions: ['172.x is always private. (Only 172.16 through 172.31.)', 'An IP address alone is enough to browse. (You also need a mask, a gateway and DNS.)'],
      examTraps: ['APIPA (169.254) almost always means a DHCP problem.', 'A correct IP but no gateway means local traffic works and remote traffic fails.'],
      onTheJob: 'Help desk staff diagnose DHCP failures daily. Network engineers manage scopes and reservations. Security teams watch for rogue DHCP servers, which can redirect a victim\'s gateway and DNS.',
      checks: [
        { q: 'A PC can reach file shares on its own subnet but nothing on the internet. Its IP and mask look correct. What\'s the most likely missing or wrong setting?', options: ['The DNS server', 'The default gateway', 'The MAC address', 'The DHCP lease time'], answer: 1, why: ['A DNS failure breaks names, but not reaching addresses directly. Here even remote traffic fails.', 'Without a correct gateway, traffic can\'t leave the local subnet.', 'MAC addresses are burned in and work locally, which is already working.', 'Lease time affects renewals, not routing.'] },
        { q: 'A network printer keeps changing IP after power outages, breaking printing. The best fix that keeps DHCP in use:', options: ['A static IP set inside the DHCP scope', 'A DHCP reservation for the printer\'s MAC address', 'Disable DHCP for the whole network', 'Shorter lease times'], answer: 1, why: ['A static IP inside the scope can conflict with addresses DHCP hands out.', 'The printer always gets the same address, managed centrally.', 'Unmanageable, and it breaks every other device.', 'That makes changes happen more often, not less.'] },
      ],
      sources: [
        { title: 'RFC 1918: Address Allocation for Private Internets', url: 'https://www.rfc-editor.org/rfc/rfc1918' },
        { title: 'RFC 3927: Dynamic Configuration of IPv4 Link-Local Addresses', url: 'https://www.rfc-editor.org/rfc/rfc3927' },
        { title: 'RFC 2131: Dynamic Host Configuration Protocol', url: 'https://www.rfc-editor.org/rfc/rfc2131' },
      ],
    },

    a4: {
      sections: [
        { h: 'The principle: one address, many services', html: `
<p>An IP address gets traffic to a <em>machine</em>; a <strong>port number</strong> gets it to the right <em>program</em> on that machine. A server can run a website (443), remote administration (22) and email (25) at once on one IP, because each listens on its own port. Ports 0–1023 are the <em>well-known</em> ports; clients use temporary high-numbered <em>ephemeral</em> ports for their side of a connection.</p>` },
        { h: 'The ports to know, with their secure versions', html: `
<pre>Port      Protocol   Purpose                       Secure alternative
20/21     FTP        file transfer (plain text)    SFTP (over SSH, 22) / FTPS (990)
22        SSH        encrypted remote shell, SFTP  (already secure)
23        Telnet     remote shell (plain text)     SSH
25        SMTP       server-to-server email        587 submission with TLS
53        DNS        name resolution (UDP + TCP)   DNS over TLS/HTTPS
67/68     DHCP       automatic addressing (UDP)
80        HTTP       web (plain text)              HTTPS (443)
110       POP3       download mail                 POP3S (995)
143       IMAP       sync mail                     IMAPS (993)
161/162   SNMP       device monitoring             SNMPv3 (authenticated, encrypted)
389       LDAP       directory queries             LDAPS (636)
445       SMB        Windows file sharing
3389      RDP        Windows remote desktop        put it behind a VPN or gateway</pre>` },
        { h: 'TCP or UDP?', html: `
<p>Most services use <strong>TCP</strong> (reliable, connection-based). DHCP, SNMP and most DNS queries use <strong>UDP</strong> (fast, connectionless). DNS also uses TCP for large responses and for zone transfers between servers.</p>` },
        { h: 'The security angle: a port number is not protection', html: `
<p>Moving SSH from 22 to 2222 hides it from casual scans only briefly, because scanners check every port. Security comes from the <em>protocol</em> (is it encrypted and authenticated?) and from <em>exposure</em> (who can reach it?). That's why defenders close what isn't needed, restrict management ports to admin networks, and replace plain-text protocols like Telnet and FTP with encrypted ones.</p>` },
      ],
      misconceptions: ['A non-standard port makes a service secure. (Obscurity is not a control.)', 'DNS only uses UDP. (TCP is used for large responses and zone transfers.)'],
      examTraps: ['POP3 downloads and usually removes mail from the server; IMAP keeps it synced on the server.', 'SFTP runs over SSH (port 22); FTPS is FTP with TLS. They\'re different protocols.'],
      onTheJob: 'Firewall rules, scan reports, log analysis and incident response are all written in ports. Recognizing that 3389 being open to the internet is a serious finding, or that 23 means credentials are crossing the network in plain text, comes down to knowing this table cold.',
      checks: [
        { q: 'A scan finds a server exposing ports 22, 23 and 443 to the internet. Which should be closed first, and why?', options: ['443, because the web server is risky', '23 (Telnet), because it sends credentials in plain text, and SSH on 22 already provides secure remote access', '22, because SSH is commonly attacked', 'None; open ports are normal'], answer: 1, why: ['443 is usually the service the business needs.', 'Telnet duplicates SSH\'s purpose without encryption. Removing it reduces risk with no loss of function.', 'SSH is encrypted. Harden it (keys, restricted sources) rather than removing remote access.', 'Every exposed service is attack surface. Unneeded, insecure ones should go.'] },
        { q: 'Users want mail kept on the server and synced across phone and laptop. Which protocol should their apps use?', options: ['POP3', 'IMAP (over TLS, port 993)', 'SMTP only', 'SNMP'], answer: 1, why: ['POP3 typically downloads and removes mail, which doesn\'t suit several devices.', 'IMAP keeps mailboxes on the server and syncs state across devices.', 'SMTP sends mail; it doesn\'t retrieve it.', 'SNMP monitors network devices.'] },
      ],
      sources: [
        { title: 'IANA Service Name and Transport Protocol Port Number Registry', url: 'https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
