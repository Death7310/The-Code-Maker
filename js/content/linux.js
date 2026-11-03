/* Track content: Linux hands-on (Linux+ / RHCSA foundations), all in the sandbox. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  CM.tracks.linux = {
    id: 'linux',
    title: 'Linux Hands-On',
    lang: 'Linux',
    blurb: 'Live practice on a simulated Linux server: the filesystem, users, permissions, sudo, scripts, processes, services, networking and logs. Most servers, cloud machines and security tools run on Linux.',
    lessons: [
      {
        id: 'l1',
        title: 'A tour of the Linux filesystem',
        body: `
<p>Linux has a single tree that starts at <code>/</code> (the root). Key directories:</p>
<pre>/etc        system configuration (text files!)
/home       users' home folders (~ is yours)
/root       the root user's home (private)
/var/log    log files
/tmp        temporary files, writable by everyone
/usr/bin    most programs
/var/www    web server files (on many systems)</pre>
<p>Most Linux configuration is plain text, so <code>cat</code>, <code>grep</code> and an editor are enough to inspect a system. That's a big part of why Linux skills transfer so well to security work.</p>`,
        exercise: {
          type: 'shell',
          task: 'Print this machine’s hostname by reading the file in /etc that stores it.',
          expect: 'sandbox\n',
          hint: 'cat /etc/hostname',
        },
        review: [
          { question: 'Where do Linux log files usually live?', options: ['/etc', '/var/log', '/usr/bin', '/home'], answer: 1, explain: '/var/log.' },
          { question: 'Where does most system configuration live?', options: ['/etc', '/tmp', '/boot', '/dev'], answer: 0, explain: '/etc holds configuration files.' },
        ],
      },
      {
        id: 'l2',
        title: 'Finding, copying and moving files',
        body: `
<pre>find . -name "*.log"          find by name (* matches anything)
find /var/log -type f         only files (-type d for directories)
cp notes.txt /tmp/            copy
mv old.txt new.txt            move / rename
rm file.txt                   delete (no recycle bin!)
rm -r folder                  delete a folder and everything in it</pre>
<p>Put quotes around patterns like <code>"*.sh"</code> so the shell passes them to <code>find</code> unchanged.</p>`,
        exercise: {
          type: 'shell',
          task: 'From your home folder, find every file whose name ends in .sh.',
          expect: ['./scripts/check.sh\n./scripts/greet.sh\n./scripts/hosts.sh\n', '/home/student/scripts/check.sh\n/home/student/scripts/greet.sh\n/home/student/scripts/hosts.sh\n'],
          hint: 'find . -name "*.sh"',
        },
      },
      {
        id: 'l3',
        title: 'Users and groups',
        body: `
<p>Every user is a line in <code>/etc/passwd</code>, with fields separated by colons:</p>
<pre>student:x:1000:1000:Student:/home/student:/bin/bash
  name   pw uid  gid  comment   home         shell</pre>
<p>The password hashes live separately, in <code>/etc/shadow</code>, which only root can read. Accounts like <code>www-data</code> have the shell <code>/usr/sbin/nologin</code>: they run services but nobody can log in as them.</p>
<pre>whoami     id     groups</pre>`,
        exercise: {
          type: 'shell',
          task: 'Using grep and cut on /etc/passwd, print ONLY student’s home directory (field 6).',
          expect: '/home/student\n',
          hint: 'grep student /etc/passwd | cut -d: -f6',
        },
        review: [
          { question: 'Which file holds password hashes on Linux?', options: ['/etc/passwd', '/etc/shadow', '/etc/hosts', '/etc/group'], answer: 1, explain: '/etc/shadow is readable only by root.' },
          { question: 'What does a shell of /usr/sbin/nologin mean?', options: ['The account is root', 'Nobody can log in interactively as that account', 'The account has no password', 'The account is locked forever'], answer: 1, explain: 'Service accounts run programs but can’t open a shell.' },
        ],
      },
      {
        id: 'l4',
        title: 'Permissions: rwx and chmod',
        body: `
<p><code>ls -l</code> shows permissions as three groups of <code>rwx</code>: for the <strong>owner</strong>, the <strong>group</strong> and <strong>others</strong>.</p>
<pre>-rw-r-----  root  shadow  /etc/shadow
 └┬┘└┬┘└┬┘
 owner group others</pre>
<p>In octal, r = 4, w = 2, x = 1, added up per group:</p>
<pre>chmod 600 file    rw------- (private file)
chmod 644 file    rw-r--r-- (normal file)
chmod 755 file    rwxr-xr-x (program or script)
chmod u+x file    add execute for the owner</pre>
<p><code>stat -c %a FILE</code> prints the octal mode. World-writable files (<code>777</code>) are a classic security finding.</p>`,
        exercise: {
          type: 'shell',
          task: 'Make notes.txt readable and writable by its owner ONLY, then print its octal mode with stat.',
          expect: '600\n',
          hint: 'chmod 600 notes.txt && stat -c %a notes.txt',
        },
        review: [
          { type: 'input', question: 'What is rwxr-x--- in octal?', accept: ['750'], explain: 'rwx = 7, r-x = 5, --- = 0.' },
          { type: 'input', question: 'What is rw-r--r-- in octal?', accept: ['644'], explain: '6, 4, 4.' },
        ],
      },
      {
        id: 'l5',
        title: 'Root and sudo',
        body: `
<p><strong>root</strong> is the all-powerful administrator. Instead of logging in as root, admins run single commands with <code>sudo</code>. Each use is checked against the sudoers rules and logged to <code>/var/log/auth.log</code>.</p>
<pre>cat /etc/shadow         Permission denied
sudo cat /etc/shadow    works (you're in the sudo group)</pre>
<p>Least privilege again: work as a normal user and elevate only for the commands that need it.</p>`,
        exercise: {
          type: 'shell',
          task: 'Count the lines in /etc/shadow. You’ll need elevated rights.',
          expect: '5\n',
          hint: 'sudo wc -l /etc/shadow',
        },
        review: [
          { question: 'Why use sudo instead of logging in as root?', options: ['It’s faster', 'Each privileged command is deliberate and logged', 'Root can’t run commands', 'sudo disables logging'], answer: 1, explain: 'Elevating per command limits mistakes and creates an audit trail.' },
        ],
      },
      {
        id: 'l6',
        title: 'Running scripts',
        body: `
<p>A script is a text file of commands. The first line, the <strong>shebang</strong> (<code>#!/bin/bash</code>), says which interpreter runs it.</p>
<pre>bash scripts/check.sh        run it with bash (needs read permission)
chmod +x scripts/check.sh    make it executable
./scripts/check.sh           run it directly (needs execute permission)
./scripts/greet.sh Ash       $1 inside the script becomes "Ash"</pre>
<p>Read <code>scripts/hosts.sh</code>: it loops over <code>$(grep -v "#" ~/scope.txt)</code>, using the output of one command as the input to a loop. You'll see this pattern in real recon and admin scripts.</p>`,
        exercise: {
          type: 'shell',
          task: 'Make scripts/check.sh executable and run it directly with ./',
          expect: 'Health check\nstudent\nDone\n',
          hint: 'chmod +x scripts/check.sh && ./scripts/check.sh',
        },
        review: [
          { question: 'Running ./script.sh gives "Permission denied". What’s the most likely fix?', options: ['sudo rm script.sh', 'chmod +x script.sh', 'Rename it to .exe', 'Reboot'], answer: 1, explain: 'It needs the execute bit to run directly.' },
          { question: 'In a Bash script, what does $1 hold?', options: ['The first argument', 'The exit code', 'The user ID', 'Line 1 of the script'], answer: 0, explain: '$1 is the first argument passed to the script.' },
        ],
      },
      {
        id: 'l7',
        title: 'Processes',
        body: `
<pre>ps            your processes
ps aux        everyone's processes, with %CPU and %MEM
top           busiest processes first
pgrep NAME    PIDs matching a name
kill PID      ask a process to stop (kill -9 forces it)</pre>
<p>You can only kill your own processes, unless you use sudo. When a server is slow, or might be compromised, <code>ps aux</code> and <code>top</code> are the first places to look.</p>`,
        exercise: {
          type: 'shell',
          task: 'Print only the PID of the process named updaterd.',
          expect: '4242\n',
          hint: 'pgrep updaterd',
        },
        review: [
          { question: 'Which command lists processes for ALL users?', options: ['ps', 'ps aux', 'pwd', 'id'], answer: 1, explain: 'ps aux shows every user’s processes.' },
        ],
      },
      {
        id: 'l8',
        title: 'Services with systemctl',
        body: `
<p>Long-running services (SSH, web servers, cron) are managed by <strong>systemd</strong>:</p>
<pre>systemctl status nginx
sudo systemctl stop nginx
sudo systemctl start nginx
sudo systemctl enable nginx     start at boot
sudo systemctl disable nginx    don't start at boot</pre>
<p>Hardening principle: <strong>disable services you don't need</strong>. Every running service is attack surface.</p>`,
        exercise: {
          type: 'shell',
          task: 'Check the status of the nginx service.',
          expect: '● nginx.service\n     Active: active (running)\n',
          hint: 'systemctl status nginx',
        },
      },
      {
        id: 'l9',
        title: 'Networking from the command line',
        body: `
<pre>ip a              addresses on each interface
ip route          routing table (look for "default via")
ss -tuln          listening TCP/UDP ports
ping -c 2 HOST    reachability
cat /etc/hosts    local name overrides
cat /etc/resolv.conf   which DNS server is used</pre>
<p>Notice <code>127.0.0.1:3306</code> in <code>ss -tuln</code>: the database listens only on loopback, so other machines can't reach it. Services bound to <code>0.0.0.0</code> listen on every interface.</p>`,
        exercise: {
          type: 'shell',
          task: 'Print ONLY the default gateway’s IP address (hint: ip route, then grep and cut).',
          expect: '10.20.0.1\n',
          hint: 'ip route | grep default | cut -d " " -f 3',
        },
        review: [
          { question: 'A service listening on 127.0.0.1:3306 can be reached from…', options: ['Anywhere on the internet', 'Only the same machine', 'Only the local subnet', 'Nowhere'], answer: 1, explain: 'Loopback addresses are reachable only locally.' },
        ],
      },
      {
        id: 'l10',
        title: 'Reading logs',
        body: `
<p><code>/var/log/auth.log</code> (Debian/Ubuntu) records logins and every sudo command. It's protected, so you need sudo to read it.</p>
<pre>sudo grep sudo /var/log/auth.log
sudo grep "Failed password" /var/log/auth.log
sudo grep "NOT in sudoers" /var/log/auth.log</pre>
<p>On systemd machines, <code>journalctl</code> is the other main log tool (not simulated here).</p>`,
        exercise: {
          type: 'shell',
          task: 'Count how many lines in /var/log/auth.log mention sudo.',
          expect: '3\n',
          hint: 'sudo grep -c sudo /var/log/auth.log',
        },
      },
      {
        id: 'l11',
        title: 'Packages and updates',
        body: `
<pre>Debian/Ubuntu:   sudo apt update && sudo apt upgrade
                 sudo apt install nginx
Red Hat/Fedora:  sudo dnf upgrade
                 sudo dnf install nginx</pre>
<p>Patching is one of the most effective security controls there is. Many real breaches exploit vulnerabilities that already had patches available. (Package installs aren't simulated in the sandbox.)</p>`,
        exercise: {
          type: 'quiz',
          question: 'On Ubuntu, which command refreshes the list of available package versions?',
          options: ['sudo apt update', 'sudo dnf refresh', 'chmod +x apt', 'systemctl update'],
          answer: 0,
          explain: 'apt update refreshes the package index; apt upgrade installs the newer versions.',
        },
      },
      {
        id: 'l12',
        title: 'Basic server hardening',
        body: `
<p>Read the SSH server settings: <code>cat /etc/ssh/sshd_config</code>.</p>
<ul>
  <li><code>PermitRootLogin no</code>: good, because root can't log in over SSH.</li>
  <li><code>PasswordAuthentication yes</code>: risky on an internet-facing server. Use SSH keys and set it to <code>no</code>.</li>
</ul>
<p>A short hardening checklist: patch, remove unused services and accounts, use keys not passwords, apply least privilege with file permissions, firewall everything that isn't needed, and send logs somewhere central.</p>`,
        exercise: {
          type: 'quiz',
          question: 'Which sshd_config change most reduces the risk of password-guessing attacks?',
          options: ['Port 22 → 2222', 'PasswordAuthentication no (use keys)', 'PermitRootLogin yes', 'Delete the log files'],
          answer: 1,
          explain: 'With password logins disabled, there’s nothing to guess. Changing the port only hides the service.',
        },
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
