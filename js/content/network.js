/* Track content: CompTIA Network+ (N10-009) foundations. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.network = {
    id: 'network',
    title: 'Network+: How Networks Really Work',
    lang: 'Network+ N10-009',
    blurb: 'The OSI model, TCP vs UDP, subnetting, DNS and network troubleshooting: the core of everything in security.',
    lessons: [
      {
        id: 'n1',
        title: 'The OSI model',
        body: `
<p>The OSI model splits networking into 7 layers. Professionals use it to say exactly <em>where</em> a problem or attack happens.</p>
<pre>7 Application    HTTP, DNS, SMTP          (what the user's app speaks)
6 Presentation   encryption, formats
5 Session        managing conversations
4 Transport      TCP / UDP, ports
3 Network        IP addresses, routers
2 Data Link      MAC addresses, switches
1 Physical       cables, signals, radio</pre>
<p>Mnemonic from layer 1 up: <strong>P</strong>lease <strong>D</strong>o <strong>N</strong>ot <strong>T</strong>hrow <strong>S</strong>ausage <strong>P</strong>izza <strong>A</strong>way.</p>`,
        exercise: {
          type: 'input',
          question: 'At which OSI layer (number) do routers and IP addresses operate?',
          accept: ['3', 'three', 'layer 3'],
          explain: 'Layer 3, the Network layer. Switches and MAC addresses are at Layer 2.',
        },
        review: [
          { type: 'input', question: 'At which OSI layer (number) do TCP and UDP operate?', accept: ['4', 'four', 'layer 4'], explain: 'Layer 4, Transport.' },
          { question: 'A switch forwarding frames by MAC address works at which layer?', options: ['1', '2', '3', '7'], answer: 1, explain: 'Layer 2, Data Link.' },
        ],
      },
      {
        id: 'n2',
        title: 'TCP vs UDP',
        body: `
<ul>
  <li><strong>TCP</strong>: connection-oriented and reliable. It confirms delivery and resends anything lost. Used for web, email and file transfer.</li>
  <li><strong>UDP</strong>: connectionless and fast, with no delivery guarantee. Used for streaming, voice, gaming and most DNS queries.</li>
</ul>
<p>TCP starts every connection with a <strong>three-way handshake</strong>:</p>
<pre>client → server   SYN
server → client   SYN-ACK
client → server   ACK</pre>
<p>Understanding the handshake is essential for reading packet captures, and for knowing what scanning tools are actually doing.</p>`,
        exercise: {
          type: 'quiz',
          question: 'What is the correct order of the TCP three-way handshake?',
          options: ['ACK, SYN, SYN-ACK', 'SYN, SYN-ACK, ACK', 'SYN, ACK, FIN', 'SYN-ACK, SYN, ACK'],
          answer: 1,
          explain: 'SYN → SYN-ACK → ACK.',
        },
        review: [
          { question: 'A live video call favors speed over guaranteed delivery. Which protocol fits?', options: ['TCP', 'UDP'], answer: 1, explain: 'UDP. A late packet is useless in real-time media anyway.' },
        ],
      },
      {
        id: 'n3',
        title: 'Subnetting I: counting hosts',
        body: `
<p>A subnet mask says how much of an IP address identifies the <em>network</em> and how much identifies the <em>host</em>. CIDR notation writes this as a slash: <code>/24</code> means the first 24 bits are the network part.</p>
<pre>/24 = 255.255.255.0     host bits = 32 − 24 = 8</pre>
<p><strong>Usable hosts = 2<sup>host bits</sup> − 2.</strong> You subtract 2 because the first address is the <em>network address</em> and the last is the <em>broadcast address</em>.</p>
<pre>/24 → 2^8 − 2 = 254 hosts
/25 → 2^7 − 2 = 126 hosts
/30 → 2^2 − 2 = 2 hosts   (used for point-to-point links)</pre>
<p>Powers of 2 to memorize: 2, 4, 8, 16, 32, 64, 128, 256.</p>`,
        exercise: {
          type: 'input',
          question: 'How many usable host addresses are in a /26 network?',
          accept: ['62'],
          explain: '32 − 26 = 6 host bits. 2^6 = 64, minus 2 = 62.',
        },
        review: [
          { type: 'input', question: 'How many usable hosts are in a /28?', accept: ['14'], explain: '4 host bits: 16 − 2 = 14.' },
          { type: 'input', question: 'How many usable hosts are in a /27?', accept: ['30'], explain: '5 host bits: 32 − 2 = 30.' },
          { type: 'input', question: 'Write /24 as a dotted subnet mask.', accept: ['255.255.255.0'], explain: '24 ones = 255.255.255.0.' },
        ],
      },
      {
        id: 'n4',
        title: 'Subnetting II: network and broadcast',
        body: `
<p>Subnets come in blocks of equal size. <strong>Block size = 2<sup>host bits</sup></strong>, or equivalently 256 minus the last non-255 number in the mask.</p>
<p>Example: <code>192.168.1.70/26</code></p>
<pre>/26 → block size 64 → subnets start at .0, .64, .128, .192
70 falls in the block that starts at 64
network address   192.168.1.64
broadcast address 192.168.1.127   (next block start − 1)
usable range      192.168.1.65 – 192.168.1.126</pre>`,
        exercise: {
          type: 'input',
          question: 'What is the network address of 10.0.0.130/25?',
          accept: ['10.0.0.128'],
          explain: '/25 has a block size of 128, so blocks start at .0 and .128. 130 is in the .128 block.',
        },
        review: [
          { type: 'input', question: 'What is the broadcast address of 192.168.1.70/26?', accept: ['192.168.1.127'], explain: 'Block .64–.127, so broadcast = .127.' },
          { type: 'input', question: 'What is the network address of 172.16.5.200/27?', accept: ['172.16.5.192'], explain: 'Block size 32: …160, 192, 224. 200 falls in the .192 block.' },
        ],
      },
      {
        id: 'n5',
        title: 'DNS record types',
        body: `
<pre>A      name → IPv4 address
AAAA   name → IPv6 address
CNAME  alias pointing to another name
MX     mail server for a domain
TXT    free text (used for SPF/DKIM/DMARC email security)
PTR    IP address → name (reverse lookup)
NS     which servers are authoritative for the zone</pre>
<p>DNS records are public information. Defenders review them to check email security settings, and reconnaissance (within scope) starts here too.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Which DNS record tells the world where to deliver email for a domain?',
          options: ['A', 'CNAME', 'MX', 'PTR'],
          answer: 2,
          explain: 'MX = mail exchanger.',
        },
        review: [
          { question: 'Which record maps a name to an IPv6 address?', options: ['A', 'AAAA', 'MX', 'TXT'], answer: 1, explain: 'AAAA (quad-A) is for IPv6.' },
        ],
      },
      {
        id: 'n6',
        title: 'Troubleshooting from the bottom up',
        body: `
<p>Network+ uses a 7-step method, similar to A+'s but with "implement the solution" as its own step. A practical approach is to work <strong>up the OSI layers</strong>:</p>
<ol>
  <li>Physical: is it plugged in? Link lights on?</li>
  <li>Addressing: does <code>ipconfig</code> / <code>ip a</code> show a valid IP (not 169.254.x.x)?</li>
  <li>Gateway: can you <code>ping</code> the router?</li>
  <li>Beyond: can you ping an outside IP? Use <code>traceroute</code>/<code>tracert</code> to see where it stops.</li>
  <li>Names: does <code>nslookup example.com</code> resolve?</li>
</ol>`,
        exercise: {
          type: 'quiz',
          question: 'You can ping 8.8.8.8 but not google.com. Where is the problem?',
          options: ['Physical cabling', 'Default gateway', 'DNS', 'The NIC driver'],
          answer: 2,
          explain: 'Reaching an outside IP proves cabling, addressing and routing all work. Only name resolution is failing.',
        },
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
