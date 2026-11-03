/* Track content: AWS (Cloud Practitioner CLF-C02 level, security-focused). */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.aws = {
    id: 'aws',
    title: 'AWS Essentials',
    lang: 'AWS CLF-C02',
    blurb: 'Amazon Web Services: core services, IAM, S3, EC2 networking, logging and billing, aimed at the Cloud Practitioner exam and security work.',
    lessons: [
      {
        id: 'aw1',
        title: 'The core services map',
        body: `
<pre>EC2         virtual machines (compute)
S3          object storage ("buckets" holding files)
EBS         disks attached to EC2
RDS         managed relational databases
Lambda      serverless functions (run code with no server to manage)
VPC         your virtual network
IAM         identities and permissions
Route 53    DNS
CloudTrail  audit log of API calls
CloudWatch  metrics, logs and alarms</pre>
<p>The exam tests whether you can match a need to the right service.</p>`,
        exercise: {
          type: 'quiz',
          question: 'You want to run a small piece of code whenever a file is uploaded, without managing any server. Which service?',
          options: ['EC2', 'Lambda', 'RDS', 'EBS'],
          answer: 1,
          explain: 'Lambda is serverless: you supply the code, and AWS runs it on demand.',
        },
        review: [
          { question: 'Which AWS service is object storage?', options: ['EBS', 'S3', 'RDS', 'Route 53'], answer: 1, explain: 'S3 = Simple Storage Service.' },
          { question: 'Which AWS service is DNS?', options: ['CloudFront', 'Route 53', 'VPC', 'IAM'], answer: 1, explain: 'Route 53 (DNS uses port 53).' },
        ],
      },
      {
        id: 'aw2',
        title: 'IAM in AWS',
        body: `
<ul>
  <li><strong>Root user</strong>: created with the account and has unlimited power. Turn on MFA, then lock it away and don't use it for daily work.</li>
  <li><strong>IAM users and groups</strong>: identities with long-term credentials. Increasingly replaced by <strong>IAM Identity Center</strong> (single sign-on).</li>
  <li><strong>IAM roles</strong>: assumed temporarily by people, services or EC2 instances. They hand out short-lived credentials.</li>
  <li><strong>Policies</strong>: JSON permission documents (Effect / Action / Resource).</li>
</ul>
<p>A useful "whoami" for the cloud: <code>aws sts get-caller-identity</code> shows which identity your CLI is using.</p>`,
        exercise: {
          type: 'quiz',
          question: 'An EC2 instance needs to write to an S3 bucket. What’s the AWS best practice?',
          options: ['Store an IAM user’s access keys on the instance', 'Attach an IAM role to the instance', 'Use the root user’s keys', 'Make the bucket public'],
          answer: 1,
          explain: 'Instance roles deliver temporary, automatically rotated credentials.',
        },
        review: [
          { question: 'What should you do with the AWS root user?', options: ['Use it daily', 'Enable MFA and use it only for rare account-level tasks', 'Share it with the team', 'Delete it'], answer: 1, explain: 'Protect it with MFA and keep it for the few tasks that require it.' },
        ],
      },
      {
        id: 'aw3',
        title: 'S3 security',
        body: `
<ul>
  <li>New buckets are <strong>private by default</strong>, and <strong>S3 Block Public Access</strong> is on by default for new buckets. Someone has to deliberately turn it off to make data public.</li>
  <li><strong>Bucket policies</strong> are resource policies. Watch for <code>"Principal": "*"</code>.</li>
  <li><strong>Encryption at rest</strong>: SSE-S3 (AWS-managed keys) or SSE-KMS (keys you control in KMS).</li>
  <li><strong>Versioning</strong> keeps old versions of objects, which helps recover from deletion or ransomware.</li>
  <li>To share a file temporarily, use a <strong>presigned URL</strong> that expires, not a public bucket.</li>
</ul>`,
        exercise: {
          type: 'quiz',
          question: 'A vendor needs to download one report this week. What’s the safest way to share it?',
          options: ['Make the bucket public', 'Add "Principal": "*" to the bucket policy', 'Send a presigned URL that expires', 'Email them the root credentials'],
          answer: 2,
          explain: 'A presigned URL grants time-limited access to one object without opening the bucket.',
        },
      },
      {
        id: 'aw4',
        title: 'EC2 networking: security groups and NACLs',
        body: `
<ul>
  <li><strong>Security groups</strong>: attached to instances. <strong>Stateful</strong> (return traffic is allowed automatically). <strong>Allow rules only.</strong></li>
  <li><strong>Network ACLs</strong>: attached to subnets. <strong>Stateless</strong> (you must allow return traffic yourself). Can have both <strong>allow and deny</strong> rules, evaluated in number order.</li>
</ul>
<p>For admin access, avoid opening port 22 or 3389 to the internet. Use <strong>AWS Systems Manager Session Manager</strong> instead, which needs no open inbound ports, or at least restrict access to a known IP.</p>`,
        exercise: {
          type: 'quiz',
          question: 'You need to explicitly BLOCK one malicious IP range at the subnet level. What do you use?',
          options: ['A security group', 'A network ACL', 'An IAM policy', 'Route 53'],
          answer: 1,
          explain: 'Security groups can only allow. NACLs support deny rules.',
        },
        review: [
          { question: 'Which is stateful?', options: ['Security group', 'Network ACL'], answer: 0, explain: 'Security groups are stateful; NACLs are stateless.' },
        ],
      },
      {
        id: 'aw5',
        title: 'Detection: CloudTrail, GuardDuty and friends',
        body: `
<pre>CloudTrail     who called which API, when, from where (audit trail)
CloudWatch     metrics, logs, alarms
GuardDuty      threat detection from logs (e.g. unusual API calls, mining)
AWS Config     records configuration history and checks rules
Security Hub   collects security findings in one place
Inspector      vulnerability scanning for EC2, containers, Lambda</pre>`,
        exercise: {
          type: 'quiz',
          question: 'Someone deleted a production bucket last night. Which service shows who did it?',
          options: ['CloudWatch metrics', 'CloudTrail', 'Inspector', 'Route 53'],
          answer: 1,
          explain: 'CloudTrail records API calls such as DeleteBucket, including the identity and source IP.',
        },
        review: [
          { question: 'Which AWS service detects threats such as unusual API activity or crypto-mining?', options: ['GuardDuty', 'Route 53', 'EBS', 'Lambda'], answer: 0, explain: 'GuardDuty is AWS’s managed threat detection service.' },
        ],
      },
      {
        id: 'aw6',
        title: 'Pricing, billing and support',
        body: `
<ul>
  <li><strong>On-Demand</strong>: pay by the second or hour, no commitment.</li>
  <li><strong>Savings Plans / Reserved Instances</strong>: commit for 1–3 years for a large discount.</li>
  <li><strong>Spot</strong>: spare capacity at deep discounts, but AWS can reclaim it at short notice. Good for interruptible work.</li>
  <li><strong>AWS Budgets</strong> and billing alarms warn you about spending, which also catches abuse.</li>
  <li><strong>Pricing Calculator</strong> estimates costs before you build.</li>
</ul>`,
        exercise: {
          type: 'quiz',
          question: 'A batch job can restart safely if it’s interrupted and needs to be as cheap as possible. Which pricing option?',
          options: ['On-Demand', 'Reserved Instances', 'Spot Instances', 'Dedicated Hosts'],
          answer: 2,
          explain: 'Spot is cheapest, and the job tolerates interruptions.',
        },
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
