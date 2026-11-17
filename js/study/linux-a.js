/* study/linux-a.js — in-depth notes: Linux lessons l1–l4. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    l1: {
      sections: [
        { h: 'The principle: one tree, and configuration is text', html: `
<p>Windows gives each drive its own letter (C:, D:). Linux has <strong>a single tree</strong> starting at <code>/</code>, and other disks are <em>mounted</em> into folders inside it. Almost all configuration lives in plain-text files, so you can read, search, back up and track changes to a system's settings with ordinary text tools.</p>` },
        { h: 'The Filesystem Hierarchy Standard: what lives where', html: `
<pre>/          root of the tree
/etc       system configuration (users, network, services)
/home      users' home directories (~ means yours)
/root      the root user's home (private)
/var       variable data: /var/log (logs), /var/www (web content), /var/lib (app data)
/tmp       temporary files, writable by everyone (often cleared at boot)
/usr       installed programs and libraries (/usr/bin, /usr/lib)
/bin /sbin essential commands (on modern systems, links into /usr)
/dev       devices exposed as files (disks, terminals)
/proc      a live view of processes and kernel state, generated on the fly
/opt       optional third-party software
/mnt /media  mount points for extra disks and removable media</pre>` },
        { h: 'Why this matters for security', html: `
<ul>
  <li>Defenders know where to look: logs in <code>/var/log</code>, accounts in <code>/etc/passwd</code>, scheduled jobs in <code>/etc/cron*</code>, services in <code>/etc/systemd</code>.</li>
  <li>Unusual files in world-writable places like <code>/tmp</code>, especially hidden ones (names starting with a dot), deserve a closer look. They're a common hiding spot for malicious programs.</li>
  <li>Because configuration is text, comparing it against a known-good copy reveals changes.</li>
</ul>` },
      ],
      misconceptions: ['Linux has drive letters like Windows. (One tree, with disks mounted into it.)', '/tmp is a safe place to keep files. (It\'s writable by everyone and often cleared.)'],
      examTraps: ['Logs → /var/log. Configuration → /etc. Users\' files → /home.'],
      onTheJob: 'Admins and incident responders move around this tree all day. Knowing where things live makes it possible to audit a server quickly or spot something that doesn\'t belong.',
      checks: [
        { q: 'A server is suspected of compromise. Where would you look FIRST for records of logins and sudo use on Ubuntu?', options: ['/etc/hostname', '/var/log/auth.log', '/usr/bin', '/home/user/Documents'], answer: 1, why: ['That only holds the machine name.', 'Authentication events, including SSH logins and sudo commands, are logged there.', 'That holds programs, not activity records.', 'User documents don\'t record logins.'] },
      ],
      sources: [
        { title: 'Filesystem Hierarchy Standard (Linux Foundation)', url: 'https://refspecs.linuxfoundation.org/fhs.shtml' },
        { title: 'The Linux man-pages project', url: 'https://www.kernel.org/doc/man-pages/' },
      ],
    },

    l2: {
      sections: [
        { h: 'The principle: small tools, precise targets', html: `
<p>Linux file commands do one job each and do it exactly. That precision is powerful, and unforgiving: <code>rm</code> has no recycle bin, and a wrong path can delete the wrong thing. Build the habit of checking <em>where you are</em> (<code>pwd</code>) and <em>what a pattern matches</em> before acting on it.</p>` },
        { h: 'find: searching by attributes, not just names', html: `
<pre>find /var/log -name "*.log"         by name (quote the pattern)
find . -type f -size +100M          files larger than 100 MB
find /home -mtime -1                changed in the last day
find / -perm -0002 -type f          world-writable files (a security audit classic)
find /etc -user root -newer ref.txt changed after a reference file</pre>
<p>Quoting the pattern matters: without quotes, the shell may expand <code>*.log</code> to matching files in the <em>current</em> folder before <code>find</code> ever sees it.</p>` },
        { h: 'Copy, move, delete, safely', html: `
<ul>
  <li><code>cp -r</code> copies folders; <code>cp -p</code> preserves permissions and timestamps, which matters for evidence and backups.</li>
  <li><code>mv</code> both moves and renames.</li>
  <li><code>rm -i</code> asks before each deletion. Test a pattern with <code>ls</code> first, then delete.</li>
  <li><code>rm -rf</code> on the wrong path is one of the classic disasters. Pause, and double-check the path.</li>
</ul>` },
      ],
      misconceptions: ['Deleted files go to a trash folder. (rm removes them immediately.)', 'Quotes around find patterns are optional. (Without them, the shell may expand the pattern first.)'],
      examTraps: ['find searches by name or attributes; grep searches inside files.'],
      onTheJob: 'Admins use find to clean up disk space and audit permissions. Incident responders use it to list files changed around the time of an incident.',
      checks: [
        { q: 'During an investigation, you need every file under /var/www changed in the last 2 days. Which command fits?', options: ['grep -r 2 /var/www', 'find /var/www -type f -mtime -2', 'ls /var/www', 'rm -rf /var/www'], answer: 1, why: ['grep searches file contents, not modification times.', 'find with -mtime -2 lists files modified within the last 2 days.', 'ls doesn\'t search recursively by time.', 'That destroys the evidence.'] },
      ],
      sources: [
        { title: 'GNU findutils manual', url: 'https://www.gnu.org/software/findutils/manual/html_mono/find.html' },
        { title: 'The Linux man-pages project', url: 'https://www.kernel.org/doc/man-pages/' },
      ],
    },

    l3: {
      sections: [
        { h: 'The principle: every process runs as some user', html: `
<p>Linux security starts with identity: every file is owned by a user, and every running program runs <em>as</em> a user. Services get their own low-privilege accounts (like <code>www-data</code> for the web server), so if one is compromised, the attacker gets only that account's limited access, not the whole system.</p>` },
        { h: 'The account files', html: `
<pre>/etc/passwd   name:x:UID:GID:comment:home:shell   (readable by everyone)
/etc/shadow   name:hash:last-change:...           (readable by root only)
/etc/group    group:x:GID:members</pre>
<ul>
  <li><strong>UID 0</strong> is root. Any account with UID 0 has full power, whatever its name, so an unexpected second UID-0 account is a serious red flag.</li>
  <li>Regular users usually start at UID 1000; system and service accounts use lower numbers.</li>
  <li>A shell of <code>/usr/sbin/nologin</code> means nobody can log in interactively as that account.</li>
  <li>Password hashes moved from <code>passwd</code> to <code>shadow</code> long ago, precisely so ordinary users can't copy and attack them.</li>
</ul>` },
        { h: 'Groups and least privilege', html: `
<p>Grant access through groups: add users to the group that owns a resource, rather than loosening permissions for everyone. Membership in powerful groups (<code>sudo</code>, <code>wheel</code>, <code>docker</code>, <code>adm</code>) effectively grants elevated rights, so review it regularly.</p>` },
      ],
      misconceptions: ['Only the account named "root" has full power. (Any UID 0 account does.)', 'Service accounts are harmless. (They hold the privileges of the service they run.)'],
      examTraps: ['Password hashes live in /etc/shadow, not /etc/passwd.'],
      onTheJob: 'Account audits check for extra UID-0 accounts, unexpected shells on service accounts, and who belongs to sudo/admin groups. These are standard steps in hardening and incident response.',
      checks: [
        { q: 'An audit of /etc/passwd shows: "sysupd:x:0:0::/tmp:/bin/bash". Why is this alarming?', options: ['It uses bash', 'It has UID 0, so it\'s a second all-powerful root account, with a home in /tmp', 'Its comment field is empty', 'Its GID is 0'], answer: 1, why: ['Many legitimate accounts use bash.', 'UID 0 means root-level power. An unknown UID-0 account living in /tmp is a classic sign of a backdoor.', 'Empty comments are common.', 'The GID alone isn\'t the main concern; UID 0 is.'] },
      ],
      sources: [
        { title: 'man 5 passwd / man 5 shadow (Linux man-pages)', url: 'https://www.kernel.org/doc/man-pages/' },
        { title: 'CIS Benchmarks (hardening guidance, free registration)', url: 'https://www.cisecurity.org/cis-benchmarks' },
      ],
    },

    l4: {
      sections: [
        { h: 'The principle: three questions, answered in order', html: `
<p>When a user touches a file, Linux asks: <strong>are you the owner?</strong> If yes, use the owner bits. If not, <strong>are you in the file's group?</strong> If yes, use the group bits. Otherwise, use the <strong>others</strong> bits. Only the <em>first</em> matching category counts; permissions are never added together across categories.</p>` },
        { h: 'Reading and writing modes', html: `
<pre>-rwxr-x---   type (- file, d dir) + owner rwx + group r-x + others ---
r = 4, w = 2, x = 1   →   rwx = 7, r-x = 5, --- = 0   →   750

chmod 640 file      owner rw, group r, others nothing
chmod u+x,g-w file  symbolic: add x for owner, remove w from group
chown alice:devs f  change owner and group (root only)</pre>
<p><strong>On directories the bits mean different things:</strong> r = list names, w = create/delete entries, x = enter and access items inside. A directory you can read but not enter (r without x) shows names but won't let you open anything.</p>` },
        { h: 'Special bits and defaults', html: `
<ul>
  <li><strong>setuid</strong> (s in the owner x position): the program runs with its <em>owner's</em> privileges. Needed for tools like <code>passwd</code>, and closely audited because a flawed setuid program can lead to privilege escalation.</li>
  <li><strong>setgid</strong> on a directory: new files inherit the directory's group, which is handy for shared team folders.</li>
  <li><strong>Sticky bit</strong> (t, as on /tmp): users can delete only their own files in a shared directory.</li>
  <li><strong>umask</strong> sets the default permissions for new files. A typical umask of 022 gives 644 for files and 755 for directories.</li>
</ul>` },
      ],
      misconceptions: ['Group members get the "best" of group and others permissions. (Only the first matching category applies.)', 'x doesn\'t matter for directories. (Without x you can\'t enter it.)'],
      examTraps: ['Convert both ways quickly: 754 ↔ rwxr-xr--.', 'World-writable (others w) files are a classic finding.'],
      onTheJob: 'Hardening reviews flag world-writable files and unexpected setuid programs. Admins fix "permission denied" tickets by reasoning through owner → group → others.',
      checks: [
        { q: 'File: owner alice, group devs, mode 604. Bob is in group devs. Can Bob read it?', options: ['Yes, because others have read', 'No: Bob matches the group category, and the group digit (0) grants nothing', 'Yes, because group and others combine', 'Only with sudo'], answer: 1, why: ['Others bits only apply to users who match neither owner nor group.', 'Linux uses the first matching category. Bob is in devs, so the group digit 0 applies, even though others have read.', 'Permissions don\'t combine across categories.', 'Root can read it, but the question is about Bob\'s own rights.'] },
        { q: 'Why is /tmp typically mode 1777 (with the sticky bit)?', options: ['To make it faster', 'Everyone can create files there, but users can delete only their own', 'To hide files', 'So only root can write'], answer: 1, why: ['Permissions don\'t affect speed.', 'The sticky bit stops users from deleting or renaming each other\'s files in a shared directory.', 'Permissions don\'t hide files.', '777 means everyone can write.'] },
      ],
      sources: [
        { title: 'man 1 chmod / man 2 umask (Linux man-pages)', url: 'https://www.kernel.org/doc/man-pages/' },
        { title: 'GNU Coreutils: file permissions', url: 'https://www.gnu.org/software/coreutils/manual/html_node/File-permissions.html' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
