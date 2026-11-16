/* study/linux-c.js — in-depth notes: Linux lessons l8–l9. Original material. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    l8: {
      sections: [
        { h: 'The principle: services are managed units with a defined lifecycle', html: `
<p>On most modern Linux systems, <strong>systemd</strong> starts and supervises long-running services (web servers, SSH, databases). Each service is described by a <em>unit file</em> that says what to run, as which user, and when. Managing services consistently is a core admin skill, and every running service is attack surface.</p>` },
        { h: 'Everyday commands', html: `
<pre>systemctl status nginx          is it running? recent log lines
sudo systemctl start|stop|restart nginx
sudo systemctl enable nginx     start automatically at boot
sudo systemctl disable nginx    don't start at boot
systemctl list-units --type=service --state=running
journalctl -u nginx --since today   that service's logs</pre>
<p><strong>Running</strong> (right now) and <strong>enabled</strong> (at boot) are separate. A service can be stopped but still come back after a reboot if it's enabled.</p>` },
        { h: 'Hardening with services', html: `
<ul>
  <li>List what's running and disable anything the server doesn't need.</li>
  <li>Unit files can restrict a service: run it as a dedicated user, limit its file access, and restart it on failure.</li>
  <li>Review unexpected units and timers during audits. Services are a common place for unauthorized software to keep itself running.</li>
</ul>` },
      ],
      misconceptions: ['Stopping a service removes it permanently. (If enabled, it starts again at boot; disable it too.)'],
      examTraps: ['start/stop = now; enable/disable = at boot.'],
      onTheJob: 'Admins manage services daily. Hardening checklists start by reducing running services, and incident responders list units and timers to spot anything unfamiliar.',
      checks: [
        { q: 'You stop an unneeded FTP service, but it\'s running again after the next reboot. Why?', options: ['The stop command failed', 'It\'s still enabled at boot; you also need to disable it', 'FTP restarts every hour', 'The firewall restarted it'], answer: 1, why: ['It did stop; the reboot started it again.', 'Stop affects the current boot only. Disable removes it from startup.', 'No such default behavior.', 'Firewalls don\'t start services.'] },
      ],
      sources: [
        { title: 'systemd documentation (freedesktop.org)', url: 'https://systemd.io/' },
        { title: 'CIS Benchmarks (hardening guidance, free registration)', url: 'https://www.cisecurity.org/cis-benchmarks' },
      ],
    },

    l9: {
      sections: [
        { h: 'The principle: verify each layer from the machine itself', html: `
<p>When a Linux server "can't connect", check from the inside out: does it have an address, a route out, working name resolution, and is the service actually listening? Each command answers one of those questions.</p>` },
        { h: 'The toolkit', html: `
<pre>ip a                 addresses on each interface (the old tool: ifconfig)
ip route             routing table; "default via" is the gateway
ping -c 3 HOST       reachability (ICMP may be blocked)
dig NAME / nslookup  DNS answers, straight from the resolver
cat /etc/resolv.conf which DNS servers are used
cat /etc/hosts       local overrides, checked before DNS
ss -tuln             listening TCP/UDP sockets (-p shows the process, with sudo)
curl -I URL          does the web service answer? (headers only)</pre>` },
        { h: 'Reading ss output', html: `
<p>A service listening on <code>127.0.0.1:3306</code> accepts connections only from the same machine. On <code>0.0.0.0:3306</code> it listens on every interface, so other machines can reach it unless a firewall blocks them. Databases and admin panels bound to 0.0.0.0 without a reason are a common audit finding.</p>` },
      ],
      misconceptions: ['If ping fails, the host is down. (ICMP is often filtered.)', 'A service is only reachable if it\'s on the internet. (0.0.0.0 exposes it to every network the server is on.)'],
      examTraps: ['Gateway → ip route ("default via"). Listening ports → ss -tuln.'],
      onTheJob: 'Admins troubleshoot connectivity with these commands. Auditors use ss to list exposed services and compare them with what the server is supposed to offer.',
      checks: [
        { q: 'ss -tuln on a web server shows 0.0.0.0:5432 (PostgreSQL). Only the web app on the same server uses the database. What\'s the best fix?', options: ['Nothing; it\'s fine', 'Bind the database to 127.0.0.1 (and firewall the port) so only local connections work', 'Change the port to 5433', 'Restart the database'], answer: 1, why: ['It\'s reachable from other machines with no need for it.', 'Local-only binding removes network exposure entirely; the firewall adds a second layer.', 'Obscurity only.', 'It comes back with the same binding.'] },
      ],
      sources: [
        { title: 'man 8 ip / man 8 ss (Linux man-pages)', url: 'https://www.kernel.org/doc/man-pages/' },
      ],
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
