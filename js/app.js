/*
 * app.js — hash router, rendering and progress tracking.
 * Progress and review state are saved in localStorage (only in this
 * browser); the app still works if storage is unavailable.
 */
(function () {
  'use strict';
  const { tracks, path, coding, roadmap, optional } = CM.curriculum;
  const R = CM.review;
  const app = document.getElementById('app');

  // ---------- persistence ----------
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage blocked */ }
  }
  const done = load('codemaker.progress.v1');
  const rstate = load('codemaker.review.v1');
  function markDone(id) { done[id] = true; save('codemaker.progress.v1', done); updateBadge(); }

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const findTrack = (id) => tracks.find((t) => t.id === id);
  const trackProgress = (t) => t.lessons.filter((l) => done[l.id]).length;
  const dueItems = () => R.due(R.collect(tracks, done), rstate, Date.now());

  function updateBadge() {
    const b = document.getElementById('due-badge');
    if (!b) return;
    const n = dueItems().length;
    b.textContent = n;
    b.hidden = n === 0;
  }

  // Renders a quiz or input question. Calls onAnswer(correct) on each attempt.
  function renderQuestion(el, item, onAnswer) {
    if (item.type === 'input') {
      el.innerHTML = `<pre class="question">${esc(item.question)}</pre>
        <form class="answer-row"><input class="answer" aria-label="Your answer" autocomplete="off" spellcheck="false">
        <button class="btn">Check</button></form>`;
      const form = el.querySelector('form');
      const input = el.querySelector('input');
      form.onsubmit = (e) => {
        e.preventDefault();
        if (!input.value.trim()) return;
        onAnswer(R.checkInput(item, input.value));
      };
      setTimeout(() => input.focus(), 0);
      return;
    }
    const opts = item.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('');
    el.innerHTML = `<pre class="question">${esc(item.question)}</pre><div class="opts">${opts}</div>`;
    el.querySelectorAll('.opt').forEach((b) => {
      b.onclick = () => {
        const ok = Number(b.dataset.i) === item.answer;
        el.querySelectorAll('.opt').forEach((x) => x.classList.remove('chosen-ok', 'chosen-bad'));
        b.classList.add(ok ? 'chosen-ok' : 'chosen-bad');
        onAnswer(ok);
      };
    });
  }

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
  function trackCard(t, extra) {
    const n = trackProgress(t);
    const pct = Math.round((n / t.lessons.length) * 100);
    return `<a class="card" href="#/track/${t.id}">
      <span class="tag">${esc(t.lang)}</span>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.blurb)}</p>
      ${extra ? `<p class="when">${esc(extra)}</p>` : ''}
      <div class="bar" role="progressbar" aria-label="${esc(t.title)} progress" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
      <small>${n} / ${t.lessons.length} complete</small>
    </a>`;
  }

  function nextLesson() {
    for (const id of path) {
      const t = findTrack(id);
      const l = t && t.lessons.find((x) => !done[x.id]);
      if (l) return { t, l };
    }
    return null;
  }

  function viewHome() {
    const nl = nextLesson();
    const nDue = dueItems().length;
    const steps = path.map((id, i) => {
      const t = findTrack(id);
      const n = trackProgress(t);
      const state = n === t.lessons.length ? 'complete' : n > 0 ? 'active' : '';
      return `<li class="pstep ${state}"><a href="#/track/${t.id}">
        <span class="num">${state === 'complete' ? '✓' : i}</span>
        <span><strong>${esc(t.title)}</strong><br><small>${esc(t.lang)} · ${n}/${t.lessons.length}</small></span></a></li>`;
    }).join('');
    const codeCards = coding.map((c) => trackCard(findTrack(c.id), c.start)).join('');
    app.innerHTML = `
      <section class="hero">
        <h1>From zero to job-ready in security</h1>
        <p>Start with how computers work. Build up through CompTIA A+, Network+ and Security+, then specialize in penetration testing. Learn to code alongside. Every lesson ends with a question you have to answer, because that's how learning sticks.</p>
        <div class="today">
          ${nl ? `<a class="btn" href="#/lesson/${nl.t.id}/${nl.l.id}">Continue: ${esc(nl.l.title)} →</a>` : '<span>Path complete. Keep reviewing.</span>'}
          <a class="btn ghost" href="#/review">Review (${nDue} due)</a>
        </div>
      </section>
      <h2 class="sect">Your certification path</h2>
      <ol class="pathlist">${steps}</ol>
      <h2 class="sect">Coding skills, learned alongside the path</h2>
      <section class="grid">${codeCards}
        <a class="card" href="#/sandbox"><span class="tag">Free play</span><h3>Sandbox terminal</h3><p>An open simulated Linux shell with sample logs and files to explore.</p></a>
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

  // The next step after finishing a track's last lesson.
  function afterTrack(t) {
    const i = path.indexOf(t.id);
    if (i >= 0 && i < path.length - 1) {
      const n = findTrack(path[i + 1]);
      return `<a class="btn ghost" href="#/track/${n.id}">Next stage: ${esc(n.title)} →</a>`;
    }
    return `<a class="btn ghost" href="#/">Back to your path</a>`;
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
          <h2>Check yourself</h2>
          <div id="ex"></div>
          <div id="result" class="result" aria-live="polite"></div>
          <div class="nextrow">${next ? `<a class="btn ghost" href="#/lesson/${t.id}/${next.id}">Next: ${esc(next.title)} →</a>` : afterTrack(t)}</div>
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
    } else {
      renderQuestion(exEl, ex, (ok) => {
        if (ok) pass(ex.explain);
        else fail('Not quite. Think it through and try again.');
      });
    }
  }

  function viewReview() {
    const queue = dueItems();
    const total = R.collect(tracks, done).length;
    if (!queue.length) {
      app.innerHTML = `
        <section class="trackhead"><h1>Review</h1>
        <p>${total ? 'Nothing due right now. Questions come back at growing intervals (1, 3, 7, 14, 30 days) as you get them right.' : 'Finish a lesson and its questions will start showing up here.'}</p>
        <p><a class="btn" href="#/">Back to your path</a></p></section>`;
      updateBadge();
      return;
    }
    const item = queue[0];
    app.innerHTML = `
      <section class="trackhead"><h1>Review</h1>
        <p>${queue.length} question${queue.length === 1 ? '' : 's'} due. Answer from memory first. The effort of recalling is what makes it stick.</p></section>
      <section class="practice reviewcard">
        <small class="from">${esc(item.track)} · ${esc(item.lesson)}</small>
        <div id="q"></div>
        <div id="result" class="result" aria-live="polite"></div>
        <div class="nextrow" id="nextrow" hidden><button class="btn" id="next">Next question →</button></div>
      </section>`;
    let answered = false;
    renderQuestion(document.getElementById('q'), item, (ok) => {
      const result = document.getElementById('result');
      if (!answered) {
        answered = true;
        rstate[item.id] = R.grade(rstate[item.id], ok, Date.now());
        save('codemaker.review.v1', rstate);
        updateBadge();
        document.getElementById('nextrow').hidden = false;
      }
      result.className = 'result ' + (ok ? 'ok' : 'bad');
      result.textContent = (ok ? '✓ Correct. ' : '✗ Not this time. It will come back soon. ') + (item.explain || '');
    });
    document.getElementById('next').onclick = viewReview;
  }

  function viewRoadmap() {
    const stages = roadmap.map((s) => {
      const t = findTrack(s.track);
      return `<li class="step"><span class="num">${s.stage}</span>
        <div>
          <h3>${esc(s.name)}</h3>
          <p class="role">${esc(s.exam)} · planning estimate: ${esc(s.weeks)} at ~8–10 hrs/week</p>
          ${s.domains.map((d) => `<p class="domains">${esc(d)}</p>`).join('')}
          <p><strong>Hands-on:</strong> ${esc(s.handsOn)}</p>
          ${t ? `<a href="#/track/${t.id}">Open the ${esc(t.title)} lessons →</a>` : ''}
        </div></li>`;
    }).join('');
    const opts = optional.map((o) => `<li><strong>${esc(o.name)}</strong> <em>(${esc(o.when)})</em>: ${esc(o.why)}</li>`).join('');
    app.innerHTML = `
      <section class="trackhead">
        <h1>Roadmap: zero to specialist</h1>
        <p>Each stage builds on the one before. The time estimates are rough planning figures for a complete beginner, not guarantees. Expect to adjust them as you go.</p>
      </section>
      <ol class="career">${stages}</ol>
      <section class="callout">
        <h3>Optional additions</h3>
        <ul>${opts}</ul>
      </section>
      <section class="callout">
        <h3>Be honest with yourself about this app's limits</h3>
        <ul>
          <li>These lessons are the <em>skeleton</em> of each exam, not full coverage. Pair each stage with a complete study source (official CompTIA materials, or free video courses such as Professor Messer's) and full-length practice exams.</li>
          <li>Download the official exam objectives PDF from CompTIA for each exam and tick off every line.</li>
          <li>Employers hire on what you can show: lab notes, scripts and write-ups. Start a portfolio during A+.</li>
          <li>Only test systems you own or have written permission to test.</li>
        </ul>
      </section>`;
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

  function viewNotFound() {
    app.innerHTML = '<section class="trackhead"><h1>Not found</h1><p><a href="#/">Go home</a></p></section>';
  }

  // ---------- router ----------
  function route() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    window.scrollTo(0, 0);
    document.querySelectorAll('#nav a').forEach((a) => {
      const h = a.getAttribute('href').replace(/^#\/?/, '');
      a.classList.toggle('active', h ? parts[0] === h : !parts.length || parts[0] === 'track' || parts[0] === 'lesson');
    });
    updateBadge();
    if (!parts.length) return viewHome();
    if (parts[0] === 'track') return viewTrack(parts[1]);
    if (parts[0] === 'lesson') return viewLesson(parts[1], parts[2]);
    if (parts[0] === 'review') return viewReview();
    if (parts[0] === 'roadmap' || parts[0] === 'career') return viewRoadmap();
    if (parts[0] === 'sandbox') return viewSandbox();
    viewNotFound();
  }
  window.addEventListener('hashchange', route);
  route();
})();
