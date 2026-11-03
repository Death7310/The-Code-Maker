/* Track content: bash. Registered into CM.tracks; order is set in js/curriculum.js. */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.tracks = CM.tracks || {};
  const track = {
  id: 'bash',
  title: 'Bash',
  lang: 'Bash',
  blurb: 'The Linux command line: moving around, reading files and chaining small tools together to process data.',
  lessons: [
    {
      id: 'b1',
      title: 'Moving around: pwd, ls, cd',
      body: `
<p>The shell always has a <strong>current working directory</strong>. <code>pwd</code> prints it, <code>ls</code> lists what's in it and <code>cd</code> moves you somewhere else.</p>
<pre>pwd          # where am I?
ls           # what is here?
ls -l        # long format (permissions, size)
cd logs      # move into logs/
cd ..        # go up one level
cd ~         # go home</pre>
<p>The sandbox on the right is simulated, so you can't break anything. Type <code>help</code> to see every command it supports.</p>`,
      exercise: {
        type: 'shell',
        task: 'Move into the logs directory, then print your working directory. (Hint: chain two commands with &&.)',
        expect: '/home/student/logs\n',
      },
    },
    {
      id: 'b2',
      title: 'Reading files: cat, head, tail',
      body: `
<p><code>cat</code> prints a whole file. <code>head</code> and <code>tail</code> print the start or end, which helps with large logs.</p>
<pre>cat notes.txt
head -n 2 inventory.csv   # first 2 lines
tail -n 1 inventory.csv   # last line</pre>`,
      exercise: {
        type: 'shell',
        task: 'Print only the header row (the first line) of inventory.csv.',
        expect: 'hostname,ip,os,owner\n',
      },
    },
    {
      id: 'b3',
      title: 'Searching with grep',
      body: `
<p><code>grep PATTERN FILE</code> prints the lines that match. These flags come up a lot:</p>
<pre>grep Failed logs/auth.log      # matching lines
grep -c Failed logs/auth.log   # count matches
grep -i failed logs/auth.log   # ignore case
grep -v root logs/auth.log     # lines that DON'T match
grep -n Accepted logs/auth.log # show line numbers</pre>
<p>Defenders and testers both spend much of their time searching logs like this.</p>`,
      exercise: {
        type: 'shell',
        task: 'Count how many lines in logs/auth.log contain "Accepted".',
        expect: '3\n',
      },
    },
    {
      id: 'b4',
      title: 'Pipes: chaining tools together',
      body: `
<p>The pipe <code>|</code> sends one command's output into the next command's input. This is the core idea of Unix: small tools, chained together.</p>
<pre>grep Failed logs/auth.log | wc -l
grep Failed logs/auth.log | cut -d " " -f 9 | sort | uniq -c</pre>
<p>The second line pulls out the 9th space-separated field (the username), sorts the names and counts the repeats. In short: <em>which accounts had failed logins, and how many times?</em></p>`,
      exercise: {
        type: 'shell',
        task: 'Using a pipe, count the failed-login lines in logs/auth.log that are NOT for root.',
        expect: '3\n',
      },
    },
    {
      id: 'b5',
      title: 'Variables and redirection',
      body: `
<p>Store values in variables with <code>NAME=value</code> (no spaces around <code>=</code>) and read them back with <code>$NAME</code>. Double quotes expand variables; single quotes don't.</p>
<p><code>&gt;</code> writes output to a file (and overwrites it). <code>&gt;&gt;</code> appends.</p>
<pre>TARGET=web01
echo "Reviewing $TARGET" > /tmp/notes.txt
echo "second line" >> /tmp/notes.txt
cat /tmp/notes.txt</pre>`,
      exercise: {
        type: 'shell',
        task: 'Set HOST=db01, then echo the text: checking db01, using the variable rather than typing db01 a second time.',
        expect: 'checking db01\n',
        hint: 'HOST=db01; echo "checking $HOST"',
      },
    },
    {
      id: 'b6',
      title: 'Loops',
      body: `
<p>A <code>for</code> loop repeats a command for each item in a list. This is how you automate repetitive work across many in-scope hosts or files.</p>
<pre>for h in web01 db01 hr-pc; do echo "host: $h"; done</pre>
<p>In a real script you'd usually read the list from a file, such as the approved <code>scope.txt</code>. That way automation never runs against anything outside scope.</p>`,
      exercise: {
        type: 'shell',
        task: 'Write a for loop over the words alpha and beta that prints "item: alpha" and "item: beta".',
        expect: 'item: alpha\nitem: beta\n',
      },
    },
  ],
};
  CM.tracks[track.id] = track;
})(typeof window !== 'undefined' ? window : globalThis);
