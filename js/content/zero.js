/* Track content: Ground Zero. Assumes no prior knowledge at all. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.zero = {
    id: 'zero',
    title: 'Ground Zero: How Computers Work',
    lang: 'Start here',
    blurb: 'No experience needed. What a computer is, how it stores information, how networks connect, and how to study so it sticks.',
    lessons: [
      {
        id: 'z0',
        title: 'How to learn this (so it sticks)',
        body: `
<p>Before any tech, you need a method. Research on learning is clear about what works. A large review of study techniques (Dunlosky et al., 2013) rated two of them as <strong>high utility</strong>:</p>
<ul>
  <li><strong>Practice testing (retrieval practice):</strong> pulling an answer out of memory strengthens it far more than rereading. In Roediger &amp; Karpicke (2006), students who tested themselves remembered much more a week later than students who reread.</li>
  <li><strong>Spaced practice:</strong> reviewing the same material over several days and weeks beats cramming it in one session (Cepeda et al., 2006).</li>
</ul>
<p>This app is built around both. Every lesson ends with a question you have to answer, and the <a href="#/review">Review</a> page brings old questions back at growing intervals.</p>
<p><strong>Your routine:</strong> do 1–2 new lessons, then clear your Review queue. From A+ onward, add 10 minutes of <a href="#/drills">Drills</a>, and take a <a href="#/exams">practice exam</a> when you finish each stage to find your weak domains. Short daily sessions beat long weekend ones.</p>
<p>Feeling like "an idiot who knows nothing" is the normal starting point. Struggling to recall an answer is part of how learning works, not a sign you're failing.</p>`,
        exercise: {
          type: 'quiz',
          question: 'You have one hour to study. Which plan will help you remember the most a week from now?',
          options: [
            'Reread your notes three times',
            'Highlight the important parts of the textbook',
            'Quiz yourself on the material, then check your answers',
            'Watch the same video twice',
          ],
          answer: 2,
          explain: 'Retrieval practice (testing yourself) beats rereading and highlighting for long-term memory. Dunlosky et al. (2013) rated highlighting and rereading "low utility".',
        },
      },
      {
        id: 'z1',
        title: 'What a computer actually does',
        body: `
<p>Every computer, from a phone to a server, does four things:</p>
<ol>
  <li><strong>Input</strong>: takes in data (keyboard, mouse, microphone, network).</li>
  <li><strong>Processing</strong>: does something with it (the CPU runs instructions).</li>
  <li><strong>Output</strong>: shows a result (screen, speakers, printer, network).</li>
  <li><strong>Storage</strong>: keeps data for later (SSD, hard drive).</li>
</ol>
<p>When something breaks, asking "is this an input, processing, output or storage problem?" is your first troubleshooting move. A+ is built on exactly this kind of thinking.</p>`,
        exercise: {
          type: 'quiz',
          question: 'A printer is an example of which kind of device?',
          options: ['Input', 'Processing', 'Output', 'Storage'],
          answer: 2,
          explain: 'A printer takes results from the computer and puts them on paper, so it\u2019s an output device.',
        },
        review: [
          { question: 'A microphone is which kind of device?', options: ['Input', 'Processing', 'Output', 'Storage'], answer: 0, explain: 'It brings sound INTO the computer.' },
        ],
      },
      {
        id: 'z2',
        title: 'Bits, bytes and binary',
        body: `
<p>Computers store everything (text, photos, programs) as <strong>bits</strong>. A bit is a single 0 or 1, like a switch that's off or on.</p>
<p><strong>8 bits = 1 byte.</strong> A byte can hold 2<sup>8</sup> = <strong>256</strong> different values (0 to 255).</p>
<p><strong>Binary</strong> is counting with only 0 and 1. Each position is worth double the one to its right:</p>
<pre>position value:  128  64  32  16   8   4   2   1
binary:            0   0   0   0   1   0   1   0
                                  8   +   2      = 10</pre>
<p>Add up the values wherever there's a 1. This matters later: IP addresses and subnetting (Network+) are binary math.</p>
<p>Sizes: 1 KB ≈ a thousand bytes, 1 MB ≈ a million, 1 GB ≈ a billion, 1 TB ≈ a trillion.</p>`,
        exercise: {
          type: 'input',
          question: 'Convert the binary number 00001010 to decimal (normal numbers).',
          accept: ['10'],
          explain: 'The 1s sit in the 8 and 2 positions: 8 + 2 = 10.',
        },
        review: [
          { type: 'input', question: 'How many bits are in one byte?', accept: ['8', 'eight'], explain: '8 bits = 1 byte.' },
          { type: 'input', question: 'Convert binary 11111111 to decimal.', accept: ['255'], explain: '128+64+32+16+8+4+2+1 = 255, the largest value one byte can hold.' },
          { type: 'input', question: 'Convert binary 00000101 to decimal.', accept: ['5'], explain: '4 + 1 = 5.' },
        ],
      },
      {
        id: 'z3',
        title: 'Inside the box: the main parts',
        body: `
<ul>
  <li><strong>CPU (processor)</strong>: the "brain" that runs instructions.</li>
  <li><strong>RAM (memory)</strong>: fast, short-term working space. <em>Volatile</em>: it's wiped when the power goes off.</li>
  <li><strong>Storage (SSD / HDD)</strong>: long-term memory. It keeps your files when the power is off.</li>
  <li><strong>Motherboard</strong>: the main circuit board everything plugs into.</li>
  <li><strong>PSU (power supply unit)</strong>: turns wall power into what the parts need.</li>
  <li><strong>GPU (graphics card)</strong>: draws the screen, and is also used heavily for AI work.</li>
</ul>
<p>Analogy: the CPU is a cook, RAM is the counter space, and storage is the pantry. More counter space (RAM) lets the cook work on more at once.</p>
<p><strong>Hands-on:</strong> if you can get an old desktop PC, open it (unplugged!) and find each part. Seeing the real thing makes this stick.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Which part loses its contents when the computer is turned off?',
          options: ['SSD', 'Hard drive (HDD)', 'RAM', 'USB flash drive'],
          answer: 2,
          explain: 'RAM is volatile: it needs power to hold data. SSDs, HDDs and flash drives are non-volatile.',
        },
        review: [
          { question: 'Which part converts wall power for the computer\u2019s components?', options: ['CPU', 'PSU', 'GPU', 'RAM'], answer: 1, explain: 'PSU = power supply unit.' },
        ],
      },
      {
        id: 'z4',
        title: 'Operating systems and software',
        body: `
<p>The <strong>operating system (OS)</strong> is the software that manages the hardware and lets other programs run. Common ones are Windows, macOS, Linux, Android and iOS.</p>
<ul>
  <li>The <strong>kernel</strong> is the core of the OS. It talks directly to the hardware.</li>
  <li>A <strong>driver</strong> is a small program that lets the OS use a specific device, like a printer or graphics card.</li>
  <li><strong>Applications</strong> (browsers, games, editors) run on top of the OS.</li>
</ul>
<p>For security careers, you'll need to be comfortable in both <strong>Windows</strong> (most office computers) and <strong>Linux</strong> (most servers and security tools).</p>`,
        exercise: {
          type: 'quiz',
          question: 'You plug in a new printer and Windows can\u2019t use it. What\u2019s most likely missing?',
          options: ['A kernel', 'A driver', 'More RAM', 'A new CPU'],
          answer: 1,
          explain: 'Drivers let the OS talk to specific hardware. A missing or wrong driver is a very common A+ troubleshooting answer.',
        },
      },
      {
        id: 'z5',
        title: 'Files, folders and paths',
        body: `
<p>Files live inside folders (also called directories), which can sit inside other folders. Together they form a tree. A <strong>path</strong> is the address of a file in that tree.</p>
<pre>Windows:  C:\\Users\\sam\\Documents\\notes.txt
Linux:    /home/sam/notes.txt</pre>
<ul>
  <li>An <strong>absolute path</strong> starts from the top (<code>C:\\</code> or <code>/</code>) and works from anywhere.</li>
  <li>A <strong>relative path</strong> starts from the folder you're in now. <code>..</code> means "one folder up".</li>
  <li>The <strong>extension</strong> (<code>.txt</code>, <code>.exe</code>, <code>.pdf</code>) hints at the file type, but it can be faked. That's a common trick in malware.</li>
</ul>
<p>Try it: the terminal on the right lists what's in a folder when you type <code>ls</code>.</p>`,
        exercise: {
          type: 'shell',
          task: 'List the contents of the logs folder. (Type: ls logs)',
          expect: 'auth.log\n',
        },
        review: [
          { question: 'Which of these is an ABSOLUTE path?', options: ['logs/auth.log', '../notes.txt', '/home/student/notes.txt', 'notes.txt'], answer: 2, explain: 'It starts at the root /, so it works from anywhere.' },
        ],
      },
      {
        id: 'z6',
        title: 'How networks connect',
        body: `
<p>A <strong>network</strong> is two or more devices that can talk to each other. The <strong>internet</strong> is a network of networks.</p>
<ul>
  <li><strong>IP address</strong>: a device's address on a network, like <code>192.168.1.20</code>.</li>
  <li><strong>Switch</strong>: connects devices <em>within</em> a local network.</li>
  <li><strong>Router</strong>: connects <em>different</em> networks together, such as your home network and the internet.</li>
  <li><strong>DNS</strong>: the internet's phone book. It turns names like <code>example.com</code> into IP addresses.</li>
  <li><strong>Port</strong>: a numbered "door" on a device that a particular service listens on (for example, 443 for secure websites).</li>
</ul>
<p>Networking is the foundation that security work stands on. You can't protect or test what you don't understand.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Websites load by IP address, but names don\u2019t work. Which service is most likely broken?',
          options: ['DHCP', 'DNS', 'The switch', 'The power supply'],
          answer: 1,
          explain: 'DNS translates names into IP addresses. If IPs work but names don\u2019t, suspect DNS.',
        },
        review: [
          { question: 'Which device connects different networks together?', options: ['Switch', 'Router', 'Monitor', 'Hub'], answer: 1, explain: 'Routers move traffic between networks. Switches connect devices within one network.' },
        ],
      },
      {
        id: 'z7',
        title: 'Your first commands',
        body: `
<p>A <strong>terminal</strong> (also called a command line or shell) lets you control a computer by typing. IT and security professionals use it constantly because it's precise, fast and can be automated.</p>
<p>The black box on the right is a safe practice terminal. Nothing you type can harm anything. Try:</p>
<pre>whoami     # who am I logged in as?
pwd        # which folder am I in?
ls         # what's in this folder?
cat notes.txt</pre>
<p>Once you've finished Ground Zero, start the <a href="#/track/bash">Bash track</a> alongside A+. A few minutes a day adds up.</p>`,
        exercise: {
          type: 'shell',
          task: 'Find out which user you are logged in as.',
          expect: 'student\n',
          hint: 'whoami',
        },
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
