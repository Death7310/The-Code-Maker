/* Track content: Microsoft Azure (AZ-900 level, security-focused). */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.azure = {
    id: 'azure',
    title: 'Azure Essentials',
    lang: 'Azure AZ-900',
    blurb: 'Microsoft Azure: resource hierarchy, Entra ID, RBAC, networking, storage, monitoring and governance, aimed at AZ-900 and security work.',
    lessons: [
      {
        id: 'az1',
        title: 'The Azure hierarchy',
        body: `
<pre>Management groups      organize many subscriptions
  └ Subscriptions      billing and access boundary
      └ Resource groups  containers for related resources
          └ Resources    VMs, storage accounts, databases…</pre>
<p>Permissions and policies set at a higher level are <strong>inherited</strong> by everything below it. That's powerful, and dangerous if you grant too much too high up.</p>`,
        exercise: {
          type: 'quiz',
          question: 'You grant someone access at the subscription level. What can they reach?',
          options: ['Only one resource group', 'Every resource group and resource in that subscription', 'Nothing until it’s approved', 'Only billing data'],
          answer: 1,
          explain: 'Access is inherited downward through the hierarchy.',
        },
      },
      {
        id: 'az2',
        title: 'Microsoft Entra ID',
        body: `
<p><strong>Microsoft Entra ID</strong> (formerly Azure Active Directory) is Azure's cloud identity service: users, groups, sign-in, MFA and single sign-on.</p>
<ul>
  <li><strong>Conditional Access</strong>: rules like "require MFA when signing in from outside the country" or "block legacy authentication".</li>
  <li><strong>Managed identities</strong>: identities for Azure resources, so code never has to store secrets.</li>
  <li><strong>Service principals</strong>: identities for applications. If they use client secrets, those secrets can leak.</li>
</ul>
<p>Note: Entra ID (cloud identity) is not the same as on-premises Active Directory Domain Services, though they're often synchronized.</p>`,
        exercise: {
          type: 'quiz',
          question: 'An Azure Function needs to read a Key Vault secret. What’s the best way to authenticate it?',
          options: ['Hard-code a password in the function', 'Use a managed identity', 'Use a shared admin account', 'Turn off authentication'],
          answer: 1,
          explain: 'Managed identities are handled by Azure, with no credentials stored in code.',
        },
        review: [
          { question: 'What is Microsoft Entra ID’s former name?', options: ['Azure AD', 'Azure DNS', 'Azure Sentinel', 'Intune'], answer: 0, explain: 'Azure Active Directory was renamed Microsoft Entra ID.' },
        ],
      },
      {
        id: 'az3',
        title: 'Azure RBAC',
        body: `
<p>Role-based access control assigns a <strong>role</strong> to a <strong>security principal</strong> at a <strong>scope</strong>.</p>
<ul>
  <li><strong>Owner</strong>: full access, <em>including granting access to others</em>.</li>
  <li><strong>Contributor</strong>: can create and manage resources, but <em>can't</em> grant access.</li>
  <li><strong>Reader</strong>: view only.</li>
</ul>
<p>Least privilege in Azure means the lowest role, at the narrowest scope (a resource group or a single resource rather than the whole subscription).</p>`,
        exercise: {
          type: 'quiz',
          question: 'A deployment pipeline only needs to deploy into one resource group. Which assignment follows least privilege?',
          options: ['Owner on the subscription', 'Contributor on the subscription', 'Contributor on that resource group', 'Owner on the management group'],
          answer: 2,
          explain: 'It can deploy resources (Contributor), only where needed (the resource group), and can’t grant access to others.',
        },
        review: [
          { question: 'Which built-in role can grant access to other people?', options: ['Reader', 'Contributor', 'Owner'], answer: 2, explain: 'Only Owner (or User Access Administrator) can manage role assignments.' },
        ],
      },
      {
        id: 'az4',
        title: 'Networking: VNets, NSGs and Bastion',
        body: `
<ul>
  <li><strong>VNet</strong>: your private network in Azure, split into subnets.</li>
  <li><strong>Network Security Group (NSG)</strong>: allow/deny rules with priorities. <strong>A lower number means higher priority</strong>, and the first match wins.</li>
  <li><strong>Azure Firewall</strong>: a managed, central firewall service.</li>
  <li><strong>Azure Bastion</strong>: RDP/SSH to VMs through the Azure portal over TLS, so VMs need no public IP and no open 3389/22.</li>
</ul>`,
        exercise: {
          type: 'quiz',
          question: 'An NSG has rule 100: Deny port 3389 from Any, and rule 200: Allow port 3389 from Any. What happens to RDP traffic?',
          options: ['Allowed', 'Denied', 'Randomly decided', 'Logged only'],
          answer: 1,
          explain: 'Priority 100 is evaluated first and matches, so the traffic is denied.',
        },
      },
      {
        id: 'az5',
        title: 'Storage accounts',
        body: `
<ul>
  <li>Storage accounts hold <strong>blobs</strong> (files/objects), file shares, queues and tables.</li>
  <li><strong>Access tiers</strong>: Hot → Cool → Cold → Archive. Each step is cheaper to store and slower or costlier to read.</li>
  <li><strong>SAS token</strong> (shared access signature): a URL that grants scoped, <em>time-limited</em> access, similar to an AWS presigned URL. Keep expiry times short.</li>
  <li>Disable anonymous blob access, and prefer Entra ID authentication over account keys.</li>
</ul>`,
        exercise: {
          type: 'quiz',
          question: 'Logs must be kept for 7 years, are rarely read, and storage cost matters most. Which tier?',
          options: ['Hot', 'Cool', 'Archive', 'Premium'],
          answer: 2,
          explain: 'Archive is the cheapest to store, at the cost of slow, paid retrieval.',
        },
      },
      {
        id: 'az6',
        title: 'Monitoring and security operations',
        body: `
<pre>Azure Monitor          metrics, logs, alerts across Azure
Activity Log           who did what to resources (management actions)
Microsoft Entra logs   sign-ins and directory changes
Defender for Cloud     security posture (secure score) and threat protection
Microsoft Sentinel     cloud SIEM: collect, detect, investigate, respond</pre>
<p>Sentinel and Defender are core tools for SOC analyst roles. They're the defensive counterpart to everything a tester does.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Which Azure service is a SIEM for correlating security events across many sources?',
          options: ['Azure Bastion', 'Microsoft Sentinel', 'Azure Policy', 'Blob Storage'],
          answer: 1,
          explain: 'Microsoft Sentinel is Azure’s cloud-native SIEM.',
        },
      },
      {
        id: 'az7',
        title: 'Governance and cost',
        body: `
<ul>
  <li><strong>Azure Policy</strong>: enforces rules, such as "only these regions" or "storage must deny public access".</li>
  <li><strong>Resource locks</strong>: <em>CanNotDelete</em> or <em>ReadOnly</em>, to prevent accidents even by admins.</li>
  <li><strong>Tags</strong>: labels like owner, cost center or environment.</li>
  <li><strong>Cost Management + budgets</strong>: track and alert on spending. <strong>Pricing calculator</strong>: estimate costs before you build.</li>
</ul>
<p>From the command line: <code>az group list</code> (Azure CLI) or <code>Get-AzResourceGroup</code> (Azure PowerShell). Your PowerShell lessons carry straight over.</p>`,
        exercise: {
          type: 'quiz',
          question: 'You must stop anyone from accidentally deleting a production database, admins included. What do you apply?',
          options: ['A tag', 'A CanNotDelete resource lock', 'A budget', 'A SAS token'],
          answer: 1,
          explain: 'A CanNotDelete lock blocks deletion until someone with rights deliberately removes the lock.',
        },
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
