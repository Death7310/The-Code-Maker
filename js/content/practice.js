/* Track content: practice. Registered into CM.tracks; order is set in js/curriculum.js. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  const track = {
  id: 'practice',
  title: 'Professional Practice & Ethics',
  lang: 'PenTest+',
  blurb: 'Authorization, scope, methodology and reporting: what separates a professional tester from a criminal.',
  lessons: [
    {
      id: 'f1',
      title: 'Authorization comes first',
      body: `
<p>Penetration testing is legal <strong>only</strong> with written permission from someone who actually has the authority to grant it. Without that, the same activity is a crime in most countries. In the US that's the Computer Fraud and Abuse Act; in the UK, the Computer Misuse Act.</p>
<p>A professional engagement is defined by documents, signed <em>before</em> any testing starts:</p>
<ul>
  <li><strong>Statement of Work (SOW):</strong> what will be delivered and when.</li>
  <li><strong>Rules of Engagement (RoE):</strong> what's allowed, testing windows, contacts, and what to do if something breaks.</li>
  <li><strong>Scope:</strong> the exact systems, address ranges and applications that are in bounds. Everything else is out.</li>
  <li><strong>NDA / MSA:</strong> confidentiality and the overall contract terms.</li>
</ul>
<p>Practice only on systems you own, or on platforms built for it, where the operator gives you permission as part of signing up.</p>`,
      exercise: {
        type: 'quiz',
        question: 'You find a server during a test that is NOT listed in scope but looks vulnerable. What do you do?',
        options: [
          'Test it quickly, since it belongs to the same company',
          'Stop, record it, and ask the client contact whether to add it to scope in writing',
          'Ignore it completely and never mention it',
          'Test it, but leave it out of the report',
        ],
        answer: 1,
        explain: 'Scope is a legal boundary. Note what you saw and escalate it through the contact named in the RoE. Don\u2019t touch it until it\u2019s been added in writing.',
      },
    },
    {
      id: 'f2',
      title: 'The engagement lifecycle',
      body: `
<p>Most frameworks (PTES, NIST SP 800-115, and the CompTIA domain structure) describe roughly the same phases:</p>
<ol>
  <li><strong>Planning & scoping</strong>: agreements, objectives, constraints.</li>
  <li><strong>Information gathering</strong>: learning about the target within scope.</li>
  <li><strong>Vulnerability discovery & analysis</strong>: finding weaknesses and checking they're real.</li>
  <li><strong>Attacks & exploits</strong>: carefully showing impact, within the RoE.</li>
  <li><strong>Post-exploitation & cleanup</strong>: removing anything you added and restoring state.</li>
  <li><strong>Reporting & communication</strong>: the deliverable the client actually pays for.</li>
</ol>
<p>Scripting runs through all of these phases. You use it to parse data, automate repetitive checks and process results. That's why the exam tests whether you can read and change scripts.</p>`,
      exercise: {
        type: 'quiz',
        question: 'Which phase produces the main deliverable a client pays for?',
        options: ['Information gathering', 'Exploitation', 'Reporting & communication', 'Cleanup'],
        answer: 2,
        explain: 'The report turns technical findings into business risk and fixes. A test without a usable report has delivered little value.',
      },
    },
    {
      id: 'f3',
      title: 'Writing findings people can act on',
      body: `
<p>A good finding has a consistent structure:</p>
<ul>
  <li><strong>Title</strong> and <strong>severity</strong>, often scored with CVSS.</li>
  <li><strong>Affected assets</strong>: exactly which in-scope systems.</li>
  <li><strong>Description</strong>: what the weakness is, in plain language.</li>
  <li><strong>Evidence</strong>: timestamped steps, screenshots, logs.</li>
  <li><strong>Business impact</strong>: why leadership should care.</li>
  <li><strong>Remediation</strong>: concrete fixes, both short-term and long-term.</li>
</ul>
<p>Write an executive summary for non-technical readers, then technical detail for the people who'll fix the issues.</p>`,
      exercise: {
        type: 'quiz',
        question: 'Who is the executive summary written for?',
        options: ['The system administrators', 'Non-technical leadership', 'Other penetration testers', 'Law enforcement'],
        answer: 1,
        explain: 'Executives decide budget and priority. They need risk in business terms, not command output.',
      },
    },
  ],
};
  CM.tracks[track.id] = track;
})(typeof window !== 'undefined' ? window : globalThis);
