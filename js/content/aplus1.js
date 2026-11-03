/* Track content: CompTIA A+ Core 1 (220-1201) foundations. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.aplus1 = {
    id: 'aplus1',
    title: 'A+ Core 1: Hardware & Networking',
    lang: 'A+ 220-1201',
    blurb: 'Hardware, networking, mobile, virtualization and cloud, plus the troubleshooting method used throughout the exam.',
    lessons: [
      {
        id: 'a1',
        title: 'Memory and storage types',
        body: `
<p><strong>RAM</strong> comes in generations: DDR4 and the newer DDR5. They aren't interchangeable, because the slots are keyed differently.</p>
<p><strong>Storage</strong>, roughly from slowest to fastest:</p>
<ul>
  <li><strong>HDD</strong>: spinning platters. Cheap and large, but slow. Speed is measured in RPM (5,400 or 7,200).</li>
  <li><strong>SATA SSD</strong>: flash memory with no moving parts, but limited by the older SATA connection.</li>
  <li><strong>NVMe SSD</strong>: flash connected over PCIe, usually in the small <strong>M.2</strong> form factor. The fastest of the three.</li>
</ul>
<p><strong>Note:</strong> M.2 is a <em>shape/slot</em>, not a speed. An M.2 drive can be SATA <em>or</em> NVMe. The exam likes to test this.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Which storage option is typically the fastest?',
          options: ['7,200 RPM HDD', 'SATA SSD', 'NVMe SSD', 'USB 2.0 flash drive'],
          answer: 2,
          explain: 'NVMe runs over PCIe lanes, giving it far more bandwidth than SATA.',
        },
        review: [
          { question: 'An M.2 drive is always NVMe. True or false?', options: ['True', 'False'], answer: 1, explain: 'False. M.2 is a form factor and can carry either SATA or NVMe.' },
        ],
      },
      {
        id: 'a2',
        title: 'Ports and cables',
        body: `
<ul>
  <li><strong>USB-C</strong>: reversible connector used for data, charging and video.</li>
  <li><strong>HDMI / DisplayPort</strong>: video (and audio) to monitors and TVs.</li>
  <li><strong>RJ45</strong>: the Ethernet network connector, used with Cat5e/Cat6 twisted-pair cable.</li>
  <li><strong>RJ11</strong>: the smaller telephone/DSL connector.</li>
  <li><strong>Fiber optic</strong>: light instead of electricity. Long distances and immune to electrical interference.</li>
</ul>
<p>Copper Ethernet (Cat5e/Cat6) is generally limited to about <strong>100 meters</strong> per run.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Which connector is used for a standard wired Ethernet connection?',
          options: ['RJ11', 'RJ45', 'HDMI', 'DisplayPort'],
          answer: 1,
          explain: 'RJ45 is the Ethernet connector. RJ11 is the smaller telephone connector.',
        },
        review: [
          { question: 'You need to run network cable 2 km between buildings. Best choice?', options: ['Cat5e', 'Cat6', 'Fiber optic', 'USB-C'], answer: 2, explain: 'Copper Ethernet tops out around 100 m. Fiber covers long distances.' },
        ],
      },
      {
        id: 'a3',
        title: 'IP addresses and DHCP',
        body: `
<p>An IPv4 address is four numbers from 0 to 255 separated by dots, like <code>192.168.1.20</code>. Each number is one byte (8 bits), which makes 32 bits in total.</p>
<p><strong>Private ranges</strong> are used inside home and office networks and aren't routed on the internet:</p>
<pre>10.0.0.0    – 10.255.255.255
172.16.0.0  – 172.31.255.255
192.168.0.0 – 192.168.255.255</pre>
<p><strong>DHCP</strong> automatically hands out IP addresses to devices. If a Windows PC can't reach a DHCP server, it gives itself an <strong>APIPA</strong> address in <code>169.254.x.x</code>. Seeing one is a classic clue on the exam.</p>
<p><code>127.0.0.1</code> is <strong>loopback</strong>: the device talking to itself.</p>`,
        exercise: {
          type: 'quiz',
          question: 'A user can’t reach anything. Their IP is 169.254.10.7. What’s the most likely cause?',
          options: ['DNS is down', 'The PC could not get an address from DHCP', 'The monitor is unplugged', 'The browser needs updating'],
          answer: 1,
          explain: '169.254.x.x is APIPA, a self-assigned address used when DHCP fails. Check the cable or Wi-Fi first, then the DHCP server.',
        },
        review: [
          { question: 'Which of these is a PRIVATE IP address?', options: ['8.8.8.8', '172.20.4.1', '1.1.1.1', '203.0.113.9'], answer: 1, explain: '172.16.0.0–172.31.255.255 is a private range.' },
          { type: 'input', question: 'What is the IPv4 loopback address?', accept: ['127.0.0.1'], explain: '127.0.0.1 always means "this device".' },
        ],
      },
      {
        id: 'a4',
        title: 'Common ports and protocols',
        body: `
<p>Services listen on numbered ports. You need to memorize these for A+, Network+, Security+ and PenTest+. Use the Review page to drill them.</p>
<pre>20/21  FTP      file transfer (unencrypted)
22     SSH      secure remote shell (also SFTP)
23     Telnet   remote shell (unencrypted, avoid)
25     SMTP     sending email
53     DNS      name lookups
67/68  DHCP     automatic addressing
80     HTTP     web (unencrypted)
110    POP3     receiving email
143    IMAP     receiving email
443    HTTPS    web (encrypted)
445    SMB      Windows file sharing
3389   RDP      Windows Remote Desktop</pre>
<p>Notice the pattern: older protocols (FTP, Telnet, HTTP) send data in plain text, and secure replacements (SFTP/SSH, HTTPS) encrypt it.</p>`,
        exercise: {
          type: 'input',
          question: 'Which port number does HTTPS use?',
          accept: ['443'],
          explain: 'HTTPS = 443. Plain HTTP = 80.',
        },
        review: [
          { type: 'input', question: 'Which port does SSH use?', accept: ['22'], explain: 'SSH = 22.' },
          { type: 'input', question: 'Which port does DNS use?', accept: ['53'], explain: 'DNS = 53.' },
          { type: 'input', question: 'Which port does Windows Remote Desktop (RDP) use?', accept: ['3389'], explain: 'RDP = 3389.' },
          { type: 'input', question: 'Which port does SMB (Windows file sharing) use?', accept: ['445'], explain: 'SMB = 445.' },
          { type: 'input', question: 'Which port does SMTP (sending email) use?', accept: ['25'], explain: 'SMTP = 25.' },
          { question: 'Which protocol should replace Telnet?', options: ['FTP', 'SSH', 'HTTP', 'SMTP'], answer: 1, explain: 'SSH provides an encrypted remote shell. Telnet is plain text.' },
        ],
      },
      {
        id: 'a5',
        title: 'Virtualization and cloud',
        body: `
<p>A <strong>virtual machine (VM)</strong> is a whole computer running as software inside another computer. The software that runs VMs is a <strong>hypervisor</strong>:</p>
<ul>
  <li><strong>Type 1 (bare metal)</strong>: runs directly on the hardware. Used in data centers.</li>
  <li><strong>Type 2 (hosted)</strong>: runs as an app on your normal OS, like VirtualBox. Ideal for a home lab.</li>
</ul>
<p><strong>Cloud service models:</strong></p>
<ul>
  <li><strong>IaaS</strong>: you rent virtual machines and networks.</li>
  <li><strong>PaaS</strong>: you rent a platform to deploy your code on.</li>
  <li><strong>SaaS</strong>: you just use the finished application (webmail, for example).</li>
</ul>
<p><strong>Career tip:</strong> setting up VMs is how you'll build a safe, legal lab for every later stage.</p>`,
        exercise: {
          type: 'quiz',
          question: 'A company uses a web-based email service it doesn’t manage at all. Which model is that?',
          options: ['IaaS', 'PaaS', 'SaaS', 'Type 1 hypervisor'],
          answer: 2,
          explain: 'With SaaS you just use the software. The provider manages everything underneath.',
        },
        review: [
          { question: 'VirtualBox running on your Windows laptop is which hypervisor type?', options: ['Type 1', 'Type 2'], answer: 1, explain: 'It runs on top of a host OS, so it’s Type 2 (hosted).' },
        ],
      },
      {
        id: 'a6',
        title: 'Mobile devices',
        body: `
<ul>
  <li><strong>MDM (mobile device management)</strong>: lets an organization enforce policies, push apps and remotely wipe lost devices.</li>
  <li><strong>Bluetooth</strong>: short-range wireless. Devices must be <em>paired</em> first.</li>
  <li><strong>NFC</strong>: very short range (a few cm). Used for tap-to-pay.</li>
  <li>Laptop parts that get replaced most often: battery, keyboard, storage, RAM (on models where it isn't soldered).</li>
</ul>`,
        exercise: {
          type: 'quiz',
          question: 'An employee loses a company phone. What lets IT erase it remotely?',
          options: ['NFC', 'Bluetooth pairing', 'MDM', 'APIPA'],
          answer: 2,
          explain: 'Mobile device management can enforce policy, lock or wipe managed devices.',
        },
      },
      {
        id: 'a7',
        title: 'The troubleshooting method',
        body: `
<p>CompTIA tests a specific, ordered method. Learn it word for word. It also appears in the hands-on, scenario-based questions.</p>
<ol>
  <li><strong>Identify the problem</strong>: question the user, check for recent changes, back up data first.</li>
  <li><strong>Establish a theory of probable cause</strong>: question the obvious. Is it plugged in?</li>
  <li><strong>Test the theory</strong> to find the cause. If it's wrong, form a new theory or escalate.</li>
  <li><strong>Establish a plan of action</strong> and implement the solution.</li>
  <li><strong>Verify full system functionality</strong> and, if needed, put preventive measures in place.</li>
  <li><strong>Document</strong> your findings, actions and outcomes.</li>
</ol>
<p>Security investigations follow the same pattern: observe, form a hypothesis, test it, act, verify, document.</p>`,
        exercise: {
          type: 'quiz',
          question: 'You’ve fixed the problem and confirmed everything works. What’s the final step?',
          options: ['Close the ticket immediately', 'Document findings, actions and outcomes', 'Reboot the computer', 'Escalate to a manager'],
          answer: 1,
          explain: 'Documentation is always last. It helps the next technician and builds a knowledge base.',
        },
        review: [
          { question: 'What comes right after "Identify the problem"?', options: ['Test the theory', 'Establish a theory of probable cause', 'Document findings', 'Implement the solution'], answer: 1, explain: 'Identify → theory → test → plan/implement → verify → document.' },
        ],
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
