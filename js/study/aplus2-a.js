/* study/aplus2-a.js — in-depth notes: A+ Core 2 lessons c1–c4. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    c1: {
      sections: [
        { h: 'The principle: the command line is precise, scriptable and remote-friendly', html: `
<p>Graphical tools are discoverable, but command-line tools give exact output you can copy into a ticket, can run over a remote session, and can be scripted to run on a hundred machines. A+ expects you to know which tool answers which question.</p>` },
        { h: 'Network diagnosis', html: `
<pre>ipconfig /all          full adapter settings: IP, mask, gateway, DNS, DHCP server, MAC
ipconfig /release      give up the DHCP lease      ipconfig /renew   get a new one
ipconfig /flushdns     clear the local DNS cache
ping HOST              is it reachable? (some hosts block ping, so failure isn't proof)
tracert HOST           each router hop on the path, showing where traffic stops
pathping HOST          combines ping + tracert with per-hop loss statistics
nslookup NAME          ask DNS directly, bypassing the cache
netstat -ano           active connections and listening ports, with process IDs</pre>
<p><code>netstat -ano</code> plus the PID column lets you match a suspicious connection to the program that made it. Look the PID up in Task Manager's Details tab.</p>` },
        { h: 'System and disk', html: `
<pre>sfc /scannow           verify and repair protected Windows system files
DISM /Online /Cleanup-Image /RestoreHealth   repair the image sfc repairs from
chkdsk /f              fix file system errors (/r also scans for bad sectors)
diskpart               partition and volume management (powerful; destructive if misused)
gpupdate /force        re-apply Group Policy now     gpresult /r   show which policies applied
shutdown /r /t 0       restart now
whoami /groups         who am I, and which groups am I in?
robocopy SRC DST /MIR  robust copy/mirror (careful: /MIR deletes extra files in DST)</pre>
<p>If <code>sfc</code> can't repair files, run DISM first to fix the source it repairs from, then run sfc again.</p>` },
        { h: 'Running as administrator', html: `
<p>Many system commands need an <strong>elevated</strong> prompt (Run as administrator). UAC asks for confirmation when elevating. This is least privilege in practice: work normally without admin rights, and elevate only for the specific task.</p>` },
      ],
      misconceptions: ['A failed ping means the host is down. (Firewalls often block ICMP.)', 'chkdsk and sfc do the same thing. (chkdsk checks the file system and disk; sfc checks Windows system files.)'],
      examTraps: ['"Repair corrupted system files" → sfc /scannow (then DISM if needed).', '"Which program owns this connection?" → netstat -ano + PID.'],
      onTheJob: 'Help desk staff use these daily. Incident responders use netstat, whoami /groups and gpresult to see what a machine is connected to, who is logged in with what rights, and which policies apply.',
      checks: [
        { q: 'A PC resolves "intranet" to an old IP even after DNS was updated. Which command fixes this on the PC?', options: ['sfc /scannow', 'ipconfig /flushdns', 'chkdsk /f', 'gpupdate /force'], answer: 1, why: ['That repairs system files, not name caching.', 'Clears the locally cached (stale) DNS answer, so the next lookup asks the server again.', 'That checks the disk.', 'That re-applies policy, not DNS cache.'] },
        { q: 'You spot an unknown outbound connection to 203.0.113.9:443. Which command shows which process made it?', options: ['tracert 203.0.113.9', 'netstat -ano (match the PID in Task Manager)', 'ping 203.0.113.9', 'ipconfig /all'], answer: 1, why: ['That shows the network path, not the local process.', 'netstat -ano lists connections with owning PIDs.', 'That only tests reachability.', 'That shows adapter configuration.'] },
      ],
      sources: [
        { title: 'Microsoft Learn: Windows commands reference', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    c2: {
      sections: [
        { h: 'The principle: a file system is a contract for organizing and protecting data', html: `
<p>A file system decides how files are laid out on disk, how big they can be, which systems can read them, and whether permissions and encryption are possible. Choosing one is a trade-off between <strong>compatibility</strong> and <strong>capability</strong>.</p>` },
        { h: 'The common file systems', html: `
<pre>FAT32   max file 4 GB; readable almost everywhere; no permissions
exFAT   large files; Windows + macOS; for flash media; no permissions
NTFS    Windows standard: permissions (ACLs), encryption (EFS), compression, journaling
ext4    common Linux file system; Linux permissions; journaling
APFS    modern macOS file system</pre>
<p><strong>Journaling</strong> records changes before making them, so a crash doesn't leave the file system corrupted.</p>` },
        { h: 'NTFS permissions vs share permissions', html: `
<p>On Windows file servers, two layers apply to network access:</p>
<ul>
  <li><strong>Share permissions</strong> apply only when the folder is accessed over the network.</li>
  <li><strong>NTFS permissions</strong> apply always, locally and over the network.</li>
  <li>For network access, the <strong>most restrictive</strong> combination wins. Common practice: set the share wide (e.g. Authenticated Users: Full Control) and control access precisely with NTFS permissions.</li>
  <li><strong>Inheritance:</strong> child folders inherit permissions unless inheritance is turned off. An explicit <strong>Deny</strong> overrides Allow.</li>
  <li>Moving a file within the same NTFS volume keeps its permissions; copying (or moving to a different volume) usually inherits the destination's permissions.</li>
</ul>` },
        { h: 'Least privilege', html: `
<p>Give each person only the access their job needs, ideally through <em>groups</em> rather than individual accounts. Overly broad permissions are one of the most common findings in security assessments, because they let one compromised account reach far more data than it should.</p>` },
      ],
      misconceptions: ['Share permissions alone protect files. (NTFS permissions apply locally too.)', 'Copying a file keeps its permissions. (It usually inherits the destination\'s.)'],
      examTraps: ['A 4+ GB file won\'t copy to a USB stick → FAT32 limit.', 'Share and NTFS combined → most restrictive wins.'],
      onTheJob: 'Admins design folder permissions with groups. Security reviews hunt for "Everyone: Full Control" on sensitive shares, a frequent path to large data exposures.',
      checks: [
        { q: 'A share grants Everyone: Full Control. The folder\'s NTFS permissions give the HR group Read only. What can an HR user do over the network?', options: ['Full Control', 'Read only, since the most restrictive combination applies', 'Nothing', 'Write but not delete'], answer: 1, why: ['The share allows it, but NTFS restricts it further.', 'Over the network, both layers apply and the stricter one wins.', 'Both layers grant at least Read.', 'Not granted by NTFS.'] },
        { q: 'A file with restricted permissions is COPIED into a folder where Everyone can read. What happens to its permissions?', options: ['It keeps the restricted permissions', 'It typically inherits the destination folder\'s permissions, so it may become readable by everyone', 'It becomes inaccessible', 'Permissions are deleted entirely'], answer: 1, why: ['Moving within the same volume keeps them; copying generally doesn\'t.', 'Copies take on the destination\'s inherited permissions, a classic accidental exposure.', 'Not the default behavior.', 'Files always have some ACL.'] },
      ],
      sources: [
        { title: 'Microsoft Learn: NTFS overview', url: 'https://learn.microsoft.com/en-us/windows-server/storage/file-server/ntfs-overview' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    c3: {
      sections: [
        { h: 'The principle: classify malware by HOW it spreads and WHAT it does', html: `
<p>Malware names describe two separate things: the <em>delivery/spread mechanism</em> (does it need a user? does it spread on its own?) and the <em>payload</em> (what it does once running). Classifying both tells you which defenses matter.</p>` },
        { h: 'Spread mechanisms', html: `
<ul>
  <li><strong>Virus:</strong> attaches to files or programs and spreads when they're run. It needs user action.</li>
  <li><strong>Worm:</strong> spreads by itself across networks, often through unpatched services. No user action is needed, so patching and network segmentation are key.</li>
  <li><strong>Trojan:</strong> disguised as something wanted. The user runs it willingly. Defenses: application allow-listing, user awareness, least privilege.</li>
</ul>` },
        { h: 'Payloads and behaviors', html: `
<ul>
  <li><strong>Ransomware:</strong> encrypts data and demands payment, often after stealing data for extra leverage. Defense: offline, tested backups, plus everything that stops the initial access.</li>
  <li><strong>Spyware / keyloggers:</strong> secretly collect data or keystrokes. MFA limits the value of stolen passwords.</li>
  <li><strong>Rootkits:</strong> hide deep in the OS (even the kernel) to avoid detection. Often they're removed by rebuilding the system rather than cleaning it.</li>
  <li><strong>Botnets:</strong> infected machines controlled remotely, used for spam, denial-of-service or mining.</li>
  <li><strong>Cryptominers:</strong> steal CPU/GPU power. Symptoms: heat, noise, slowness, high bills in the cloud.</li>
  <li><strong>Fileless malware:</strong> runs in memory using built-in tools (like PowerShell) and leaves few files to scan. Behavior-based detection (EDR) matters here.</li>
</ul>` },
        { h: 'Common symptoms', html: `
<p>Unexpected slowness or high CPU, pop-ups and browser redirects, disabled security tools, unknown processes or startup entries, files renamed with strange extensions, and unusual outbound network connections.</p>` },
      ],
      misconceptions: ['Antivirus alone stops all malware. (Layered defenses are needed: patching, least privilege, backups, EDR, user awareness.)', 'Every infection can be cleaned in place. (Rootkits and deep compromises often call for a rebuild.)'],
      examTraps: ['"Spread with no user interaction" → worm.', '"Looks like a legitimate free tool" → trojan.'],
      onTheJob: 'SOC analysts classify alerts by behavior. Incident responders choose clean-vs-rebuild decisions and recovery strategies based on the malware type.',
      checks: [
        { q: 'An outbreak hits 200 servers overnight through an unpatched network service. Nobody opened any file. Which defense would have helped MOST?', options: ['User awareness training', 'Timely patching of the vulnerable service and network segmentation', 'Stronger Wi-Fi passwords', 'Screen privacy filters'], answer: 1, why: ['No user action was involved.', 'Worms exploit unpatched services. Patching removes the hole; segmentation limits the spread.', 'Unrelated to server-to-server spread.', 'Unrelated.'] },
        { q: 'Antivirus scans come back clean, but the machine still makes hidden outbound connections and system tools show nothing unusual. Which malware type is most consistent with this?', options: ['Adware', 'A rootkit hiding itself from the OS and its tools', 'A worm', 'A trojan that was already removed'], answer: 1, why: ['Adware is usually noisy, not hidden.', 'Rootkits subvert the OS so normal tools (and scanners) don\'t see them. Use offline or behavior-based analysis, and often rebuild.', 'Spread mechanism isn\'t the issue here; hiding is.', 'The activity is ongoing.'] },
      ],
      sources: [
        { title: 'CISA: Malware, phishing and ransomware guidance', url: 'https://www.cisa.gov/topics/cyber-threats-and-advisories/malware-phishing-and-ransomware' },
        { title: 'NIST SP 800-83: Guide to Malware Incident Prevention and Handling', url: 'https://csrc.nist.gov/publications/sp800' },
      ],
    },

    c4: {
      sections: [
        { h: 'The principle: attackers exploit trust, urgency and helpfulness', html: `
<p>Social engineering targets <em>people</em> rather than technology, because a convincing request can bypass every technical control. Most attacks lean on a few psychological levers: <strong>authority</strong> ("I\'m from IT / the CEO"), <strong>urgency</strong> ("in 2 hours your account closes"), <strong>fear</strong>, <strong>helpfulness</strong> and <strong>familiarity</strong>.</p>` },
        { h: 'Techniques, by channel', html: `
<pre>Email        phishing (mass) · spear phishing (targeted) · whaling (executives) · business email compromise
Phone        vishing
SMS / chat   smishing
In person    tailgating/piggybacking · shoulder surfing · impersonation · dumpster diving
Web          typosquatting / lookalike domains · watering hole (compromising a site the targets visit)</pre>` },
        { h: 'How to spot it', html: `
<ul>
  <li><strong>Check the real sender domain,</strong> not the display name. Watch for lookalikes such as a 0 in place of an o, or an extra word.</li>
  <li><strong>Hover links</strong> to see where they really go.</li>
  <li><strong>Be suspicious of urgency</strong> combined with an unusual request: changing bank details, buying gift cards, sharing a code.</li>
  <li><strong>Verify through a second, trusted channel:</strong> call the person back on a known number, not the one in the message.</li>
</ul>` },
        { h: 'Defenses that work in combination', html: `
<p>Training and phishing simulations, <strong>MFA</strong> (ideally phishing-resistant, like FIDO2 security keys), email authentication (SPF, DKIM, DMARC), out-of-band verification for payments, badge-controlled doors with anti-tailgating policies, privacy screens, and shredding. A culture where people <em>report</em> without fear of blame is as important as any tool.</p>` },
      ],
      misconceptions: ['Only careless people fall for phishing. (Well-crafted targeted attacks fool experts; design controls assuming someone will click.)', 'MFA makes phishing harmless. (Push-fatigue and real-time relay attacks exist; phishing-resistant MFA closes most of that gap.)'],
      examTraps: ['Match the channel: phone = vishing, SMS = smishing, an executive target = whaling.', '"Following someone through a secure door" = tailgating.'],
      onTheJob: 'Security awareness teams run simulations. SOC analysts triage reported phish, and IT verifies payment-change requests out of band. Authorized physical and social engineering assessments exist, but always with written scope.',
      checks: [
        { q: 'An "urgent" email from the CFO\'s name asks accounts payable to change a supplier\'s bank details today. Best response?', options: ['Make the change; the CFO is senior', 'Verify by calling the CFO or the supplier on a KNOWN number, not one in the email', 'Reply to the email asking if it\'s real', 'Forward it to the whole company'], answer: 1, why: ['Authority plus urgency is the classic business email compromise pattern.', 'Out-of-band verification defeats spoofed or compromised email.', 'Replying may go straight to the attacker.', 'Report it to security, not everyone.'] },
        { q: 'Which control best limits the damage if an employee DOES enter their password on a fake login page?', options: ['A longer password', 'Phishing-resistant MFA (e.g. a FIDO2 security key)', 'A screensaver password', 'Hiding the Wi-Fi SSID'], answer: 1, why: ['A longer password is still stolen when typed into a fake page.', 'Security keys are bound to the real site, so a stolen password alone can\'t log in.', 'Unrelated.', 'Unrelated.'] },
      ],
      sources: [
        { title: 'CISA: Avoiding social engineering and phishing attacks', url: 'https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks' },
        { title: 'NIST SP 800-63B: Digital Identity Guidelines (authenticators)', url: 'https://pages.nist.gov/800-63-3/sp800-63b.html' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
