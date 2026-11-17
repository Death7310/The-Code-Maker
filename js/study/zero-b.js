/* study/zero-b.js — in-depth notes: Ground Zero lessons z4–z7. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    z4: {
      sections: [
        { h: 'The principle: the OS is a manager and a referee', html: `
<p>Programs don't talk to hardware directly. The <strong>operating system</strong> manages the CPU, memory, storage and devices, and shares them fairly between programs. It's also a referee: it keeps programs and users from interfering with each other, and enforces who may access what.</p>` },
        { h: 'The layers', html: `
<pre>Applications       browser, editor, games          (user space)
System libraries   shared code programs call
Kernel             memory, processes, files, devices (kernel space)
Drivers            translate between the kernel and specific hardware
Hardware</pre>
<ul>
  <li>The <strong>kernel</strong> runs with full privileges; applications run restricted and must ask the kernel for anything sensitive.</li>
  <li><strong>Drivers</strong> run close to the kernel, so a buggy driver can crash the whole system (a common cause of blue screens). Install drivers only from trusted sources.</li>
  <li><strong>Updates</strong> patch security flaws in the OS and drivers, which is why keeping them current matters.</li>
</ul>` },
        { h: 'The OSes you\'ll meet', html: `
<p><strong>Windows</strong> dominates office desktops; <strong>Linux</strong> runs most servers, cloud machines and security tools; <strong>macOS</strong> is common on laptops; <strong>Android</strong> (Linux-based) and <strong>iOS</strong> run phones. Security work requires comfort with Windows and Linux in particular.</p>` },
      ],
      misconceptions: ['Applications control the hardware directly. (They go through the kernel.)', 'Drivers are minor add-ons. (They run with high privilege, so a bad one can crash or compromise the system.)'],
      examTraps: ['"New device doesn\'t work" → a missing or wrong driver.'],
      onTheJob: 'Technicians install drivers and updates; security teams care about which programs run with kernel-level privilege, because that\'s where the most dangerous malware aims to be.',
      checks: [
        { q: 'Why can a faulty graphics driver crash the entire computer, while a faulty game usually just closes?', options: ['Drivers are larger', 'Drivers run with kernel-level privilege, so their errors affect the whole system; apps run restricted', 'Games are tested more', 'Graphics cards are fragile'], answer: 1, why: ['Size isn\'t the reason.', 'Privilege level decides the blast radius of a bug.', 'Not the real reason.', 'This is about software, not hardware fragility.'] },
      ],
      sources: [
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    z5: {
      sections: [
        { h: 'The principle: a path is an address in a tree', html: `
<p>Files are organized as a tree of folders. A <strong>path</strong> is the route from a starting point to a file. Once you can read paths fluently, nothing on a computer is ever "lost", and you can tell scripts and tools exactly where to work.</p>` },
        { h: 'Absolute vs relative', html: `
<pre>Absolute  /home/sam/docs/plan.txt      starts at the root; works from anywhere
          C:\\Users\\sam\\Documents\\plan.txt
Relative  docs/plan.txt                starts from the current folder
          ../pics/logo.png             ".." = one folder up
          ./run.sh                     "." = the current folder</pre>
<p>Worked example: you're in <code>/home/sam/docs/reports</code>. The relative path <code>../../pics/a.png</code> goes up to <code>/home/sam/docs</code>, up again to <code>/home/sam</code>, then down into <code>pics</code>: <code>/home/sam/pics/a.png</code>.</p>` },
        { h: 'Extensions and hidden files', html: `
<ul>
  <li>An <strong>extension</strong> (.txt, .exe, .pdf) is a naming hint, not a guarantee. "invoice.pdf.exe" is a program, a classic disguise; Windows hides known extensions by default, so turning them on is a useful habit.</li>
  <li>On Linux and macOS, names starting with a dot (<code>.config</code>) are hidden from normal listings. <code>ls -a</code> shows them.</li>
</ul>` },
      ],
      misconceptions: ['A file\'s extension proves its type. (It\'s just part of the name.)', 'Relative paths always mean the same thing. (They depend on where you are.)'],
      examTraps: ['Spot the absolute path: it starts with / or a drive letter.'],
      onTheJob: 'Scripts, logs, configurations and investigations are all full of paths. Analysts notice when a "system" file lives in an odd path, such as a user\'s download or temp folder.',
      checks: [
        { q: 'A script uses the relative path "data/input.csv". It works when run from the project folder but fails from a scheduled task. Most likely reason?', options: ['The file is corrupted', 'The scheduled task starts in a different working folder, so the relative path points somewhere else', 'CSV files can\'t be scheduled', 'The disk is full'], answer: 1, why: ['It works when run manually, so the file is fine.', 'Relative paths resolve from the current folder; use an absolute path or set the working folder.', 'Not a real restriction.', 'It would fail both ways.'] },
      ],
      sources: [
        { title: 'Microsoft Learn: file path formats on Windows', url: 'https://learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats' },
      ],
    },

    z6: {
      sections: [
        { h: 'The principle: networks move data in addressed packages', html: `
<p>Data crossing a network is split into small <strong>packets</strong>, each labeled with where it came from and where it's going. Devices along the way read the labels and pass the packets on. The internet is millions of networks agreeing on these labels (the IP protocol) and on how to pass packets between each other.</p>` },
        { h: 'The key pieces', html: `
<ul>
  <li><strong>IP address:</strong> identifies a device on a network (like a street address).</li>
  <li><strong>MAC address:</strong> a hardware ID on the network card, used within the local network.</li>
  <li><strong>Switch:</strong> connects devices within one network and forwards traffic to the right port.</li>
  <li><strong>Router:</strong> connects different networks and chooses where packets go next. Your home router links your network to your internet provider.</li>
  <li><strong>DNS:</strong> translates names (example.com) into IP addresses.</li>
  <li><strong>Port:</strong> a number that picks which program on a device receives the traffic (443 for secure web).</li>
</ul>` },
        { h: 'Following one web request', html: `
<ol>
  <li>You type a site name; your device asks <strong>DNS</strong> for its IP address.</li>
  <li>Your device sends packets to that IP on port 443, via the <strong>router</strong> (your default gateway).</li>
  <li>Routers across the internet forward the packets hop by hop to the destination.</li>
  <li>The server replies, and the reply travels back the same way.</li>
</ol>
<p>Every step is a place where things can break, and where security controls (firewalls, encryption, filtering) can act.</p>` },
      ],
      misconceptions: ['The internet is one big network. (It\'s many independent networks connected by routers.)', 'A switch and a router are the same. (Switches connect within a network; routers connect networks.)'],
      examTraps: ['IP works but names fail → DNS.'],
      onTheJob: 'Every IT and security role assumes this mental model. Network+ builds directly on it.',
      checks: [
        { q: 'A laptop can reach other devices in the office but nothing on the internet. Which device is most likely involved?', options: ['The switch', 'The router / default gateway', 'The monitor', 'The keyboard'], answer: 1, why: ['Local traffic works, so the switch is passing traffic.', 'Leaving the local network requires the router; the gateway setting or the router itself is the likely fault.', 'Unrelated.', 'Unrelated.'] },
      ],
      sources: [
        { title: 'Professor Messer: free CompTIA Network+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    z7: {
      sections: [
        { h: 'The principle: commands are precise, repeatable and automatable', html: `
<p>A graphical interface is easy to explore, but a command does exactly the same thing every time, can be recorded in a ticket, run on a remote server, and put into a script that runs on a hundred machines. That's why professionals live in the terminal.</p>` },
        { h: 'Anatomy of a command', html: `
<pre>ls  -l  /var/log
│   │   └─ argument: what to act on
│   └──── option (flag): how to do it
└──────── the command itself</pre>
<ul>
  <li><code>whoami</code>, <code>pwd</code>, <code>ls</code>, <code>cd</code>, <code>cat</code>: who am I, where am I, what's here, move, read.</li>
  <li><code>man ls</code> or <code>ls --help</code> show the manual: learning to read help is a core skill.</li>
  <li>Tab completion and the up arrow (history) save time and typos.</li>
</ul>` },
        { h: 'Safe habits from day one', html: `
<ul>
  <li>Check where you are (<code>pwd</code>) before changing or deleting things.</li>
  <li>Read commands copied from the internet before running them, especially with sudo.</li>
  <li>Practice in a sandbox or a virtual machine, like this app's terminal, where mistakes are harmless.</li>
</ul>` },
      ],
      misconceptions: ['The command line is only for experts. (A handful of commands covers most daily work.)'],
      examTraps: ['Know which command answers which question: whoami (identity), pwd (location), ls (contents).'],
      onTheJob: 'Admins, analysts and testers all work in terminals daily; the Bash and Linux tracks build on these first commands.',
      checks: [
        { q: 'You\'re about to run a delete command and aren\'t sure which folder you\'re in. What should you run first?', options: ['rm -rf *', 'pwd', 'sudo whoami', 'clear'], answer: 1, why: ['That deletes everything here, the opposite of checking.', 'pwd shows your current location before you act.', 'Shows identity, not location.', 'Clears the screen only.'] },
      ],
      sources: [
        { title: 'GNU Bash Reference Manual', url: 'https://www.gnu.org/software/bash/manual/bash.html' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
