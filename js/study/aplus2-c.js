/* study/aplus2-c.js — in-depth notes: A+ Core 2 lessons c7–c9. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    c7: {
      sections: [
        { h: 'The principle: in Linux, everything is a file and every file has an owner', html: `
<p>Linux exposes almost everything (devices, settings, process information) as files in one tree, and controls access with a simple model: each file has an <strong>owner</strong>, a <strong>group</strong> and permission bits for owner, group and others. Learn the tree and the permission model, and most of Linux makes sense.</p>` },
        { h: 'Commands A+ expects, grouped by purpose', html: `
<pre>Navigate     pwd · ls -l · cd
Files        cp · mv · rm · mkdir · touch · cat · less · nano/vi
Search       grep (inside files) · find (by name/attributes)
Permissions  chmod (modes) · chown (owner) · sudo (run as root) · su (switch user)
Packages     apt (Debian/Ubuntu) · dnf/yum (Red Hat/Fedora)
System       ps · top · kill · df -h (disk) · free -h (memory) · systemctl
Network      ip a · ping · dig/nslookup · ss
Help         man COMMAND · COMMAND --help</pre>
<p>Practice every one of these in the Linux track's sandbox, where they behave like the real thing.</p>` },
        { h: 'sudo, root and least privilege', html: `
<p><strong>root</strong> can do anything. Rather than logging in as root, admins run single commands with <code>sudo</code>, which checks the sudoers policy and logs each use. That gives accountability (who ran what, and when) and limits the damage of mistakes.</p>` },
      ],
      misconceptions: ['sudo and su are the same. (sudo runs one command with elevated rights and logs it; su switches your whole session to another user.)', 'Linux needs no security attention. (Permissions, patching and sudo policy all matter.)'],
      examTraps: ['"Install software on Ubuntu" → apt; on Red Hat → dnf/yum.', '"Permission denied running a script" → missing execute bit (chmod +x) or needs sudo.'],
      onTheJob: 'Most servers, cloud machines and security tools run Linux. Daily work means reading logs with grep, checking processes, fixing permissions and installing patches.',
      checks: [
        { q: 'You need to install a web server package on an Ubuntu machine. Which command fits?', options: ['dnf install nginx', 'sudo apt install nginx', 'chmod install nginx', 'systemctl install nginx'], answer: 1, why: ['dnf is for Red Hat family distributions.', 'Ubuntu uses apt, and installing system packages needs root rights via sudo.', 'chmod changes permissions.', 'systemctl manages services; it doesn\'t install packages.'] },
      ],
      sources: [
        { title: 'The Linux man-pages project', url: 'https://www.kernel.org/doc/man-pages/' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    c8: {
      sections: [
        { h: 'The principle: editions differ in management and security features', html: `
<p>Windows Home and Pro look alike, but Pro adds the features businesses need to <em>manage and protect</em> machines centrally. Many exam scenarios hinge on a feature simply not existing in Home.</p>` },
        { h: 'Home vs Pro (and above)', html: `
<pre>Feature                        Home    Pro/Enterprise
Join an Active Directory domain  no      yes
Group Policy editor (gpedit)     no      yes
BitLocker management             no*     yes   (*Home may have limited "Device Encryption")
Remote Desktop host              no      yes   (Home can connect out, not accept)
Hyper-V                          no      yes</pre>` },
        { h: 'The built-in tools and what they answer', html: `
<pre>Task Manager      what is using CPU, memory, disk? what starts at login?
Event Viewer      what happened, and when? (System, Application, Security logs)
Device Manager    which hardware or driver is failing?
Disk Management   partitions, volumes, drive letters
Services          start, stop and set startup type for background services
Task Scheduler    scheduled jobs (also a common place malware hides to keep running)
System Config     boot options, Safe Mode
Registry Editor   low-level settings (back up before editing)
Resource / Performance Monitor   detailed resource use over time</pre>` },
      ],
      misconceptions: ['Pro is just "Home with extras nobody needs". (Domain join, Group Policy and BitLocker are essential in businesses.)'],
      examTraps: ['"Can\'t join the company domain" or "can\'t find gpedit.msc" → the machine is running Home.', '"Which program starts at login?" → Task Manager\'s Startup tab.'],
      onTheJob: 'Technicians check editions during deployments. Investigators use Event Viewer\'s Security log, Task Scheduler and Services to find unusual activity and anything set up to keep running.',
      checks: [
        { q: 'A new laptop can\'t join the company domain, and gpedit.msc doesn\'t open. Most likely reason?', options: ['The network cable is unplugged', 'The laptop runs Windows Home, which lacks domain join and Group Policy', 'BitLocker is enabled', 'The CMOS battery is dead'], answer: 1, why: ['A network fault wouldn\'t make gpedit.msc disappear.', 'Both missing features point to the Home edition.', 'BitLocker doesn\'t block either feature.', 'Unrelated to Windows features.'] },
      ],
      sources: [
        { title: 'Microsoft Learn: Windows documentation', url: 'https://learn.microsoft.com/en-us/windows/' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    c9: {
      sections: [
        { h: 'The principle: undo the most recent change first', html: `
<p>Most Windows problems appear right after something changed: an update, a new driver, a new program. The cheapest, most likely fix is to reverse that change, before considering anything drastic like a reinstall.</p>` },
        { h: 'Escalating recovery options, least to most disruptive', html: `
<ol>
  <li>Restart, and check Event Viewer for errors around the time of the problem.</li>
  <li>Roll back the recent driver (Device Manager) or uninstall the recent update or app.</li>
  <li><strong>Safe Mode</strong> loads minimal drivers and services. If the problem disappears there, a driver or startup program is the likely cause.</li>
  <li><code>sfc /scannow</code> and DISM repair system files.</li>
  <li><strong>System Restore</strong> rolls back system files, drivers and settings, but not personal files.</li>
  <li><strong>Startup Repair</strong> in the recovery environment fixes boot problems.</li>
  <li><strong>Reset this PC</strong> reinstalls Windows, optionally keeping personal files. This is the last resort.</li>
</ol>` },
        { h: 'Reading the symptoms', html: `
<ul>
  <li><strong>Blue screen (stop error):</strong> note the stop code. Drivers, RAM and disk errors are the common causes.</li>
  <li><strong>Slow after login:</strong> check startup programs and disk usage in Task Manager.</li>
  <li><strong>An app crashes:</strong> repair or reinstall it, check for updates, and read its errors in Event Viewer.</li>
</ul>` },
      ],
      misconceptions: ['Reinstalling Windows is the safe first fix. (It\'s the most disruptive; reverse recent changes first.)', 'System Restore deletes documents. (It doesn\'t touch personal files.)'],
      examTraps: ['"Started after a new driver" → roll back the driver.', '"Works in Safe Mode" → a driver or startup item is the cause.'],
      onTheJob: 'Help desk work follows this escalation ladder every day. Change records help: knowing exactly what changed and when shortens troubleshooting dramatically.',
      checks: [
        { q: 'A PC boots normally into Safe Mode, but crashes during a normal boot. What does that suggest?', options: ['Failed hardware that must be replaced', 'A driver or startup program that only loads in a normal boot', 'A corrupted user password', 'A DNS problem'], answer: 1, why: ['Hardware faults usually affect Safe Mode too.', 'Safe Mode skips most drivers and startup items, so one of those is the likely cause.', 'Passwords don\'t affect the boot process like this.', 'Unrelated.'] },
      ],
      sources: [
        { title: 'Microsoft Learn: Windows recovery options', url: 'https://learn.microsoft.com/en-us/windows/' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
