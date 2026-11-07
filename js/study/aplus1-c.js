/* study/aplus1-c.js — in-depth notes: A+ Core 1 lessons a10–a13. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    a10: {
      sections: [
        { h: 'The principle: radio is a shared medium', html: `
<p>Wired Ethernet gives each device its own cable. Wi-Fi devices <em>share the air</em>: only one can usefully transmit on a channel at a time, and anyone within range can receive the signal. So Wi-Fi design comes down to two questions: how to share the airwaves efficiently (bands and channels), and how to stop eavesdroppers from reading or joining (encryption and authentication).</p>` },
        { h: 'Bands and channels', html: `
<ul>
  <li><strong>2.4 GHz:</strong> longer range and better at passing through walls, but crowded, and only <strong>3 non-overlapping channels (1, 6, 11)</strong> in the US. Microwave ovens, Bluetooth and some cordless phones interfere.</li>
  <li><strong>5 GHz:</strong> many more channels and faster speeds, but shorter range. Some channels share spectrum with radar (DFS), so access points may have to change channel.</li>
  <li><strong>6 GHz (Wi-Fi 6E/7):</strong> lots of clean spectrum, shortest range.</li>
</ul>
<pre>802.11n = Wi-Fi 4 (2.4/5)   802.11ac = Wi-Fi 5 (5)   802.11ax = Wi-Fi 6/6E (2.4/5/6)   802.11be = Wi-Fi 7</pre>
<p>Neighboring access points should use non-overlapping channels. Two networks on overlapping 2.4 GHz channels (say, 1 and 3) interfere with each other more than two on the same channel, because they can't coordinate turns.</p>` },
        { h: 'Security, from broken to strong', html: `
<pre>WEP              broken; never use
WPA (TKIP)       deprecated
WPA2-Personal    AES-CCMP with a shared passphrase
WPA3-Personal    SAE: much stronger against offline password guessing
WPA2/3-Enterprise  802.1X: each user authenticates through a RADIUS server</pre>
<ul>
  <li>With a shared passphrase (Personal mode), anyone who knows it is "in", and changing it means updating every device. Enterprise mode gives each user their own credentials, which can be revoked individually.</li>
  <li><strong>WPS</strong> (push-button/PIN setup) has known design weaknesses. Turn it off.</li>
  <li>Hiding the SSID or filtering MAC addresses is <em>not</em> real security: SSIDs still appear in traffic and MAC addresses can be spoofed.</li>
</ul>` },
      ],
      misconceptions: ['A hidden SSID makes a network secure. (It\'s still discoverable.)', 'More access points on the same busy channels always help. (Overlapping channels make interference worse.)'],
      examTraps: ['"Range through walls" → 2.4 GHz. "Speed with many channels" → 5/6 GHz.', '"Each user with their own login" → Enterprise (802.1X/RADIUS).'],
      onTheJob: 'Network techs do site surveys and channel planning. Security teams enforce WPA3 or Enterprise authentication, disable WPS, and watch for rogue access points.',
      checks: [
        { q: 'An office has three access points in adjacent rooms on 2.4 GHz channels 1, 3 and 6. Users complain of poor performance. Best change?', options: ['Move all three to channel 1', 'Use channels 1, 6 and 11', 'Hide the SSIDs', 'Switch to WEP for speed'], answer: 1, why: ['Same-channel APs share airtime; it\'s better than overlap, but non-overlapping channels are best.', 'These three don\'t overlap at 2.4 GHz, which minimizes interference between APs.', 'Hiding SSIDs doesn\'t affect radio interference.', 'WEP is broken and won\'t fix interference.'] },
        { q: 'A contractor knew the office Wi-Fi passphrase, and their contract has ended. With WPA2-Personal, what must happen to revoke their access?', options: ['Nothing; their device will disconnect automatically', 'Change the passphrase and update every device, a cost that Enterprise authentication avoids', 'Block their name in the router', 'Hide the SSID'], answer: 1, why: ['Saved passphrases keep working.', 'Shared-key networks can only revoke access by changing the key for everyone. Per-user 802.1X credentials can be revoked individually.', 'Personal mode has no per-user identities to block.', 'Their device still knows the network.'] },
      ],
      sources: [
        { title: 'Wi-Fi Alliance: Wi-Fi security (WPA3)', url: 'https://www.wi-fi.org/discover-wi-fi/security' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    a11: {
      sections: [
        { h: 'The principle: a small box doing many jobs needs deliberate hardening', html: `
<p>A home/small-office router combines a router (with NAT), a switch, a Wi-Fi access point, a firewall and a DHCP server. Out of the box it's tuned for <em>easy setup</em>, not security. Each convenience feature is a decision to revisit.</p>` },
        { h: 'Hardening checklist, with the reasons', html: `
<ul>
  <li><strong>Change the default admin credentials:</strong> defaults are published online for every model.</li>
  <li><strong>Update the firmware</strong> (or enable auto-update): router vulnerabilities are actively exploited, and these devices sit directly on the internet.</li>
  <li><strong>Disable remote (WAN) administration</strong> unless it's truly needed.</li>
  <li><strong>WPA3 or WPA2-AES; WPS off.</strong></li>
  <li><strong>Disable UPnP</strong> if it isn't needed: it lets any device on the LAN open inbound ports, including malware.</li>
  <li><strong>Guest network</strong> isolated from the main LAN, for visitors and smart devices.</li>
</ul>` },
        { h: 'Port forwarding vs DMZ', html: `
<p><strong>NAT</strong> hides internal devices behind one public IP, so unsolicited inbound connections have nowhere to go. <strong>Port forwarding</strong> deliberately sends one external port to one internal device (e.g. 443 → 192.168.1.20). A <strong>DMZ host</strong> setting forwards <em>every</em> port to one device, exposing it completely. Forward only what's needed, to a device that's patched. Pair forwarding with a <strong>DHCP reservation</strong> so the target's IP doesn't change.</p>` },
      ],
      misconceptions: ['NAT is a firewall. (It blocks unsolicited inbound connections as a side effect, but it isn\'t a policy engine; still enable the firewall.)', 'The SOHO "DMZ" is a secure zone. (On consumer routers it means fully exposed.)'],
      examTraps: ['Port forwarding to a device that keeps changing IP → add a DHCP reservation.', '"The first thing to do with a new router" → change the default admin credentials.'],
      onTheJob: 'Technicians set up small offices and home workers. Security assessments of small businesses regularly find default router credentials, open remote administration and outdated firmware.',
      checks: [
        { q: 'A game console needs inbound access on two ports. A user enables "DMZ host" for it instead. Why is that worse than port forwarding?', options: ['It\'s slower', 'It exposes EVERY port on the console to the internet, not just the two needed', 'It disables NAT for the whole network', 'It\'s the same thing'], answer: 1, why: ['Speed isn\'t the issue.', 'Consumer DMZ mode forwards all unsolicited traffic to the device, so the attack surface is maximal.', 'Other devices remain behind NAT.', 'Forwarding is scoped to specific ports; DMZ isn\'t.'] },
        { q: 'Malware on a laptop inside a home network opens inbound ports on the router without the owner\'s knowledge. Which feature allowed it?', options: ['WPA3', 'UPnP', 'DHCP reservations', 'Guest networks'], answer: 1, why: ['WPA3 is Wi-Fi encryption.', 'UPnP lets LAN devices request port mappings automatically, with no authentication.', 'Reservations only fix IP assignments.', 'Guest networks isolate devices; they don\'t open ports.'] },
      ],
      sources: [
        { title: 'CISA: Securing network infrastructure devices', url: 'https://www.cisa.gov/' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    a12: {
      sections: [
        { h: 'The principle: know the process, and the symptom points to the part', html: `
<p>Printer troubleshooting is mostly mapping a <em>symptom</em> to the <em>stage</em> of printing where it happens. If you know the sequence, a defect on the page tells you which component failed.</p>` },
        { h: 'The laser process, with symptom → part', html: `
<pre>1 Processing    the page is rendered to an image in memory       garbled output → driver/data
2 Charging      the drum gets a uniform negative charge           all-black or gray pages → charging
3 Exposing      a laser discharges the image areas                missing areas → laser path
4 Developing    toner sticks to the exposed areas                 faded → low toner
5 Transferring  toner moves from the drum to the paper            blank/faint pages → transfer roller
6 Fusing        heat and pressure melt toner onto the paper       toner smears or rubs off → fuser
7 Cleaning      leftover toner and charge removed from the drum   ghost images → cleaning/drum</pre>
<p><strong>Repeating marks</strong> at regular intervals come from a roller or drum. The distance between marks matches the circumference of the faulty part.</p>` },
        { h: 'Other printer types', html: `
<ul>
  <li><strong>Inkjet:</strong> sprays liquid ink from a printhead. Common faults are clogged nozzles (run cleaning) and misalignment (run calibration).</li>
  <li><strong>Thermal:</strong> heat-sensitive paper (receipts, labels). Faded prints mean a dirty heating element or the paper is in upside down.</li>
  <li><strong>Impact (dot matrix):</strong> pins strike an ink ribbon. Still used for multipart carbon forms.</li>
  <li><strong>Paper jams and multiple sheets fed at once:</strong> worn pickup or separation rollers, or humid paper.</li>
</ul>` },
        { h: 'The security angle', html: `
<p>Network printers are full computers with storage, an OS and web admin pages. They store copies of jobs, have default admin passwords, and are often forgotten in patching. Use secure print release (the job prints only when the user badges in at the device), change the defaults, update the firmware, and wipe the storage before disposal.</p>` },
      ],
      misconceptions: ['Printers are just peripherals with no security risk. (They store data and run network services.)', 'Faded laser prints always mean a bad drum. (Check toner first: the simplest cause.)'],
      examTraps: ['Toner smears or rubs off → fuser.', 'Thermal printer: "faded text" → heating element or paper orientation.'],
      onTheJob: 'Help desk staff resolve printer tickets constantly. Security assessments often find exposed printer admin pages, and print servers have been used as footholds in attacks.',
      checks: [
        { q: 'Printed pages come out with a light gray background across the whole page. Which laser stage is most likely failing?', options: ['Fusing', 'Charging (the drum isn\'t getting a uniform charge)', 'Processing', 'Paper pickup'], answer: 1, why: ['Fuser faults cause smearing or loose toner, not a uniform gray background.', 'If the drum isn\'t charged uniformly, toner sticks where it shouldn\'t, leaving a gray or dark background.', 'Processing faults garble content.', 'Pickup problems cause jams and misfeeds, not print quality issues.'] },
        { q: 'A law firm\'s confidential documents keep being picked up by the wrong people at the shared printer. Best control?', options: ['A bigger output tray', 'Secure print release, where jobs print only when the owner authenticates at the device', 'A faster printer', 'Disable duplex printing'], answer: 1, why: ['Doesn\'t address exposure.', 'Jobs are held until the right person is physically present.', 'Speed doesn\'t protect confidentiality.', 'Unrelated.'] },
      ],
      sources: [
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
        { title: 'CompTIA A+ exam objectives (official, free)', url: 'https://www.comptia.org/certifications/a' },
      ],
    },

    a13: {
      sections: [
        { h: 'The principle: symptoms are evidence; follow the power, heat and data path', html: `
<p>Hardware faults usually show up as a few classic symptom patterns. Rather than memorizing a list, reason along three paths: <strong>power</strong> (is energy getting where it needs to go?), <strong>heat</strong> (is it being removed?) and <strong>data</strong> (can the system read its memory and storage?).</p>` },
        { h: 'Symptom patterns', html: `
<pre>Symptom                                       Path    Likely causes / next test
Completely dead: no lights or fans            Power   outlet, cable, PSU switch, PSU (power supply tester)
Fans spin, no display, beeps or LED codes     Data    RAM/GPU seating; look up the vendor's beep/LED code
Shuts off or reboots under load               Heat/Pwr dust, failed fan, dried thermal paste; weak PSU
Clicking or grinding                          Data    failing HDD: back up NOW; check S.M.A.R.T.
"No boot device" / "OS not found"             Data    boot order, disconnected/failed drive, wrong boot mode
Random crashes / blue screens                 Data    RAM errors (run a memory diagnostic), drivers, heat
Clock resets after unplugging                 Power   CMOS battery
Burning smell / visible damage                Power   disconnect immediately; do not power on again
Swollen battery                               Power   stop using; fire risk; dispose of properly</pre>` },
        { h: 'Tools of the trade', html: `
<ul>
  <li><strong>POST codes:</strong> beep patterns and debug LEDs differ by manufacturer, so look them up for the specific board.</li>
  <li><strong>S.M.A.R.T.:</strong> drives report their own health (reallocated sectors, error counts). Rising counts predict failure.</li>
  <li><strong>Memory diagnostics</strong> (e.g. Windows Memory Diagnostic, MemTest86) test RAM thoroughly.</li>
  <li><strong>Swap with known-good parts</strong>, one change at a time, to isolate the fault.</li>
  <li><strong>Safety first:</strong> unplug before opening, use an ESD strap, and never open a PSU (it holds a dangerous charge even when unplugged).</li>
</ul>` },
      ],
      misconceptions: ['Random crashes are always software. (Faulty RAM and overheating cause them too.)', 'If it powers on, the PSU is fine. (A weak PSU can fail only under load.)'],
      examTraps: ['A drive making noise → back up before anything else.', 'Change ONE variable at a time when swapping parts.'],
      onTheJob: 'Bench technicians use these patterns daily. Data-path thinking also helps in forensics: knowing how drives fail (and when data is still recoverable) matters when handling evidence.',
      checks: [
        { q: 'A gaming PC shuts off only after 20 minutes of heavy play. Idle use is fine. Which test best confirms the cause?', options: ['Reinstall Windows', 'Monitor CPU/GPU temperatures under load and check fans and dust', 'Replace the keyboard', 'Check the DNS settings'], answer: 1, why: ['Software doesn\'t explain a load- and time-dependent shutdown.', 'Heat builds under sustained load until the hardware protects itself by shutting down. Measure it to confirm.', 'Unrelated.', 'Unrelated.'] },
        { q: 'A PC blue-screens at random with different error codes each time, even after reinstalling the OS. What\'s a strong next test?', options: ['Run a full memory diagnostic', 'Change the desktop wallpaper', 'Replace the monitor', 'Disable the screen saver'], answer: 0, why: ['Varied crashes that survive a reinstall point to hardware. Faulty RAM is a classic cause.', 'Irrelevant.', 'The display doesn\'t cause kernel crashes.', 'Irrelevant.'] },
      ],
      sources: [
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
        { title: 'CompTIA A+ exam objectives (official, free)', url: 'https://www.comptia.org/certifications/a' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
