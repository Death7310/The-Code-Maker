/* Track content: CompTIA Security+ (SY0-701) foundations. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.secplus = {
    id: 'secplus',
    title: 'Security+: Core Security Concepts',
    lang: 'Security+ SY0-701',
    blurb: 'The CIA triad, access control, cryptography, risk, incident response and governance. This is the baseline every security job expects.',
    lessons: [
      {
        id: 's1',
        title: 'The CIA triad',
        body: `
<p>Nearly every security control protects one or more of these:</p>
<ul>
  <li><strong>Confidentiality</strong>: only authorized people can see the data (encryption, access control).</li>
  <li><strong>Integrity</strong>: data isn't altered without detection (hashing, digital signatures).</li>
  <li><strong>Availability</strong>: systems work when needed (backups, redundancy, DDoS protection).</li>
</ul>
<p>Some models add <strong>non-repudiation</strong>: someone can't credibly deny an action they took, thanks to digital signatures and logs.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Ransomware encrypts a hospital’s records so staff can’t use them. Which part of the CIA triad is most directly hit?',
          options: ['Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'],
          answer: 2,
          explain: 'Staff can’t access the data, so availability is lost. (Many ransomware groups also steal data, which hits confidentiality too.)',
        },
        review: [
          { question: 'Comparing file hashes to detect tampering protects…', options: ['Confidentiality', 'Integrity', 'Availability'], answer: 1, explain: 'Integrity.' },
        ],
      },
      {
        id: 's2',
        title: 'AAA and access control',
        body: `
<ul>
  <li><strong>Authentication</strong>: proving who you are.</li>
  <li><strong>Authorization</strong>: what you're allowed to do.</li>
  <li><strong>Accounting</strong>: recording what you did (logs).</li>
</ul>
<p>Access control models:</p>
<ul>
  <li><strong>RBAC</strong>: permissions are based on role (e.g. "Nurse", "HR").</li>
  <li><strong>DAC</strong>: the owner decides who gets access.</li>
  <li><strong>MAC</strong>: labels and clearances are set centrally (e.g. Secret, Top Secret).</li>
</ul>
<p>Pair these with <strong>least privilege</strong> and <strong>zero trust</strong> ("never trust, always verify", even inside the network).</p>`,
        exercise: {
          type: 'quiz',
          question: 'A user logs in successfully but is blocked from the payroll folder. Which AAA step blocked them?',
          options: ['Authentication', 'Authorization', 'Accounting'],
          answer: 1,
          explain: 'They proved who they were (authentication) but aren’t permitted (authorization).',
        },
      },
      {
        id: 's3',
        title: 'Cryptography basics',
        body: `
<ul>
  <li><strong>Symmetric</strong>: one shared key encrypts and decrypts (e.g. AES). Fast, but sharing the key safely is hard.</li>
  <li><strong>Asymmetric</strong>: a public/private key pair (e.g. RSA, ECC). Anyone can encrypt with your <em>public</em> key; only your <em>private</em> key decrypts.</li>
  <li><strong>Hashing</strong>: a one-way fingerprint (e.g. SHA-256). Used for integrity and password storage, not for encryption.</li>
  <li><strong>Digital signature</strong>: you sign with your <em>private</em> key, and anyone verifies with your <em>public</em> key.</li>
</ul>
<p>HTTPS combines all of them. Asymmetric crypto agrees on a session key, and then fast symmetric crypto protects the data.</p>`,
        exercise: {
          type: 'quiz',
          question: 'To digitally sign a document, which key do you use?',
          options: ['Your public key', 'Your private key', 'The recipient’s public key', 'A shared symmetric key'],
          answer: 1,
          explain: 'Sign with your private key; others verify with your public key. That’s what proves it came from you.',
        },
        review: [
          { question: 'Which is a one-way function, not encryption?', options: ['AES', 'RSA', 'SHA-256', 'ECC'], answer: 2, explain: 'SHA-256 is a hash and can’t be decrypted.' },
          { question: 'AES is which type of cryptography?', options: ['Symmetric', 'Asymmetric', 'Hashing'], answer: 0, explain: 'AES uses a single shared key.' },
        ],
      },
      {
        id: 's4',
        title: 'Threats, vulnerabilities and risk',
        body: `
<ul>
  <li><strong>Vulnerability</strong>: a weakness, like unpatched software.</li>
  <li><strong>Threat</strong>: something that could exploit the weakness, like an attacker or malware.</li>
  <li><strong>Risk</strong>: the chance and impact of that happening. Often written <em>risk = likelihood × impact</em>.</li>
</ul>
<p>Known vulnerabilities get a <strong>CVE</strong> identifier and are usually scored with <strong>CVSS</strong> (0–10). Options for handling risk: <strong>mitigate</strong>, <strong>transfer</strong> (e.g. insurance), <strong>avoid</strong> or <strong>accept</strong>.</p>`,
        exercise: {
          type: 'quiz',
          question: 'A company buys cyber-insurance to cover breach costs. Which risk response is that?',
          options: ['Mitigate', 'Transfer', 'Avoid', 'Accept'],
          answer: 1,
          explain: 'Insurance moves the financial impact to a third party: risk transference.',
        },
      },
      {
        id: 's5',
        title: 'Incident response',
        body: `
<p>Security+ uses this incident response process:</p>
<ol>
  <li><strong>Preparation</strong>: plans, tools and training, before anything happens.</li>
  <li><strong>Detection</strong> and <strong>Analysis</strong>: spot it, confirm it, judge its scope.</li>
  <li><strong>Containment</strong>: stop it spreading.</li>
  <li><strong>Eradication</strong>: remove the cause.</li>
  <li><strong>Recovery</strong>: restore normal operations.</li>
  <li><strong>Lessons learned</strong>: improve for next time.</li>
</ol>
<p>Logs collected centrally in a <strong>SIEM</strong> are how most incidents get detected.</p>`,
        exercise: {
          type: 'quiz',
          question: 'An infected laptop is unplugged from the network to stop the malware spreading. Which phase is this?',
          options: ['Preparation', 'Containment', 'Eradication', 'Lessons learned'],
          answer: 1,
          explain: 'Isolating it limits the damage: containment. Removing the malware comes next (eradication).',
        },
      },
      {
        id: 's6',
        title: 'Governance and compliance',
        body: `
<ul>
  <li><strong>Policy</strong>: high-level rules ("all laptops are encrypted").</li>
  <li><strong>Standard</strong>: specific mandatory requirements ("use AES-256").</li>
  <li><strong>Procedure</strong>: step-by-step instructions.</li>
  <li><strong>Guideline</strong>: recommended, not mandatory.</li>
</ul>
<p>Regulations you'll meet: <strong>GDPR</strong> (EU personal data), <strong>HIPAA</strong> (US health data), <strong>PCI DSS</strong> (payment card data).</p>`,
        exercise: {
          type: 'quiz',
          question: 'An online store that processes credit cards must follow which standard?',
          options: ['HIPAA', 'PCI DSS', 'GDPR only', 'None'],
          answer: 1,
          explain: 'PCI DSS applies to anyone storing, processing or transmitting cardholder data.',
        },
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
