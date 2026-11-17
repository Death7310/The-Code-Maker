/* study/linux-d.js — in-depth notes: Linux lessons l10–l12. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    l10: {
      sections: [
        { h: 'The principle: logs are the system\'s memory', html: `
<p>Logs record what happened, when, and often who did it. Without them, you can't troubleshoot reliably or investigate an incident. Good logging has three parts: <strong>capture</strong> the right events, <strong>keep</strong> them long enough, and <strong>protect</strong> them from tampering (ideally by sending copies to a central system).</p>` },
        { h: 'Where to look', html: `
<pre>/var/log/auth.log    logins, sudo use (Debian/Ubuntu; /var/log/secure on Red Hat)
/var/log/syslog      general system messages (Debian/Ubuntu; /var/log/messages on Red Hat)
/var/log/nginx/      web server access and error logs
journalctl           the systemd journal: -u SERVICE, --since, -p err
last / lastb         recent successful / failed logins</pre>` },
        { h: 'Reading logs efficiently', html: `
<pre>sudo grep "Failed password" /var/log/auth.log | wc -l
sudo grep "Accepted" /var/log/auth.log | tail
sudo journalctl -u ssh --since "1 hour ago"</pre>
<p>Combine filters with pipes, count, and sort. Look for <em>patterns</em>: many failures followed by a success, logins at odd hours, sudo use by unexpected accounts, or a gap where logs should be (which may mean they were cleared). Central logging (syslog forwarding to a SIEM) keeps a copy an attacker on the server can't erase.</p>` },
      ],
      misconceptions: ['Logs on the server itself are enough. (An intruder with root can alter them; forward copies off the machine.)'],
      examTraps: ['Ubuntu auth events → /var/log/auth.log; Red Hat → /var/log/secure.'],
      onTheJob: 'SOC analysts live in logs. Admins use them for troubleshooting, and log retention and protection appear in nearly every compliance framework.',
      checks: [
        { q: 'An investigator finds /var/log/auth.log is empty for a six-hour window when the server was running normally. What does that suggest?', options: ['Nothing; quiet periods are normal', 'Logs may have been deleted or tampered with, so check the centrally forwarded copy', 'The disk is full', 'SSH was uninstalled'], answer: 1, why: ['A running server normally logs some activity (cron, sessions).', 'Missing logs during normal operation are a red flag; central copies help confirm what happened.', 'A full disk would affect far more than one window.', 'Uninstalling SSH would leave its own log entries.'] },
      ],
      sources: [
        { title: 'NIST SP 800-92: Guide to Computer Security Log Management', url: 'https://csrc.nist.gov/publications/sp800' },
        { title: 'systemd journal documentation', url: 'https://systemd.io/' },
      ],
    },

    l11: {
      sections: [
        { h: 'The principle: most breaches use known, already-fixed flaws', html: `
<p>Software vulnerabilities are discovered constantly. Vendors release fixes, but systems stay vulnerable until someone installs them. Many real-world breaches exploit flaws that already had patches available, which makes patching one of the highest-value security habits there is.</p>` },
        { h: 'Package managers', html: `
<pre>Debian/Ubuntu   sudo apt update           refresh the list of available versions
                sudo apt upgrade          install updates
                sudo apt install PKG
Red Hat/Fedora  sudo dnf upgrade
                sudo dnf install PKG</pre>
<ul>
  <li>Packages come from <strong>repositories</strong> and are cryptographically signed, so the system can reject tampered packages. Be careful about adding third-party repositories.</li>
  <li><strong>Unattended upgrades</strong> can install security updates automatically.</li>
  <li>Kernel updates usually need a reboot to take effect.</li>
</ul>` },
        { h: 'Patch management in practice', html: `
<p>Inventory what you run, track which updates apply, prioritize by severity and exposure (an internet-facing server first), test where possible, schedule through change management, then confirm the update actually installed.</p>` },
      ],
      misconceptions: ['apt update installs updates. (It only refreshes the list; apt upgrade installs.)', 'If it works, don\'t patch it. (Unpatched known flaws are a leading cause of breaches.)'],
      examTraps: ['update = refresh the index; upgrade = install.'],
      onTheJob: 'Admins run patch cycles; vulnerability management teams track what\'s missing and chase the riskiest gaps first.',
      checks: [
        { q: 'A server reports it\'s fully up to date, but a scanner shows an old kernel version still running. Most likely reason?', options: ['The scanner is wrong', 'The new kernel was installed but the server hasn\'t been rebooted', 'apt update wasn\'t run', 'The disk is full'], answer: 1, why: ['Possible, but this is a very common real situation.', 'The running kernel changes only after a reboot.', 'The packages did install, so the index was refreshed.', 'Unrelated.'] },
      ],
      sources: [
        { title: 'CISA Known Exploited Vulnerabilities catalog', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' },
        { title: 'NIST SP 800-40: Guide to Enterprise Patch Management Planning', url: 'https://csrc.nist.gov/publications/sp800' },
      ],
    },

    l12: {
      sections: [
        { h: 'The principle: reduce what can be attacked, and make the rest hard', html: `
<p>Hardening means shrinking the <strong>attack surface</strong> (fewer services, accounts and open ports) and strengthening what remains (patches, strong authentication, least privilege, logging). No single setting makes a server secure; layers do.</p>` },
        { h: 'A practical baseline', html: `
<ol>
  <li><strong>Patch</strong> regularly, with automatic security updates where appropriate.</li>
  <li><strong>Remove</strong> unused packages, services and accounts.</li>
  <li><strong>SSH:</strong> keys instead of passwords (<code>PasswordAuthentication no</code>), <code>PermitRootLogin no</code>, and access limited to admin networks.</li>
  <li><strong>Firewall:</strong> allow only the ports the server's job requires.</li>
  <li><strong>Least privilege:</strong> tight file permissions and narrow sudo rules.</li>
  <li><strong>Logging:</strong> forward logs centrally and alert on important events.</li>
  <li><strong>Verify:</strong> compare against a published benchmark (such as the CIS Benchmarks) and re-check after changes.</li>
</ol>` },
      ],
      misconceptions: ['Changing the SSH port is hardening. (It reduces noise but doesn\'t add real protection.)', 'Hardening is a one-time task. (Drift happens; re-check regularly.)'],
      examTraps: ['Password-guessing risk → disable password auth and use keys.'],
      onTheJob: 'Admins build hardened images; auditors check servers against benchmarks; security teams treat configuration drift as a recurring risk.',
      checks: [
        { q: 'Which single change most reduces the risk of SSH password guessing on an internet-facing server?', options: ['Move SSH to port 2222', 'Disable password authentication and require keys', 'Rename the server', 'Disable logging'], answer: 1, why: ['Scanners find the new port quickly.', 'With no passwords accepted, there is nothing to guess.', 'Irrelevant.', 'That removes visibility and makes things worse.'] },
      ],
      sources: [
        { title: 'CIS Benchmarks (hardening guidance, free registration)', url: 'https://www.cisecurity.org/cis-benchmarks' },
        { title: 'OpenSSH manual pages', url: 'https://www.openssh.com/manual.html' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
