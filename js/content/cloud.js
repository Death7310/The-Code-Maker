/* Track content: vendor-neutral cloud foundations (feeds both AWS and Azure). */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.cloud = {
    id: 'cloud',
    title: 'Cloud Foundations (vendor-neutral)',
    lang: 'Cloud',
    blurb: 'The ideas behind every cloud provider: shared responsibility, identity, virtual networks, logging and infrastructure as code. Learn them once, then use them in AWS and Azure.',
    lessons: [
      {
        id: 'cl1',
        title: 'Why cloud is a multiplier',
        body: `
<p>Cloud doesn't replace what you've learned so far. It <strong>reuses</strong> it:</p>
<ul>
  <li><strong>Networking</strong> (Network+): cloud networks are built from CIDR blocks, subnets, routes and firewalls, the same subnetting you already practiced.</li>
  <li><strong>Operating systems</strong> (A+): cloud servers are Linux and Windows machines.</li>
  <li><strong>Security</strong> (Security+): identity, least privilege, logging, encryption and incident response all apply directly.</li>
  <li><strong>Scripting</strong> (Bash/Python/PowerShell): clouds are run through command-line tools, code and APIs.</li>
</ul>
<p>That's why this stage comes after Security+: almost nothing here is brand new. It's what you already know, applied somewhere new.</p>`,
        exercise: {
          type: 'quiz',
          question: 'A company’s cloud network is 10.0.0.0/16, split into /24 subnets. Which earlier skill do you need to plan it?',
          options: ['Binary-to-hex conversion', 'Subnetting from Network+', 'Malware classification', 'The A+ troubleshooting steps'],
          answer: 1,
          explain: 'Cloud virtual networks use the same CIDR subnetting as on-premises networks.',
        },
        review: [
          { type: 'input', question: 'How many /24 subnets fit inside a /16?', accept: ['256'], explain: '24 − 16 = 8 extra network bits → 2^8 = 256 subnets.' },
        ],
      },
      {
        id: 'cl2',
        title: 'The shared responsibility model',
        body: `
<p>In the cloud, security is split between you and the provider:</p>
<ul>
  <li>The provider secures <strong>"of" the cloud</strong>: data centers, hardware, the hypervisor and its global network.</li>
  <li>You secure <strong>"in" the cloud</strong>: your data, identities and access, your configurations, and (on IaaS) the guest operating system and its patches.</li>
</ul>
<p>The split moves with the service model. With IaaS you manage the most; with SaaS you manage mostly data and access.</p>
<p>Most cloud data exposures in the news come from <strong>customer misconfiguration</strong> (public storage, over-broad permissions, leaked keys), not from the provider being breached.</p>`,
        exercise: {
          type: 'quiz',
          question: 'A storage bucket is configured to allow public reads, and customer records leak. Whose responsibility was that setting?',
          options: ['The cloud provider’s', 'The customer’s', 'Nobody’s', 'The internet service provider’s'],
          answer: 1,
          explain: 'Configuration and access control are "in the cloud", so they’re the customer’s responsibility.',
        },
        review: [
          { question: 'On an IaaS virtual machine, who patches the guest operating system?', options: ['The provider', 'The customer'], answer: 1, explain: 'With IaaS, the guest OS is yours to maintain.' },
        ],
      },
      {
        id: 'cl3',
        title: 'Regions, zones and resilience',
        body: `
<ul>
  <li><strong>Region</strong>: a geographic area containing data centers (for example, "US East"). Choose based on latency, cost and data-residency laws.</li>
  <li><strong>Availability zone (AZ)</strong>: separate data center(s) within a region, with independent power and networking. Spreading across AZs survives the loss of one site.</li>
  <li><strong>Scaling</strong>: <em>vertical</em> means a bigger machine; <em>horizontal</em> means more machines. <strong>Elasticity</strong> means scaling automatically with demand.</li>
</ul>
<p>Availability is part of the CIA triad. In the cloud, you design for it.</p>`,
        exercise: {
          type: 'quiz',
          question: 'An app must keep running if one data center loses power. What should you do?',
          options: ['Use a bigger VM', 'Run instances in multiple availability zones', 'Turn on more logging', 'Store everything in one zone'],
          answer: 1,
          explain: 'Multiple AZs give fault isolation within a region.',
        },
      },
      {
        id: 'cl4',
        title: 'Identity is the new perimeter',
        body: `
<p>In the cloud, anyone with valid credentials can reach the management interface from anywhere. So <strong>identity</strong> (who can do what) is the main security boundary.</p>
<ul>
  <li><strong>Users</strong> are people; <strong>groups</strong> organize users; <strong>roles</strong> (or managed identities) give workloads and people <em>temporary</em> permissions.</li>
  <li><strong>Policies</strong> define permissions. Grant the least privilege needed.</li>
  <li>Protect the all-powerful <strong>root / global admin</strong> account with MFA and don't use it day to day.</li>
  <li>Prefer short-lived credentials (roles) over long-lived secret keys. Long-lived keys leak through code repositories, laptops and logs.</li>
</ul>`,
        exercise: {
          type: 'quiz',
          question: 'An application server needs to read from cloud storage. What’s the best way to give it access?',
          options: [
            'Paste an admin’s access key into the app’s config file',
            'Give it a role / managed identity with read-only access to that storage',
            'Make the storage public',
            'Share the root account password with the developers',
          ],
          answer: 1,
          explain: 'Roles and managed identities give temporary, scoped credentials, with no secrets to leak.',
        },
      },
      {
        id: 'cl5',
        title: 'Reading a permission policy',
        body: `
<p>Cloud permissions are written as JSON documents. Here's a typical structure (AWS-style; Azure role definitions use similar ideas):</p>
<pre>{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::reports/*"
}</pre>
<ul>
  <li><strong>Effect</strong>: Allow or Deny.</li>
  <li><strong>Action</strong>: which operations. A <code>*</code> means all of them, so look out for <code>"Action": "*"</code>.</li>
  <li><strong>Resource</strong>: which things the policy applies to.</li>
  <li><strong>Principal</strong> (on resource policies): <em>who</em> it applies to. <code>"Principal": "*"</code> means <strong>everyone, including the anonymous internet</strong>.</li>
</ul>
<p>Rules of evaluation: everything is denied by default, an Allow grants access, and an <strong>explicit Deny always wins</strong>.</p>`,
        exercise: {
          type: 'quiz',
          question: 'A user has one policy allowing s3:* on a bucket and another explicitly denying s3:DeleteObject on it. Can they delete objects?',
          options: ['Yes, the Allow covers it', 'No, an explicit Deny always wins', 'Only on weekends', 'Only if they’re an admin'],
          answer: 1,
          explain: 'An explicit Deny overrides any Allow.',
        },
        review: [
          { question: 'In a resource policy, what does "Principal": "*" mean?', options: ['Only admins', 'Everyone, including anonymous users', 'Only the account owner', 'Nobody'], answer: 1, explain: 'The wildcard principal means anyone at all.' },
        ],
      },
      {
        id: 'cl6',
        title: 'Cloud networking',
        body: `
<ul>
  <li><strong>Virtual network</strong> (AWS: VPC; Azure: VNet): your private network, defined by a CIDR block such as <code>10.0.0.0/16</code>.</li>
  <li><strong>Subnets</strong>: <em>public</em> subnets have a route to the internet; <em>private</em> subnets don't. Put databases in private subnets.</li>
  <li><strong>Security groups / NSGs</strong>: firewall rules attached to resources or subnets.</li>
  <li><strong>NAT</strong> lets private servers reach out (for updates) without being reachable from the internet.</li>
</ul>
<p>The most common mistake is allowing management ports (22 SSH, 3389 RDP) from <code>0.0.0.0/0</code>, meaning the entire internet.</p>`,
        exercise: {
          type: 'input',
          question: 'In a firewall rule, which CIDR means "any IPv4 address anywhere"?',
          accept: ['0.0.0.0/0'],
          explain: '0.0.0.0/0 matches every IPv4 address. Never use it for SSH or RDP.',
        },
      },
      {
        id: 'cl7',
        title: 'Logging, monitoring and infrastructure as code',
        body: `
<p><strong>Audit logs</strong> of management actions (who changed what, when, from where) are your most important cloud evidence. AWS calls this CloudTrail; Azure calls it the Activity Log. Turn them on, keep them, and protect them from deletion.</p>
<p><strong>Cost is a security signal.</strong> A sudden bill spike often means attackers are running crypto-mining on stolen credentials. Set budget alerts.</p>
<p><strong>Infrastructure as Code (IaC)</strong> (Terraform, CloudFormation, Bicep) defines cloud resources in text files. That makes configurations reviewable, repeatable and scannable for misconfigurations <em>before</em> deployment. It's also where your scripting skills pay off.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Your cloud bill jumps 40× overnight, driven by many new GPU virtual machines nobody requested. What’s the most likely explanation?',
          options: ['A billing glitch', 'Compromised credentials used for crypto-mining', 'Normal growth', 'A DNS failure'],
          answer: 1,
          explain: 'Unexpected GPU compute is a classic sign of credential theft. Investigate the audit logs right away.',
        },
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
