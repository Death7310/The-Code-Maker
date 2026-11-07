/*
 * study/zero.js — in-depth study notes for Ground Zero.
 * Original material; sources are listed per lesson. Each note: sections
 * (principle → mechanism → example), misconceptions, exam traps, on the job,
 * reasoning checks (every option explained), sources.
 */
(function (root) {
  'use strict';
  const CM = (root.CM = root.CM || {});
  CM.study = CM.study || {};
  Object.assign(CM.study, {
    z0: {
      sections: [
        { h: 'The principle: memory is strengthened by retrieval, not by exposure', html: `
<p>Reading something feels productive because it becomes <em>familiar</em>, and familiarity feels like knowing. But recognizing an answer when you see it is a different, weaker memory than <strong>producing</strong> it from nothing. Exams and real jobs require production: nobody hands you the answer to recognize.</p>
<p>Two effects are among the best-replicated findings in learning research:</p>
<ul>
  <li><strong>The testing effect:</strong> the act of retrieving information strengthens the memory more than another reading does (Roediger &amp; Karpicke, 2006).</li>
  <li><strong>The spacing effect:</strong> the same total study time, spread over days, beats massed study ("cramming") for long-term retention (Cepeda et al., 2006).</li>
</ul>
<p>Dunlosky et al. (2013) reviewed ten common techniques. Practice testing and distributed practice were rated <em>high utility</em>; highlighting, rereading and summarizing were rated <em>low utility</em>.</p>` },
        { h: 'Why struggle is part of it', html: `
<p>Bjork's idea of <strong>desirable difficulties</strong> says that conditions which make practice <em>feel</em> harder (spacing, mixing topics, generating answers yourself) often produce better long-term learning, even though they look worse in the moment. If a session feels easy, you're probably rehearsing what you already know.</p>
<p>The flip side: struggle should be <em>productive</em>. For true beginners, worked examples and guidance beat unguided trial-and-error (Kirschner, Sweller &amp; Clark, 2006). That's why this app offers hints and worked solutions, but only counts unaided answers toward mastery.</p>` },
        { h: 'A study routine built on the evidence', html: `
<ol>
  <li><strong>Learn a little:</strong> one lesson's Study notes.</li>
  <li><strong>Retrieve:</strong> close the notes and do the Practice. Get problems wrong, read the worked solution, try the next one.</li>
  <li><strong>Build:</strong> use it in a Project or the Sandbox. Using knowledge in a new context is the strongest test of understanding.</li>
  <li><strong>Space it out:</strong> clear the Review queue daily. Items come back at growing intervals.</li>
  <li><strong>Mix it up:</strong> use Mixed Practice weekly, so you must recognize <em>which</em> principle applies.</li>
</ol>` },
      ],
      misconceptions: [
        'Rereading until it "feels familiar" means I know it. (Familiarity is recognition, not recall.)',
        'Getting things wrong in practice means I\'m bad at this. (Errors followed by feedback are how the memory gets corrected.)',
        'Long weekend sessions are as good as short daily ones. (Spacing beats massing for the same total time.)',
      ],
      examTraps: ['Practice exams you\'ve taken several times stop measuring knowledge: you start remembering the questions. Use fresh question banks before the real exam.'],
      onTheJob: 'Security work is continuous learning: new attacks, tools and systems every month. Professionals who keep a retrieval-based habit (lab notes they re-test themselves on, flashcards for ports and commands, practicing in home labs) keep up; those who only read headlines fall behind.',
      checks: [
        { q: 'You have two hours the night before a quiz. Which plan best fits the research?', options: ['Reread the chapter three times', 'Spend most of the time answering practice questions from memory, checking each answer', 'Highlight key terms, then reread the highlights', 'Watch a summary video twice'], answer: 1, why: ['Rereading builds familiarity, not recall.', 'Retrieval with feedback is the testing effect in action. With only one night, it\'s the best use of the time.', 'Highlighting was rated low utility; it doesn\'t force retrieval.', 'Watching is passive exposure, like rereading.'] },
        { q: 'A learner gets 100% on every practice set and it feels easy. What does that most likely mean?', options: ['They have mastered the subject', 'The practice is probably too easy or too repetitive to be building new learning', 'They should stop practicing', 'Spacing doesn\'t work for them'], answer: 1, why: ['Possibly, but easy, error-free practice usually means rehearsing what\'s already known.', 'Desirable difficulties: productive struggle signals learning. Increase difficulty, mix topics or space it out.', 'Retention still decays without spaced review.', 'Nothing here tests spacing.'] },
      ],
      sources: [
        { title: 'Roediger & Karpicke (2006). Test-enhanced learning. Psychological Science 17(3).', url: 'https://doi.org/10.1111/j.1467-9280.2006.01693.x' },
        { title: 'Dunlosky et al. (2013). Improving students\' learning with effective learning techniques. Psychological Science in the Public Interest 14(1).', url: 'https://doi.org/10.1177/1529100612453266' },
        { title: 'Cepeda et al. (2006). Distributed practice in verbal recall tasks. Psychological Bulletin 132(3).', url: 'https://doi.org/10.1037/0033-2909.132.3.354' },
        { title: 'Kirschner, Sweller & Clark (2006). Why minimal guidance during instruction does not work. Educational Psychologist 41(2).', url: 'https://doi.org/10.1207/s15326985ep4102_1' },
      ],
    },

    z1: {
      sections: [
        { h: 'The principle: a computer is a machine that transforms data', html: `
<p>Every computer, from a thermostat to a cloud server, follows the same cycle: data comes <strong>in</strong>, gets <strong>processed</strong>, results go <strong>out</strong>, and some of it is <strong>stored</strong> for later. This is the IPOS model (Input, Processing, Output, Storage). It isn't just a classification exercise: it's a map of <em>where things can break</em> and <em>where data can be intercepted</em>.</p>` },
        { h: 'How it actually works', html: `
<ul>
  <li><strong>Input devices</strong> convert something physical (a key press, a touch, sound, light) into digital signals. A keyboard sends a code for each key; a microphone samples sound waves thousands of times per second.</li>
  <li><strong>Processing</strong> happens mainly in the <strong>CPU</strong>, which repeatedly fetches an instruction from memory, decodes it and executes it, billions of times per second. GPUs also process, specializing in many small calculations in parallel.</li>
  <li><strong>Output devices</strong> convert digital results back into something physical: light (monitor), sound (speakers), paper (printer), motion (a motor).</li>
  <li><strong>Storage</strong> keeps data when the power is off: SSDs, hard drives, flash drives, and cloud storage over a network.</li>
</ul>
<p>Some devices do several jobs. A touchscreen is input (touch sensor) <em>and</em> output (display). A network card is both: it receives and sends data. Classify by the <strong>direction of data flow</strong> for the function you're asking about.</p>` },
        { h: 'Worked example: troubleshooting with IPOS', html: `
<p>"I typed my document but nothing printed." Walk the cycle:</p>
<ol>
  <li><strong>Input:</strong> did the typing register? (Is the text on screen?) Yes, so input is fine.</li>
  <li><strong>Processing:</strong> did the print job get created? (Is it in the print queue?)</li>
  <li><strong>Output:</strong> is the printer on, connected, with paper and toner?</li>
  <li><strong>Storage:</strong> was the file saved? (Relevant if the app crashed.)</li>
</ol>
<p>You've just narrowed a vague complaint to one stage. That's the first move in the CompTIA troubleshooting method, and in incident investigation.</p>` },
        { h: 'The security angle', html: `
<p>Each stage is an attack surface. <strong>Input</strong> can be captured (keyloggers, malicious USB devices that pretend to be keyboards). <strong>Processing</strong> can be hijacked (malware running on the CPU). <strong>Output</strong> can leak (shoulder surfing, documents left on printers). <strong>Storage</strong> can be stolen (unencrypted laptops and backups). Security controls map onto these stages too: input validation, endpoint protection, privacy screens, encryption at rest.</p>` },
      ],
      misconceptions: ['A device can only be one category. (Touchscreens, network cards and headsets with microphones are both input and output.)', '"Storage" and "memory" are the same thing. (RAM is working memory and is wiped at power-off; storage persists.)'],
      examTraps: ['A+ questions often hide the category in a scenario. "A user can\'t hear audio" is an output problem; "the system doesn\'t respond to the keyboard" is input.'],
      onTheJob: 'Help desk technicians use this cycle to isolate faults. Security analysts use the same thinking to ask where data enters a system (where to validate it), where it\'s processed (what can run), where it leaves (what can leak), and where it rests (what must be encrypted).',
      checks: [
        { q: 'A barcode scanner at a warehouse reads labels, but the inventory screen never updates. The scanner beeps normally. Which IPOS stage should you investigate FIRST?', options: ['Input', 'Processing (is the software receiving and handling the scans?)', 'Output, by replacing the monitor', 'Storage'], answer: 1, why: ['The beep suggests the scan was read. Input looks fine, so start further along the chain.', 'Input appears to work; the next link is the software receiving and processing the data. Follow the data flow.', 'The screen is showing other things fine, so the monitor isn\'t the likely issue.', 'Storage matters only if the data was processed and then failed to save. Check processing first.'] },
        { q: 'Which control protects the STORAGE stage specifically?', options: ['A privacy screen filter', 'Full-disk encryption', 'Input validation on a web form', 'A faster CPU'], answer: 1, why: ['That protects output: what\'s displayed.', 'Encryption at rest protects stored data if the device is stolen.', 'That protects input handling.', 'Performance, not protection.'] },
      ],
      sources: [
        { title: 'CompTIA A+ exam objectives (official, free)', url: 'https://www.comptia.org/certifications/a' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

    z2: {
      sections: [
        { h: 'The principle: everything is numbers, and numbers are switches', html: `
<p>Digital hardware is built from billions of tiny switches (transistors) that are either off or on. That gives exactly two states, so computers count in <strong>base 2 (binary)</strong>. Text, images, sound and programs are all stored as patterns of 0s and 1s, and their meaning depends on the agreed <em>encoding</em>.</p>` },
        { h: 'Place value: the same rule as decimal, with 2 instead of 10', html: `
<p>In decimal, each position is worth 10× the one to its right: 1, 10, 100, 1000. In binary, each position is worth <strong>2×</strong>: 1, 2, 4, 8, 16, 32, 64, 128.</p>
<pre>decimal 305  = 3×100 + 0×10 + 5×1
binary 1011  = 1×8   + 0×4  + 1×2 + 1×1 = 11</pre>
<p><strong>Binary → decimal:</strong> add the place values wherever there's a 1.<br>
<strong>Decimal → binary:</strong> go from the largest place value down. If it fits, write 1 and subtract it; otherwise write 0.</p>
<pre>Convert 156:
128 fits → 1 (28 left)   64 → 0   32 → 0   16 fits → 1 (12 left)
8 fits → 1 (4 left)      4 fits → 1 (0 left)   2 → 0   1 → 0
156 = 10011100</pre>` },
        { h: 'Why 2ⁿ shows up everywhere', html: `
<p>Each added bit <strong>doubles</strong> the number of possible patterns, because every existing pattern can now end in 0 or in 1. So <em>n</em> bits give 2<sup>n</sup> values:</p>
<pre>1 bit → 2    4 bits → 16    8 bits (1 byte) → 256    16 bits → 65,536    32 bits → ~4.3 billion</pre>
<p>That's why one byte holds 0–255, why IPv4 (32 bits) ran out of addresses (~4.3 billion isn't enough for the world), and why subnet sizes are always powers of 2. To find how many bits you need for N things, find the smallest 2<sup>n</sup> that is ≥ N.</p>` },
        { h: 'Bits vs bytes, and the units trap', html: `
<ul>
  <li><strong>Network speeds</strong> are quoted in <strong>bits</strong> per second (Mbps, lowercase b).</li>
  <li><strong>File sizes</strong> are in <strong>bytes</strong> (MB, uppercase B). 1 byte = 8 bits.</li>
  <li>So a 100 Mbps link moves at most ~12.5 MB/s, and less in practice, because protocols add overhead.</li>
  <li>Storage makers use decimal units (1 GB = 1,000,000,000 bytes); operating systems often show binary units (1 GiB = 1,073,741,824 bytes). That's why a "1 TB" drive shows ~931 GB in Windows.</li>
</ul>` },
        { h: 'Hexadecimal: binary for humans', html: `
<p>Long binary strings are hard to read, so engineers use <strong>hexadecimal (base 16)</strong>: digits 0–9 then A–F (A = 10 … F = 15). One hex digit is exactly 4 bits, so one byte is exactly two hex digits: <code>11111111</code> = <code>FF</code> = 255. You'll see hex in MAC addresses (<code>52:54:00:12:34:56</code>), IPv6, color codes, memory addresses and file hashes (a SHA-256 hash is 64 hex digits = 256 bits).</p>` },
      ],
      misconceptions: ['A gigabit connection downloads a gigabyte per second. (It\'s bits: about 125 MB/s at best.)', 'Binary is a different "kind" of number. (It\'s the same quantity written with a different base.)', 'The new drive is missing space. (Decimal vs binary units explain most of the gap.)'],
      examTraps: ['Watch for b vs B in questions about transfer time.', 'Subnetting questions on Network+ assume fast, accurate binary. Drill until it\'s automatic.'],
      onTheJob: 'Analysts read hex in packet captures and hashes, convert subnet masks in their heads, estimate whether a link can carry a backup overnight (bits vs bytes), and recognize that a 32-bit counter overflowing after 4.3 billion events can cause real outages.',
      checks: [
        { q: 'A 50 GB backup must cross a 100 Mbps link. Roughly how long does it take at full speed?', options: ['About 8 minutes', 'About 67 minutes', 'About 8 hours', 'About 30 seconds'], answer: 1, why: ['That would need about 800 Mbps. Check your bits vs bytes.', '50 GB = 400 Gb (×8). 400,000 Mb ÷ 100 Mbps = 4,000 s ≈ 67 minutes, and longer in practice with overhead.', 'Too slow by a factor of about 7.', 'That would need about 13 Gbps.'] },
        { q: 'A system uses 6 bits to number its sensors. A seventieth sensor must be added. What happens?', options: ['Nothing; 6 bits allow up to 100 sensors', 'It no longer fits: 6 bits give only 64 unique numbers, so at least 7 bits are needed', 'Add one more sensor slot to the existing 6 bits', 'Switch to hexadecimal'], answer: 1, why: ['2^6 = 64, not 100.', 'Each bit doubles the space: 2^6 = 64 < 70 ≤ 128 = 2^7.', 'You can\'t add a "slot" without adding a bit, and a bit doubles the range.', 'Hex is only a way of writing the same bits; it adds no capacity.'] },
      ],
      sources: [
        { title: 'NIST: Prefixes for binary multiples (KiB, MiB, GiB)', url: 'https://physics.nist.gov/cuu/Units/binary.html' },
        { title: 'Professor Messer: free CompTIA A+ training course', url: 'https://www.professormesser.com/' },
      ],
    },

  });
})(typeof window !== 'undefined' ? window : globalThis);
