/* study/aplus1-b.js — in-depth notes: A+ Core 1 lessons a5–a9. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    a5: {
      sections: [
        { h: 'The principle: hardware becomes software', html: `
<p>Virtualization lets one physical computer act as many separate computers. A <strong>hypervisor</strong> divides the real CPU, memory, storage and network among <strong>virtual machines (VMs)</strong>, each running its own operating system as if it had its own hardware. Cloud computing is the same idea sold as a service, at enormous scale.</p>` },
        { h: 'Hypervisors', html: `
<ul>
  <li><strong>Type 1 (bare metal):</strong> runs directly on the hardware. Examples: VMware ESXi, Microsoft Hyper-V, KVM, Proxmox. Used in data centers and clouds.</li>
  <li><strong>Type 2 (hosted):</strong> runs as an application on a normal OS. Examples: VirtualBox, VMware Workstation. Ideal for learning labs.</li>
  <li>The CPU must support hardware virtualization (<strong>Intel VT-x or AMD-V</strong>), and it often has to be switched on in BIOS/UEFI. "VMs won't start" is frequently just this setting.</li>
  <li><strong>Snapshots</strong> save a VM's exact state, so you can experiment and roll back. That's perfect for a home lab: break it, restore it.</li>
</ul>` },
        { h: 'Cloud: the official definition', html: `
<p>NIST SP 800-145 defines cloud by five characteristics: <strong>on-demand self-service</strong>, <strong>broad network access</strong>, <strong>resource pooling</strong> (many customers share the hardware), <strong>rapid elasticity</strong> (scale up and down quickly) and <strong>measured service</strong> (pay for what you use).</p>
<pre>Service models   IaaS (VMs, networks) · PaaS (a platform for your code) · SaaS (finished apps)
Deployment       public · private · hybrid · community</pre>` },
        { h: 'The security angle', html: `
<p>VMs are isolated from each other, which is why analysts open suspicious files in a sandbox VM. Isolation isn't perfect, though: "VM escape" vulnerabilities, where code breaks out of a VM into the host, are rare but serious, so hypervisors must be patched. In the cloud, shared hardware means security depends heavily on the customer's own configuration (the shared responsibility model).</p>` },
      ],
      misconceptions: ['A VM is completely isolated no matter what. (Isolation is strong but depends on patching and configuration.)', 'SaaS means the customer has no security responsibilities. (Data and access settings stay yours.)'],
      examTraps: ['A scenario says "VirtualBox won\'t start VMs on a new PC": check that virtualization is enabled in BIOS/UEFI.', 'Type 1 vs Type 2 hinges on whether there\'s a host OS underneath.'],
      onTheJob: 'Labs, malware analysis, server consolidation, disaster recovery and nearly every cloud role rely on virtualization. Building a home lab of VMs is one of the best things a beginner can do.',
      checks: [
        { q: 'A student installs VirtualBox on a new laptop, but VMs fail with "hardware acceleration not available". Most likely fix?', options: ['Buy more RAM', 'Enable Intel VT-x / AMD-V in the BIOS/UEFI settings', 'Switch to a Type 1 hypervisor', 'Reinstall the operating system'], answer: 1, why: ['Not related to hardware acceleration support.', 'Hardware virtualization is often disabled by default and must be turned on in firmware.', 'Type 1 hypervisors need the same CPU feature.', 'The OS isn\'t the cause.'] },
        { q: 'Which NIST cloud characteristic describes automatically adding servers during a traffic spike, then removing them?', options: ['Measured service', 'Rapid elasticity', 'Broad network access', 'Resource pooling'], answer: 1, why: ['That\'s about metering usage for billing.', 'Scaling quickly with demand, both up and down.', 'That\'s about access from many kinds of devices.', 'That\'s about sharing infrastructure among customers.'] },
      ],
      sources: [
        { title: 'NIST SP 800-145: The NIST Definition of Cloud Computing', url: 'https://csrc.nist.gov/pubs/sp/800/145/final' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    a6: {
      sections: [
        { h: 'The principle: mobile devices carry company data outside the building', html: `
<p>Phones and laptops leave the protected office network every day, so they get lost, stolen and connected to untrusted networks. Mobile management is about keeping control of the <em>data</em> wherever the device goes.</p>` },
        { h: 'Management models and tools', html: `
<ul>
  <li><strong>BYOD</strong> (bring your own device) vs <strong>COPE</strong> (corporate-owned, personally enabled) vs fully corporate devices. Ownership decides how much control the company can reasonably enforce.</li>
  <li><strong>MDM</strong> (mobile device management) enforces policy: screen lock, encryption, app restrictions, and <strong>remote lock or wipe</strong>.</li>
  <li><strong>Containerization</strong> separates work apps and data from personal ones, so the company can wipe work data without touching personal photos. This is key for BYOD.</li>
  <li>Locating lost devices, OS update enforcement and certificate-based Wi-Fi/VPN profiles are typical MDM features.</li>
</ul>` },
        { h: 'Connectivity', html: `
<ul>
  <li><strong>Bluetooth:</strong> short range; devices must be paired, so turn off discoverability when not pairing.</li>
  <li><strong>NFC:</strong> a few centimeters; used for tap-to-pay and badges.</li>
  <li><strong>Hotspot/tethering:</strong> shares the phone's cellular data. Use a strong password.</li>
  <li><strong>Laptops:</strong> the parts replaced most often are batteries, keyboards, screens, storage and RAM (when it isn't soldered). Swollen lithium batteries are a fire risk: stop using the device and dispose of the battery properly.</li>
</ul>` },
      ],
      misconceptions: ['Remote wipe on a BYOD phone must erase everything. (With containerization, only the work container is wiped.)', 'Bluetooth is safe because it\'s short range. (Leave discoverability off and keep devices patched.)'],
      examTraps: ['"Lost phone with company data" → MDM remote wipe.', '"Separate work and personal data on employee-owned phones" → containerization.'],
      onTheJob: 'Endpoint and IT teams manage fleets of devices through MDM. Security policies cover lost-device response, encryption requirements and which apps may access company data.',
      checks: [
        { q: 'An employee leaves the company. Their personal phone has company email and files. How do you remove company data without erasing their personal photos?', options: ['Factory reset the phone', 'Wipe only the managed work container/profile through MDM', 'Ask them to delete the email app', 'Change their password and do nothing else'], answer: 1, why: ['That destroys personal data on a device the company doesn\'t own.', 'Containerization exists for exactly this: a selective wipe of company data.', 'There\'s no assurance, and cached files may remain.', 'Necessary, but locally stored data stays on the phone.'] },
      ],
      sources: [
        { title: 'NIST SP 800-124: Guidelines for Managing the Security of Mobile Devices in the Enterprise', url: 'https://csrc.nist.gov/publications/sp800' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    a7: {
      sections: [
        { h: 'The principle: troubleshooting is the scientific method applied to machines', html: `
<p>Guessing and changing random things is slow and often makes problems worse. The CompTIA method is a disciplined loop: observe, form a hypothesis, test it, act, verify, record. It works the same way on a printer, a network or a security incident.</p>` },
        { h: 'The six steps, and what each one protects against', html: `
<ol>
  <li><strong>Identify the problem:</strong> question the user, find out what changed recently, reproduce the issue, and <em>back up data before making changes</em>. This protects against fixing the wrong thing, and against losing data.</li>
  <li><strong>Establish a theory of probable cause:</strong> question the obvious (power, cables, recent updates). Research symptoms if needed.</li>
  <li><strong>Test the theory:</strong> confirm the cause before acting. If it's wrong, form a new theory or <em>escalate</em>.</li>
  <li><strong>Establish a plan of action and implement the solution:</strong> consider the impact; get approval when needed (change management).</li>
  <li><strong>Verify full system functionality</strong> and, if applicable, <strong>implement preventive measures</strong>.</li>
  <li><strong>Document findings, actions and outcomes.</strong></li>
</ol>` },
        { h: 'Worked example', html: `
<p>"Email stopped working after lunch." <strong>Identify:</strong> only this user? (Yes.) What changed? (They moved desks.) <strong>Theory:</strong> no network at the new desk. <strong>Test:</strong> ipconfig shows 169.254.x.x, which confirms it. <strong>Plan:</strong> patch the wall port. <strong>Verify:</strong> email works and the user confirms. <strong>Document:</strong> "Port 3B unpatched; patched to switch port 17."</p>` },
      ],
      misconceptions: ['Documentation is optional busywork. (It turns one fix into the team\'s knowledge and creates an audit trail.)', 'If the first theory fails, keep trying random things. (Form a new theory, or escalate.)'],
      examTraps: ['Know the order exactly. Questions ask "what is the NEXT step?"', 'Backing up data belongs in step 1, before any change.'],
      onTheJob: 'Every IT and security role uses this loop. Incident responders follow the same pattern: scope it, hypothesize, test with evidence, contain, verify, write the report.',
      checks: [
        { q: 'You suspect a bad cable, swap it, and the problem continues. What should you do next?', options: ['Reinstall the operating system', 'Establish a new theory, or escalate', 'Document the fix', 'Verify full functionality'], answer: 1, why: ['A drastic change without a tested theory.', 'The theory failed its test, so go back to forming one, or escalate if you\'re stuck.', 'Nothing has been fixed yet.', 'Nothing has been fixed to verify.'] },
        { q: 'Before replacing a user\'s failing hard drive, what belongs in step 1?', options: ['Order the new drive', 'Back up the user\'s data', 'Update the BIOS', 'Document the outcome'], answer: 1, why: ['That comes in planning, later.', 'Protect the data before any change. It\'s part of identifying the problem.', 'Unrelated and risky.', 'Documentation is the last step.'] },
      ],
      sources: [
        { title: 'CompTIA A+ exam objectives: troubleshooting methodology (official, free)', url: 'https://www.comptia.org/certifications/a' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    a8: {
      sections: [
        { h: 'The principle: firmware is the trust anchor', html: `
<p>When you press the power button, the first code that runs isn't the operating system: it's <strong>firmware</strong> (BIOS or UEFI) stored on the motherboard. It tests the hardware (<strong>POST</strong>), then finds and starts the bootloader. Whatever runs first can control everything that runs after it, which is why modern firmware adds security features.</p>` },
        { h: 'BIOS vs UEFI', html: `
<pre>               Legacy BIOS              UEFI
Partitioning   MBR (max 2 TB disk)      GPT (huge disks, many partitions)
Boot security  none                     Secure Boot
Interface      text menus               graphical, mouse support</pre>
<ul>
  <li><strong>Secure Boot:</strong> only lets bootloaders signed by trusted keys run, which blocks boot-level malware (bootkits).</li>
  <li><strong>TPM 2.0:</strong> a security chip that stores keys and measures the boot process. BitLocker uses it, and Windows 11 requires it.</li>
  <li><strong>CMOS battery:</strong> keeps the clock and settings when unplugged. Symptom of failure: the date resets every power-off.</li>
  <li>Set a <strong>firmware password</strong> and a safe <strong>boot order</strong> so nobody can boot a USB drive to bypass the OS.</li>
</ul>` },
        { h: 'Motherboard and CPU compatibility', html: `
<ul>
  <li><strong>Form factor</strong> (ATX, microATX, mini-ITX) must fit the case.</li>
  <li><strong>The CPU socket and chipset</strong> must match the processor family. Check the board's supported-CPU list; some CPUs need a firmware update first.</li>
  <li>Always use <strong>thermal paste</strong> between the CPU and its cooler; overheating causes throttling and shutdowns.</li>
  <li><strong>PCIe x16</strong> slots are for graphics cards; x1/x4 slots suit network cards, capture cards and similar.</li>
</ul>` },
      ],
      misconceptions: ['The OS is the first thing that runs. (Firmware runs first and decides what boots.)', 'Secure Boot is just a licensing feature. (It blocks unsigned boot code, a real security control.)'],
      examTraps: ['A drive over 2 TB that won\'t show its full size on an older system: MBR vs GPT.', 'A clock that resets after unplugging: the CMOS battery.'],
      onTheJob: 'Technicians configure firmware during builds and repairs. Security teams enforce Secure Boot, TPM-backed encryption and firmware passwords, and keep firmware updated, because firmware attacks survive OS reinstalls.',
      checks: [
        { q: 'Someone boots a stolen laptop from a USB stick to copy files, bypassing the Windows login. Which combination would have stopped this?', options: ['A stronger Windows password only', 'Full-disk encryption (e.g. BitLocker with TPM) plus a firmware password and locked boot order', 'Antivirus', 'A larger hard drive'], answer: 1, why: ['Booting another OS bypasses the Windows login entirely.', 'Encryption makes the disk unreadable without the key, and firmware settings block easy USB booting.', 'Antivirus isn\'t running when another OS has booted.', 'Irrelevant.'] },
        { q: 'A new 4 TB disk shows only 2 TB usable on an older PC. Most likely cause?', options: ['The disk is defective', 'It\'s partitioned with MBR, which caps at 2 TB; GPT (with UEFI) is needed', 'Not enough RAM', 'The SATA cable is too long'], answer: 1, why: ['A classic sign of a partitioning limit, not a defect.', 'MBR addresses at most 2 TB. GPT removes that limit.', 'RAM doesn\'t affect disk capacity.', 'A cable won\'t halve the capacity.'] },
      ],
      sources: [
        { title: 'NIST SP 800-147: BIOS Protection Guidelines', url: 'https://csrc.nist.gov/publications/sp800' },
        { title: 'Microsoft Learn: Windows security documentation (Secure Boot, TPM, BitLocker)', url: 'https://learn.microsoft.com/en-us/windows/security/' },
      ],
    },

    a9: {
      sections: [
        { h: 'The principle: trade capacity for survival', html: `
<p>RAID (Redundant Array of Independent Disks) combines disks to gain speed, survive failures, or both. The core trade-off: every bit of redundancy costs capacity. Copies (mirroring) cost the most space; parity is a cleverer, cheaper form of redundancy.</p>` },
        { h: 'How parity works (the idea behind RAID 5)', html: `
<p>Parity uses <strong>XOR</strong>: for each stripe of data blocks, the array stores one extra block equal to the XOR of the others. If any single block is lost, XOR-ing the remaining blocks rebuilds it exactly.</p>
<pre>Data A = 1010, Data B = 0110 → Parity = A XOR B = 1100
Lose A?  Rebuild: B XOR Parity = 0110 XOR 1100 = 1010 ✓</pre>
<p>That's why RAID 5 loses exactly one disk's worth of capacity, whatever the number of disks, and survives exactly one failure. RAID 6 stores two independent parity blocks: two disks of capacity, two failures survived.</p>` },
        { h: 'The levels', html: `
<pre>Level   Min disks  Usable          Survives
0       2          all             0  (one failure loses everything)
1       2          50%             1  (mirror)
5       3          n − 1 disks     1
6       4          n − 2 disks     2
10      4          50%             1 guaranteed (more if failures hit different mirror pairs)</pre>
<p><strong>Rebuild risk:</strong> after a failure, the array rebuilds onto a replacement disk, which stresses the remaining disks for hours. With large disks, a second failure during the rebuild is a real risk, which is one reason RAID 6 or 10 is preferred for big arrays.</p>` },
        { h: 'RAID is not a backup', html: `
<p>RAID protects against a <em>disk</em> failing. It does nothing against deletion, corruption, ransomware, theft, fire or a controller fault, because every one of those affects every disk at once. You still need backups, ideally following the 3-2-1 rule.</p>` },
      ],
      misconceptions: ['RAID means you don\'t need backups. (It only covers disk failure.)', 'RAID 0 adds redundancy. (It has none; it only adds speed.)'],
      examTraps: ['"Maximum capacity with single-failure tolerance" on 3+ disks → RAID 5.', '"Two simultaneous failures" → RAID 6.'],
      onTheJob: 'Server admins choose RAID levels for databases and file servers. Incident responders know RAID won\'t help with ransomware, so recovery depends on offline backups.',
      checks: [
        { q: 'A file server uses RAID 1. Ransomware encrypts every file. What happens to the mirror copy?', options: ['It stays safe', 'It\'s encrypted too: the mirror faithfully copies every change, including the malicious ones', 'RAID 1 blocks ransomware', 'Only half the files are affected'], answer: 1, why: ['Mirroring copies writes instantly.', 'RAID replicates whatever is written. It protects against hardware failure, not bad writes. You need separate backups.', 'RAID has no awareness of malware.', 'Both disks receive every write.'] },
        { q: 'Using the XOR idea: data blocks 1100 and 1010, parity 0110. The disk holding 1100 dies. What does the rebuild produce?', options: ['1010', '1100', '0110', '0000'], answer: 1, why: ['That\'s the surviving data block.', '1010 XOR 0110 = 1100, so the lost block is restored exactly.', 'That\'s the parity block itself.', 'That would mean the blocks were identical.'] },
      ],
      sources: [
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
        { title: 'CompTIA A+ exam objectives (official, free)', url: 'https://www.comptia.org/certifications/a' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
