/*
 * app.js — hash router, rendering and progress tracking.
 * Progress is saved in localStorage (only in this browser); the app still
 * works if storage is unavailable.
 */
(function () {
  'use strict';
  const { tracks, career } = CM.curriculum;
  const app = document.getElementById('app');
  const KEY = 'codemaker.progress.v1';

  // ---------- progress ----------
  let done = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { done = {}; }
  function markDone(id) {
    done[id] = true;
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { /* storage blocked */ }
  }
  const trackProgress = (t) => t.lessons.filter((l) => done[l.id]).length;

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const findTrack = (id) => tracks.find((t) => t.id === id);

  // ---------- terminal widget ----------
  function mountTerminal(el, shell, onOutput) {
    el.innerHTML = '<div class="term-out" aria-live="polite"></div>' +
      '<form class="term-in"><span class="prompt"></span><input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command"></form>';
    const out = el.querySelector('.term-out');
    const form = el.querySelector('form');
    const input = el.querySelector('input');
    const prompt = el.querySelector('.prompt');
    const hist = [];
    let hi = 0;
    const setPrompt = () => {
      prompt.textContent = 'student@sandbox:' + shell.cwd.replace(shell.env.HOME, '~') + '$';
    };
    const print = (text, cls) => {
      const pre = document.createElement('pre');
      if (cls) pre.className = cls;
      pre.textContent = text;
      out.appendChild(pre);
      out.scrollTop = out.scrollHeight;
    };
    print('Simulated sandbox. Type "help" to list commands.', 'dim');
    setPrompt();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const line = input.value;
      input.value = '';
      if (line.trim()) { hist.push(line); hi = hist.length; }
      print(prompt.textContent + ' ' + line, 'cmd');
      const r = shell.run(line);
      if (r.out === '\x1bCLEAR') out.innerHTML = '';
      else if (r.out) print(r.out.replace(/\n$/, ''));
      setPrompt();
      if (onOutput) onOutput(line, r);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && hi > 0) { hi--; input.value = hist[hi]; e.preventDefault(); }
      if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; e.preventDefault(); }
    });
    el.addEventListener('click', () => input.focus());
    return { input };
  }

  // ---------- views ----------
  function viewHome() {
    const cards = tracks.map((t) => {
      const n = trackProgress(t);
      const pct = Math.round((n / t.lessons.length) * 100);
      return `<a class="card" href="#/track/${t.id}">
        <span class="tag">${esc(t.lang)}</span>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.blurb)}</p>
        <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
        <small>${n} / ${t.lessons.length} complete</small>
      </a>`;
    }).join('');
    app.innerHTML = `
      <section class="hero">
        <h1>Learn to code for an ethical security career</h1>
        <p>Short lessons in the three scripting languages CompTIA PenTest+ names (Bash, Python and PowerShell), plus the professional groundwork the job depends on. Each lesson ends with a hands-on exercise in a safe, simulated environment.</p>
        <p class="path"><strong>Suggested order:</strong> Foundations → Bash → Python → PowerShell → Career plan</p>
      </section>
      <section class="grid">${cards}
        <a class="card" href="#/sandbox"><span class="tag">Free play</span><h3>Sandbox terminal</h3><p>An open simulated Linux shell with sample logs and files to explore.</p></a>
        <a class="card" href="#/career"><span class="tag">Roadmap</span><h3>Career path</h3><p>How these skills map to certifications and roles.</p></a>
      </section>`;
  }

  function viewTrack(id) {
    const t = findTrack(id);
    if (!t) return viewNotFound();
    const items = t.lessons.map((l, i) => `
      <li><a href="#/lesson/${t.id}/${l.id}">
        <span class="num">${done[l.id] ? '✓' : i + 1}</span> ${esc(l.title)}
      </a></li>`).join('');
    app.innerHTML = `
      <section class="trackhead">
        <span class="tag">${esc(t.lang)}</span>
        <h1>${esc(t.title)}</h1>
        <p>${esc(t.blurb)}</p>
        <small>${trackProgress(t)} / ${t.lessons.length} complete</small>
      </section>
      <ol class="lessons">${items}</ol>`;
  }

  function viewLesson(tid, lid) {
    const t = findTrack(tid);
    const idx = t ? t.lessons.findIndex((l) => l.id === lid) : -1;
    if (idx < 0) return viewNotFound();
    const l = t.lessons[idx];
    const next = t.lessons[idx + 1];
    const ex = l.exercise;
    app.innerHTML = `
      <nav class="crumbs"><a href="#/track/${t.id}">${esc(t.title)}</a> / Lesson ${idx + 1} of ${t.lessons.length}</nav>
      <div class="lesson">
        <article class="explain">
          <h1>${esc(l.title)}</h1>
          ${l.body}
        </article>
        <section class="practice">
          <h2>Exercise</h2>
          <div id="ex"></div>
          <div id="result" class="result" aria-live="polite"></div>
          <div class="nextrow">${next ? `<a class="btn ghost" href="#/lesson/${t.id}/${next.id}">Next: ${esc(next.title)} →</a>` : `<a class="btn ghost" href="#/track/${t.id}">Back to track</a>`}</div>
        </section>
      </div>`;
    const exEl = document.getElementById('ex');
    const result = document.getElementById('result');
    const pass = (msg) => {
      markDone(l.id);
      result.className = 'result ok';
      result.textContent = '✓ ' + (msg || 'Correct, lesson complete.');
    };
    const fail = (msg) => { result.className = 'result bad'; result.textContent = msg; };

    if (ex.type === 'shell') {
      exEl.innerHTML = `<p class="task">${esc(ex.task)}</p><div class="terminal" id="term"></div>
        ${ex.hint ? `<details><summary>Hint</summary><code>${esc(ex.hint)}</code></details>` : ''}`;
      const shell = new CM.Shell();
      mountTerminal(document.getElementById('term'), shell, (line, r) => {
        if (r.out === ex.expect) pass('Correct, lesson complete.');
        else if (line.trim() && line.trim() !== 'help') fail('Not quite. The output doesn’t match yet. Keep going.');
      });
    } else if (ex.type === 'python') {
      exEl.innerHTML = `<p class="task">${esc(ex.task).replace(/\n/g, '<br>')}</p>
        <textarea class="code" id="code" spellcheck="false" aria-label="Python code">${esc(ex.starter)}</textarea>
        <div class="row"><button class="btn" id="run">Run ▶</button><button class="btn ghost" id="reset">Reset</button></div>
        <pre class="pyout" id="pyout" aria-label="Program output"></pre>`;
      const code = document.getElementById('code');
      const pyout = document.getElementById('pyout');
      code.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const s = code.selectionStart;
          code.value = code.value.slice(0, s) + '    ' + code.value.slice(code.selectionEnd);
          code.selectionStart = code.selectionEnd = s + 4;
        }
      });
      document.getElementById('reset').onclick = () => { code.value = ex.starter; };
      document.getElementById('run').onclick = async () => {
        const btn = document.getElementById('run');
        btn.disabled = true;
        pyout.textContent = 'Running… (the first run downloads Python, which takes a few seconds)';
        try {
          const r = await CM.runPython(code.value);
          pyout.textContent = r.stdout + (r.error ? '\n' + r.error : '');
          if (r.error) fail('Your code raised an error. Read the last line of the message above.');
          else if (r.stdout.trim() === ex.expect.trim()) pass();
          else fail('It ran, but the output doesn’t match the expected output yet.');
        } catch (e) {
          pyout.textContent = '';
          fail(e.message);
        } finally {
          btn.disabled = false;
        }
      };
    } else if (ex.type === 'quiz') {
      const opts = ex.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('');
      exEl.innerHTML = `<pre class="question">${esc(ex.question)}</pre><div class="opts">${opts}</div>`;
      exEl.querySelectorAll('.opt').forEach((b) => {
        b.onclick = () => {
          const i = Number(b.dataset.i);
          exEl.querySelectorAll('.opt').forEach((x) => x.classList.remove('chosen-ok', 'chosen-bad'));
          if (i === ex.answer) { b.classList.add('chosen-ok'); pass(ex.explain); }
          else { b.classList.add('chosen-bad'); fail('Not quite. Think it through and try another option.'); }
        };
      });
    }
  }

  function viewSandbox() {
    app.innerHTML = `
      <section class="trackhead">
        <h1>Sandbox terminal</h1>
        <p>A free-play simulated Linux shell. Try: <code>ls</code>, <code>cat notes.txt</code>, <code>grep Failed logs/auth.log | cut -d " " -f 9 | sort | uniq -c</code></p>
      </section>
      <div class="terminal big" id="term"></div>`;
    const t = mountTerminal(document.getElementById('term'), new CM.Shell());
    t.input.focus();
  }

  function viewCareer() {
    const rows = career.map((c, i) => `
      <li class="step"><span class="num">${i + 1}</span>
        <div><h3>${esc(c.name)}</h3><p class="role">${esc(c.role)}</p><p>${esc(c.note)}</p></div>
      </li>`).join('');
    app.innerHTML = `
      <section class="trackhead">
        <h1>Career path</h1>
        <p>Certifications open doors, but evidence of skill gets you hired. Pair each step with practice you can show: lab write-ups, scripts on GitHub, and reports.</p>
      </section>
      <ol class="career">${rows}</ol>
      <section class="callout">
        <h3>Legal practice options</h3>
        <ul>
          <li>Build a home lab of virtual machines you own (VirtualBox or similar) on an isolated network.</li>
          <li>Use intentionally vulnerable training apps that run locally and are designed for learning.</li>
          <li>Use online training ranges whose terms explicitly authorize you to test their targets.</li>
        </ul>
        <p>Always check the current exam objectives on CompTIA's website before you study. They're revised every few years.</p>
      </section>`;
  }

  function viewNotFound() {
    app.innerHTML = '<section class="trackhead"><h1>Not found</h1><p><a href="#/">Go home</a></p></section>';
  }

  // ---------- router ----------
  function route() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    window.scrollTo(0, 0);
    document.querySelectorAll('#nav a').forEach((a) => {
      const h = a.getAttribute('href').replace(/^#\/?/, '');
      a.classList.toggle('active', h ? parts.join('/').startsWith(h) || (parts[0] === 'lesson' && h === 'track/' + parts[1]) : !parts.length);
    });
    if (!parts.length) return viewHome();
    if (parts[0] === 'track') return viewTrack(parts[1]);
    if (parts[0] === 'lesson') return viewLesson(parts[1], parts[2]);
    if (parts[0] === 'sandbox') return viewSandbox();
    if (parts[0] === 'career') return viewCareer();
    viewNotFound();
  }
  window.addEventListener('hashchange', route);
  route();
})();
