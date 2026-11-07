/*
 * app.js — hash router, rendering and progress tracking.
 * Progress and review state are saved in localStorage (only in this
 * browser); the app still works if storage is unavailable.
 */
(function () {
  'use strict';
  const { tracks, path, coding, roadmap, optional, rationale } = CM.curriculum;
  const MS = CM.missions;
  const DR = CM.drills;
  const PR = CM.practice;
  const PJ = CM.projects;
  const PMAP = CM.practiceMap || {};
  const EX = CM.exams;
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
  const mresults = load('codemaker.missions.v1');
  const unlocks = load('codemaker.unlock.v1');
  const drillStats = load('codemaker.drills.v1');
  const pjState = load('codemaker.projects.v1');
  function savePj() { save('codemaker.projects.v1', pjState); }
  function pjCode(id, fallback) { try { const c = localStorage.getItem('codemaker.code.' + id); return c === null ? fallback : c; } catch (e) { return fallback; } }
  function savePjCode(id, code) { try { localStorage.setItem('codemaker.code.' + id, code); } catch (e) { /* storage blocked */ } }
  const examStats = load('codemaker.exams.v1');
  function markDone(id) { done[id] = true; save('codemaker.progress.v1', done); updateBadge(); }

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const findTrack = (id) => tracks.find((t) => t.id === id);
  const trackProgress = (t) => t.lessons.filter((l) => done[l.id]).length;
  const dueItems = () => R.due(R.collect(tracks, done, PMAP), rstate, Date.now());

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
    const nextPj = PJ.projects.find((p) => !pjProgress(p).complete);
    const builtN = PJ.projects.filter((p) => pjProgress(p).complete).length;
    app.innerHTML = `
      <section class="hero">
        <h1>Learn security by building it</h1>
        <p>You learn here by doing the work: writing real Python tools that are tested against data you've never seen, investigating incidents in a simulated company network, and working a Linux terminal. Everything runs inside the app, offline. Concepts and certification prep are here when a project needs them.</p>
        <div class="today">
          ${nextPj ? `<a class="btn" href="#/project/${nextPj.id}">${builtN ? 'Continue building' : 'Start your first project'}: ${esc(nextPj.title)} →</a>` : '<span>All projects built. Try the missions or rebuild one from scratch.</span>'}
          <a class="btn ghost" href="#/review">Review (${nDue} due)</a>
        </div>
      </section>
      <h2 class="sect">1 · Build: coding projects <small class="muted">(${builtN}/${PJ.projects.length} built)</small></h2>
      <section class="grid">${projectCards(PJ.projects)}</section>
      <h2 class="sect">2 · Investigate: missions in the simulated network</h2>
      <section class="grid">${missionCards()}</section>
      <h2 class="sect">3 · Operate: terminal and languages</h2>
      <section class="grid">${codeCards}
        <a class="card" href="#/sandbox"><span class="tag">Free play</span><h3>Sandbox terminal</h3><p>A simulated Linux server: users, permissions, sudo, processes, services, networking and scripts.</p></a>
      </section>
      <h2 class="sect">4 · Sharpen: practice tools</h2>
      <section class="grid">
        <a class="card" href="#/mixed"><span class="tag">Mixed practice</span><h3>Interleaved problems</h3><p>New problems from every lesson you've mastered, shuffled together.</p></a>
        <a class="card" href="#/drills/subnet"><span class="tag">Drills</span><h3>Subnetting, binary & ports</h3><p>Endless generated problems with worked solutions.</p></a>
        <a class="card" href="#/exams"><span class="tag">Practice exams</span><h3>A+, Network+, Security+</h3><p>Exam-style sets with results by official domain.</p></a>
      </section>
      <h2 class="sect">5 · Know: concepts and certification prep</h2>
      <p class="muted">The knowledge the certifications test, in order. Use it alongside the projects: when a project needs a concept, learn it here, then go back and build.${nl ? ` Next lesson: <a href="#/lesson/${nl.t.id}/${nl.l.id}">${esc(nl.l.title)}</a>.` : ''}</p>
      <ol class="pathlist">${steps}</ol>`;
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
    if (PMAP[lid]) { viewMasteryLesson(t, idx); enhanceWithStudy(lid); return; }
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
    enhanceWithStudy(l.id);
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
        if ([].concat(ex.expect).includes(r.out)) pass('Correct, lesson complete.');
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
          // Graded exercises append hidden tests with a fresh random seed each run,
          // so passing requires a general solution, not a hard-coded answer.
          const seed = Math.floor(Math.random() * 1e9);
          const src = ex.tests ? code.value + '\n' + ex.tests.replace('__SEED__', String(seed)) : code.value;
          const r = await CM.runPython(src);
          pyout.textContent = r.stdout + (r.error ? '\n' + r.error : '');
          if (r.error) fail('Your code raised an error. Read the last line of the message above.');
          else if (ex.tests ? r.stdout.includes('ALL TESTS PASSED') : r.stdout.trim() === ex.expect.trim()) pass(ex.tests ? 'All hidden tests passed: your function works on cases you never saw.' : undefined);
          else fail(ex.tests ? 'Some hidden tests failed. Read the expected vs got lines above, fix the function, and run again (the tests change every run).' : 'It ran, but the output doesn’t match the expected output yet.');
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
    const total = R.collect(tracks, done, PMAP).length;
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
    if (item.type === 'gen') {
      // Fresh generated problem for this principle.
      const inst = PR.make(item.gen);
      renderPracticeItem(document.getElementById('q'), inst, (ok, hinted) => {
        const good = ok && !hinted;
        rstate[item.id] = R.grade(rstate[item.id], good, Date.now());
        save('codemaker.review.v1', rstate);
        updateBadge();
        document.getElementById('nextrow').hidden = false;
        document.getElementById('result').outerHTML = '<div id="result">' + feedback(inst, ok, hinted) + '</div>';
      });
      document.getElementById('next').onclick = viewReview;
      return;
    }
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
      <section class="callout"><h3>Why this order</h3><ul>${rationale.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></section>
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


  // ---------- missions ----------
  const trackDone = (id) => { const t = findTrack(id); return !!t && trackProgress(t) === t.lessons.length; };
  const missionOpen = (m) => trackDone(m.requires) || !!unlocks[m.id];

  function missionCards() {
    return MS.missions.map((m) => {
      const open = missionOpen(m);
      const r = mresults[m.id];
      const req = findTrack(m.requires);
      return `<a class="card mission ${open ? '' : 'locked'}" href="#/mission/${m.id}">
        <span class="tag">${esc(m.level)}${r ? ' · best ' + r.best + '/' + r.max : ''}</span>
        <h3>${open ? '' : '🔒 '}${esc(m.title)}</h3>
        <p>${esc(m.adversary)}</p>
        <small>${open ? (r ? 'Completed: ' + esc(MS.rating(r.best, r.max)) : 'Ready to start') : 'Unlocks after: ' + esc(req ? req.title : m.requires)}</small>
      </a>`;
    }).join('');
  }

  function viewMissions() {
    app.innerHTML = `
      <section class="trackhead">
        <h1>Missions</h1>
        <p>Realistic scenarios inside Harborview Logistics, a simulated company. Dig through the evidence in the terminal, answer questions, and make decisions. A simulated adversary reacts to what you choose. Missions unlock as you finish stages, and the support fades as you advance: <strong>Guided</strong> (hints shown) → <strong>Supported</strong> (hints on request) → <strong>Independent</strong> (no hints).</p>
      </section>
      <section class="grid">${missionCards()}</section>`;
  }

  function viewMission(id) {
    const m = MS.missions.find((x) => x.id === id);
    if (!m) return viewNotFound();
    if (!missionOpen(m)) {
      const req = findTrack(m.requires);
      app.innerHTML = `
        <section class="trackhead"><h1>🔒 ${esc(m.title)}</h1>
        <p>This mission builds on <strong>${esc(req.title)}</strong>. Finish that stage first (${trackProgress(req)}/${req.lessons.length} lessons done) so you have the tools it expects.</p>
        <p class="row"><a class="btn" href="#/track/${req.id}">Go to ${esc(req.title)}</a>
        <button class="btn ghost" id="unlock">I already know this, unlock it</button></p></section>`;
      document.getElementById('unlock').onclick = () => { unlocks[m.id] = true; save('codemaker.unlock.v1', unlocks); viewMission(id); };
      return;
    }
    const max = MS.maxScore(m);
    let step = -1; // -1 = briefing
    let score = 0;
    app.innerHTML = `
      <nav class="crumbs"><a href="#/missions">Missions</a> / ${esc(m.level)}</nav>
      <div class="lesson">
        <section class="explain">
          <h1>${esc(m.title)}</h1>
          <p class="adv"><strong>Adversary:</strong> ${esc(m.adversary)}</p>
          <div class="mstatus" id="mstatus"></div>
          <div id="mstep"></div>
        </section>
        <section class="practice">
          <h2>Investigation terminal</h2>
          <p class="note">Evidence is in your home folder. Start with <code>ls</code>, then <code>ls logs</code> or similar.</p>
          <div class="terminal big-ish" id="term"></div>
        </section>
      </div>`;
    mountTerminal(document.getElementById('term'), new CM.Shell(MS.shellOptions(m)));
    const el = document.getElementById('mstep');
    const status = document.getElementById('mstatus');
    const steps = m.steps;
    const setStatus = () => {
      status.textContent = step < 0 ? `${steps.length} steps · max score ${max}` : `Step ${Math.min(step + 1, steps.length)} of ${steps.length} · score ${score}/${max}`;
    };
    const cont = (label) => `<div class="nextrow"><button class="btn" id="cont">${label || 'Continue →'}</button></div>`;
    const bindCont = () => { document.getElementById('cont').onclick = () => { step++; render(); }; };

    function render() {
      setStatus();
      if (step < 0) {
        el.innerHTML = `<div class="brief">${m.briefing}</div>${cont('Start mission →')}`;
        return bindCont();
      }
      if (step >= steps.length) return finish();
      const s = steps[step];
      if (s.type === 'event') {
        el.innerHTML = `<div class="event"><strong>⚠ Situation update</strong><p>${esc(s.text)}</p></div>${cont()}`;
        return bindCont();
      }
      if (s.type === 'decision') {
        const opts = s.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.text)}</button>`).join('');
        el.innerHTML = `<p class="task">Decision: ${esc(s.prompt)}</p><p class="note">Choose carefully. Decisions can't be undone.</p><div class="opts">${opts}</div><div id="outcome"></div>`;
        el.querySelectorAll('.opt').forEach((b) => {
          b.onclick = () => {
            const o = s.options[Number(b.dataset.i)];
            score += o.score;
            setStatus();
            el.querySelectorAll('.opt').forEach((x) => { x.disabled = true; });
            b.classList.add(o.score === 2 ? 'chosen-ok' : 'chosen-bad');
            const best = s.options.find((x) => x.score === 2);
            const label = o.score === 2 ? '✓ Best call (+2)' : o.score === 1 ? '◐ Partial (+1)' : '✗ Poor call (+0)';
            document.getElementById('outcome').innerHTML = `<div class="result ${o.score === 2 ? 'ok' : 'bad'}"><strong>${label}</strong><br>${esc(o.outcome)}</div>
              ${o.score < 2 ? `<p class="note">The strongest option was: ${esc(best.text)}</p>` : ''}${cont()}`;
            bindCont();
          };
        });
        return;
      }
      // question
      const hint = s.hint && m.level !== 'Independent'
        ? (m.level === 'Guided'
          ? `<p class="hintline">Hint: <code>${esc(s.hint)}</code></p>`
          : `<details class="hintline"><summary>Show hint</summary><code>${esc(s.hint)}</code></details>`)
        : '';
      el.innerHTML = `<p class="task">Question</p>${hint}<div id="q"></div><div id="qres" class="result"></div>`;
      let wrong = 0;
      let doneQ = false;
      renderQuestion(document.getElementById('q'), s.q, (ok) => {
        if (doneQ) return;
        const res = document.getElementById('qres');
        if (!ok) { wrong++; res.className = 'result bad'; res.textContent = 'Not quite. Check the evidence again.'; return; }
        doneQ = true;
        const pts = wrong ? 1 : 2;
        score += pts;
        setStatus();
        res.className = 'result ok';
        res.innerHTML = `✓ +${pts} ${esc(s.q.explain)}`;
        res.insertAdjacentHTML('afterend', cont());
        bindCont();
      });
    }

    function finish() {
      const prev = mresults[m.id];
      if (!prev || score > prev.best) mresults[m.id] = { best: score, max };
      save('codemaker.missions.v1', mresults);
      const nextM = MS.missions[MS.missions.indexOf(m) + 1];
      el.innerHTML = `
        <div class="debrief">
          <h2>Debrief: ${esc(MS.rating(score, max))} (${score}/${max})</h2>
          <p>Principles you just practiced:</p>
          <ul>${m.debrief.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
          <p class="note">Write a 5-line incident summary of this mission in your own words (what happened, evidence, actions, root cause, prevention). That's portfolio practice, and recalling it strengthens your memory.</p>
          <div class="row"><button class="btn ghost" id="replay">Replay</button>
          ${nextM ? `<a class="btn" href="#/mission/${nextM.id}">Next mission: ${esc(nextM.title)} →</a>` : '<a class="btn" href="#/missions">All missions</a>'}</div>
        </div>`;
      document.getElementById('replay').onclick = () => viewMission(id);
      status.textContent = `Complete · score ${score}/${max}`;
    }
    render();
  }


  // ---------- drills ----------
  function viewDrills(kind) {
    kind = DR.DRILLS[kind] ? kind : 'subnet';
    const tabs = Object.keys(DR.DRILLS).map((k) => `<a class="tab ${k === kind ? 'on' : ''}" href="#/drills/${k}">${esc(DR.DRILLS[k].title)}</a>`).join('');
    const st = drillStats[kind] || { best: 0 };
    let session = { right: 0, total: 0, streak: 0 };
    app.innerHTML = `
      <section class="trackhead">
        <h1>Drills</h1>
        <p>Endless generated problems, each with a worked solution. Speed comes from repetition: aim for accuracy first, then speed.</p>
        <nav class="tabs">${tabs}</nav>
      </section>
      <section class="practice reviewcard">
        <p class="note">${esc(DR.DRILLS[kind].blurb)}</p>
        <div class="mstatus" id="dstat"></div>
        <pre class="question" id="dq"></pre>
        <form class="answer-row" id="dform"><input class="answer" id="da" aria-label="Your answer" autocomplete="off" spellcheck="false"><button class="btn">Check</button></form>
        <div id="dres" class="result" aria-live="polite"></div>
        <div class="nextrow" id="dnext" hidden><button class="btn" id="dnb">Next problem → (Enter)</button></div>
      </section>`;
    let prob = null;
    let answered = false;
    const stat = () => {
      document.getElementById('dstat').textContent = `This session: ${session.right}/${session.total} · streak ${session.streak} · best streak ${st.best}`;
    };
    const next = () => {
      prob = DR.DRILLS[kind].make(Math.random);
      answered = false;
      document.getElementById('dq').textContent = prob.question;
      document.getElementById('dres').className = 'result';
      document.getElementById('dres').textContent = '';
      document.getElementById('dnext').hidden = true;
      const a = document.getElementById('da');
      a.value = '';
      a.focus();
      stat();
    };
    document.getElementById('dform').onsubmit = (e) => {
      e.preventDefault();
      const a = document.getElementById('da');
      if (answered) return next();
      if (!a.value.trim()) return;
      answered = true;
      const ok = DR.check(prob, a.value);
      session.total++;
      if (ok) { session.right++; session.streak++; } else session.streak = 0;
      if (session.streak > st.best) { st.best = session.streak; drillStats[kind] = st; save('codemaker.drills.v1', drillStats); }
      const res = document.getElementById('dres');
      res.className = 'result ' + (ok ? 'ok' : 'bad');
      res.textContent = (ok ? '✓ Correct. ' : `✗ Answer: ${prob.accept[0]}. `) + prob.explain;
      document.getElementById('dnext').hidden = false;
      stat();
    };
    document.getElementById('dnb').onclick = next;
    next();
  }

  // ---------- practice exams ----------
  function viewExams() {
    const cards = EX.EXAMS.map((e) => {
      const t = findTrack(e.track);
      const st = examStats[e.id];
      return `<a class="card" href="#/exam/${e.id}">
        <span class="tag">${esc(e.code)}${st ? ' · best ' + st.best + '%' : ''}</span>
        <h3>${esc(e.title)}</h3>
        <p>${e.length} questions drawn from a pool of ${EX.pool(e, tracks).length}, with options shuffled every attempt. No feedback until you submit, just like the real exam.</p>
        <small>${trackProgress(t) === t.lessons.length ? 'Stage complete, ready' : `Best after finishing ${esc(t.title)} (${trackProgress(t)}/${t.lessons.length})`}</small>
      </a>`;
    }).join('');
    app.innerHTML = `
      <section class="trackhead">
        <h1>Practice exams</h1>
        <p>Timed-style practice with results broken down by official exam domain, so you can see exactly where to study next.</p>
      </section>
      <section class="grid">${cards}</section>
      <section class="callout">
        <h3>How to use these honestly</h3>
        <ul>
          <li>The pools are small, so you'll start recognizing questions. When your score climbs because you remember the questions rather than understand them, these stop measuring readiness.</li>
          <li>Before booking a real exam, also take full-length practice exams from a large commercial question bank. A common rule of thumb is scoring 85%+ consistently on questions you haven't seen.</li>
          <li>CompTIA reports scaled scores (for example, 675/900 for A+ Core 1), which don't convert directly to a percentage.</li>
        </ul>
      </section>`;
  }

  function viewExam(id) {
    const exam = EX.EXAMS.find((e) => e.id === id);
    if (!exam) return viewNotFound();
    const qs = EX.build(exam, tracks, Math.random);
    const answers = new Array(qs.length);
    const flags = new Set();
    let i = 0;
    app.innerHTML = `
      <nav class="crumbs"><a href="#/exams">Practice exams</a> / ${esc(exam.code)}</nav>
      <section class="practice reviewcard examcard">
        <div class="mstatus" id="estat"></div>
        <div id="eq"></div>
        <div class="row">
          <button class="btn ghost" id="eprev">← Previous</button>
          <button class="btn ghost" id="eflag">Flag</button>
          <button class="btn ghost" id="enext">Next →</button>
          <button class="btn" id="esubmit">Submit exam</button>
        </div>
        <div class="palette" id="epal"></div>
      </section>`;
    const updateStatus = () => {
      const answered = answers.filter((a) => a !== undefined && a !== '').length;
      document.getElementById('estat').textContent = `Question ${i + 1} of ${qs.length} · answered ${answered} · flagged ${flags.size}`;
    };
    const render = () => {
      const q = qs[i];
      updateStatus();
      const el = document.getElementById('eq');
      if (q.type === 'input') {
        el.innerHTML = `<pre class="question">${esc(q.question)}</pre><input class="answer" id="ein" aria-label="Your answer" autocomplete="off" spellcheck="false" value="${esc(answers[i] || '')}">`;
        document.getElementById('ein').oninput = (e) => { answers[i] = e.target.value; updateStatus(); renderPal(); };
      } else {
        el.innerHTML = `<pre class="question">${esc(q.question)}</pre><div class="opts">${q.options.map((o, k) =>
          `<button class="opt ${answers[i] === k ? 'chosen-ok' : ''}" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
        el.querySelectorAll('.opt').forEach((b) => {
          b.onclick = () => { answers[i] = Number(b.dataset.k); render(); };
        });
      }
      document.getElementById('eflag').textContent = flags.has(i) ? 'Unflag' : 'Flag';
      document.getElementById('eprev').disabled = i === 0;
      document.getElementById('enext').disabled = i === qs.length - 1;
      renderPal();
    };
    const renderPal = () => {
      document.getElementById('epal').innerHTML = qs.map((q, k) => {
        const a = answers[k] !== undefined && answers[k] !== '';
        return `<button class="pal ${a ? 'ans' : ''} ${flags.has(k) ? 'flag' : ''} ${k === i ? 'cur' : ''}" data-k="${k}" aria-label="Question ${k + 1}">${k + 1}</button>`;
      }).join('');
      document.querySelectorAll('.pal').forEach((b) => { b.onclick = () => { i = Number(b.dataset.k); render(); }; });
    };
    document.getElementById('eprev').onclick = () => { if (i > 0) { i--; render(); } };
    document.getElementById('enext').onclick = () => { if (i < qs.length - 1) { i++; render(); } };
    document.getElementById('eflag').onclick = () => { flags.has(i) ? flags.delete(i) : flags.add(i); render(); };
    document.getElementById('esubmit').onclick = () => {
      const left = qs.length - answers.filter((a) => a !== undefined && a !== '').length;
      if (left && !confirm(`${left} question(s) unanswered. Submit anyway?`)) return;
      showResults(exam, qs, answers);
    };
    render();
  }

  function showResults(exam, qs, answers) {
    const r = EX.grade(exam, qs, answers);
    const st = examStats[exam.id] || { best: 0, history: [] };
    st.best = Math.max(st.best, r.pct);
    st.history = (st.history || []).concat([{ pct: r.pct, at: Date.now() }]).slice(-10);
    examStats[exam.id] = st;
    save('codemaker.exams.v1', examStats);
    const rows = Object.values(r.byDomain).map((d) => {
      const pct = d.total ? Math.round((d.correct / d.total) * 100) : null;
      return `<li class="drow"><div class="dname">${esc(d.name)} <small>(${d.weight}% of exam)</small></div>
        <div class="bar" role="img" aria-label="${pct === null ? 'not sampled' : pct + '%'}"><span style="width:${pct || 0}%" class="${pct !== null && pct < 70 ? 'weak' : ''}"></span></div>
        <small>${pct === null ? 'not sampled this attempt' : `${d.correct}/${d.total} · ${pct}%`}</small></li>`;
    }).join('');
    const missed = qs.map((q, k) => ({ q, a: answers[k] })).filter((x) => !EX.isCorrect(x.q, x.a));
    const show = (q, a) => (a === undefined || a === '' ? '(no answer)' : q.type === 'input' ? a : q.options[a]);
    const right = (q) => (q.type === 'input' ? q.accept[0] : q.options[q.answer]);
    const weakest = Object.values(r.byDomain).filter((d) => d.total).sort((a, b) => a.correct / a.total - b.correct / b.total)[0];
    app.innerHTML = `
      <nav class="crumbs"><a href="#/exams">Practice exams</a> / Results</nav>
      <section class="trackhead">
        <h1>${esc(exam.title)}: ${r.pct}%</h1>
        <p>${r.correct} of ${r.total} correct. Best so far: ${st.best}%. ${weakest ? `Weakest domain this attempt: <strong>${esc(weakest.name)}</strong>. Study that first.` : ''}</p>
        <p class="row"><a class="btn" href="#/exam/${exam.id}" id="retake">Retake (new shuffle)</a> <a class="btn ghost" href="#/track/${exam.track}">Back to lessons</a></p>
      </section>
      <section class="practice reviewcard"><h2>By domain</h2><ul class="domainlist">${rows}</ul></section>
      <section class="practice reviewcard"><h2>Missed questions (${missed.length})</h2>
        ${missed.length ? missed.map((x) => `<div class="missed"><pre class="question">${esc(x.q.question)}</pre>
          <p><span class="badtxt">Your answer:</span> ${esc(show(x.q, x.a))}<br><span class="oktxt">Correct:</span> ${esc(right(x.q))}</p>
          <p class="note">${esc(x.q.explain)}</p></div>`).join('') : '<p>None. Excellent.</p>'}
      </section>`;
    // Re-render even though the hash may be unchanged.
    document.getElementById('retake').onclick = (e) => { e.preventDefault(); viewExam(exam.id); };
    window.scrollTo(0, 0);
  }


  // ---------- generated practice ----------
  // Renders one generated item. cb(correct, hinted) is called once per answer.
  function renderPracticeItem(el, item, cb) {
    const hintBtn = item.hint ? '<button class="btn ghost small" data-act="hint">Hint (won’t count)</button>' : '';
    const solBtn = '<button class="btn ghost small" data-act="sol">Show worked solution (won’t count)</button>';
    let body = `<pre class="question">${esc(item.prompt)}</pre>`;
    if (item.shell) body += '<div class="terminal" data-term></div><p class="note">This sandbox was generated just for this problem. Investigate, then type your answer below.</p>';
    if (item.kind === 'choice') {
      body += `<div class="opts">${item.options.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
    } else {
      body += '<form class="answer-row"><input class="answer" aria-label="Your answer" autocomplete="off" spellcheck="false"><button class="btn">Check</button></form>';
    }
    body += `<div class="row helpers">${hintBtn}${solBtn}</div><div class="helpbox" aria-live="polite"></div>`;
    el.innerHTML = body;
    let hinted = false;
    let answered = false;
    const help = el.querySelector('.helpbox');
    el.querySelectorAll('[data-act]').forEach((b) => {
      b.onclick = () => {
        hinted = true;
        help.className = 'helpbox shown';
        help.textContent = b.dataset.act === 'hint' ? 'Hint: ' + item.hint : 'Worked solution: ' + item.solution;
      };
    });
    if (item.shell) {
      const t = mountTerminal(el.querySelector('[data-term]'), new CM.Shell(item.shell));
      setTimeout(() => t.input.focus(), 0);
    }
    const done = (resp) => {
      if (answered) return;
      answered = true;
      el.querySelectorAll('.opt, .answer-row button, .answer').forEach((x) => { x.disabled = true; });
      cb(PR.check(item, resp), hinted, resp);
    };
    if (item.kind === 'choice') {
      el.querySelectorAll('.opt').forEach((b) => {
        b.onclick = () => {
          const k = Number(b.dataset.k);
          b.classList.add(k === item.answer ? 'chosen-ok' : 'chosen-bad');
          if (k !== item.answer) el.querySelector(`.opt[data-k="${item.answer}"]`).classList.add('chosen-ok');
          done(k);
        };
      });
    } else {
      const f = el.querySelector('.answer-row');
      const inp = f.querySelector('input');
      if (!item.shell) setTimeout(() => inp.focus(), 0);
      f.onsubmit = (e) => { e.preventDefault(); if (inp.value.trim()) done(inp.value); };
    }
  }

  function feedback(item, ok, hinted) {
    const sol = `<p class="worked"><strong>Worked solution for this problem:</strong>\n${esc(item.solution)}</p>`;
    if (ok && !hinted) return `<div class="result ok">✓ Correct, unaided. Streak +1.</div>`;
    if (ok) return `<div class="result bad">Correct, but you used help, so it doesn't count toward mastery. The next problem is new; try it unaided.</div>`;
    const right = item.kind === 'choice' ? item.options[item.answer] : item.accept[0];
    return `<div class="result bad">✗ Not this time. Answer: ${esc(right)}. Streak reset.</div>${sol}`;
  }

  function viewMasteryLesson(t, idx) {
    const l = t.lessons[idx];
    const cfg = PMAP[l.id];
    const next = t.lessons[idx + 1];
    const already = !!done[l.id];
    const session = new PR.Session(cfg.gens, cfg.need);
    app.innerHTML = `
      <nav class="crumbs"><a href="#/track/${t.id}">${esc(t.title)}</a> / Lesson ${idx + 1} of ${t.lessons.length}</nav>
      <div class="lesson">
        <article class="explain">
          <h1>${esc(l.title)}</h1>
          ${l.body}
          <p class="note">The examples above show the method. Practice problems are generated fresh every time, so you're applying the idea to new cases, not recalling these examples.</p>
        </article>
        <section class="practice">
          <div class="steps"><span class="stp on" id="st1">1 · Practice to mastery</span>${cfg.explain ? '<span class="stp" id="st2">2 · Explain it</span>' : ''}</div>
          <div class="meter" id="meter" aria-live="polite"></div>
          <div id="pitem"></div>
          <div id="pfb"></div>
          <div class="nextrow" id="pnext" hidden><button class="btn" id="pnb">Next problem → (Enter)</button></div>
          <div id="pexplain"></div>
          <div class="nextrow" id="pdone" hidden>${next ? `<a class="btn" href="#/lesson/${t.id}/${next.id}">Next lesson: ${esc(next.title)} →</a>` : afterTrack(t)}</div>
        </section>
      </div>`;
    const meter = document.getElementById('meter');
    const drawMeter = () => {
      const dots = Array.from({ length: cfg.need }, (_, i) => `<span class="dot ${i < session.streak ? 'on' : ''}"></span>`).join('');
      meter.innerHTML = `<div class="dots">${dots}</div><small>${session.streak}/${cfg.need} correct in a row, unaided${already ? ' · already mastered (extra practice)' : ''} · ${session.correct}/${session.attempts} overall</small>`;
    };
    const itemEl = document.getElementById('pitem');
    const fb = document.getElementById('pfb');
    const nextRow = document.getElementById('pnext');
    let waiting = false;
    function ask() {
      fb.innerHTML = '';
      nextRow.hidden = true;
      waiting = false;
      const item = session.next();
      drawMeter();
      renderPracticeItem(itemEl, item, (ok, hinted, resp) => {
        if (hinted) session.useHint();
        const res = session.answer(resp);
        drawMeter();
        fb.innerHTML = feedback(item, ok, hinted);
        if (res.mastered) return mastered();
        nextRow.hidden = false;
        waiting = true;
        document.getElementById('pnb').focus();
      });
    }
    document.getElementById('pnb').onclick = ask;
    const keyNext = (e) => { if (e.key === 'Enter' && waiting && !e.target.closest('.term-in') && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); ask(); } };
    document.addEventListener('keydown', keyNext);
    window.addEventListener('hashchange', () => document.removeEventListener('keydown', keyNext), { once: true });

    function mastered() {
      itemEl.innerHTML = '';
      fb.innerHTML = `<div class="result ok"><strong>Mastered.</strong> ${cfg.need} new problems in a row, unaided.</div>`;
      if (!cfg.explain) return finish();
      document.getElementById('st1').classList.remove('on');
      document.getElementById('st2').classList.add('on');
      const ex = cfg.explain;
      const ph = document.getElementById('pexplain');
      ph.innerHTML = `
        <h2>Explain it in your own words</h2>
        <pre class="question">${esc(ex.prompt)}</pre>
        <textarea class="explainbox" id="ebox" rows="6" placeholder="Write your explanation. Aim for 2–4 sentences."></textarea>
        <div class="row"><button class="btn" id="ecmp" disabled>Compare with a strong answer</button><small id="ecount"></small></div>
        <div id="echeck"></div>`;
      const box = document.getElementById('ebox');
      const btn = document.getElementById('ecmp');
      const MIN = 80;
      box.oninput = () => {
        const n = box.value.trim().length;
        btn.disabled = n < MIN;
        document.getElementById('ecount').textContent = n < MIN ? `${MIN - n} more characters` : 'Ready';
      };
      box.oninput();
      box.focus();
      btn.onclick = () => {
        btn.disabled = true;
        box.readOnly = true;
        document.getElementById('echeck').innerHTML = `
          <p>A strong explanation covers these points. Tick the ones your answer genuinely covered:</p>
          <ul class="checklist">${ex.points.map((pt, i) => `<li><label><input type="checkbox" data-i="${i}"> ${esc(pt)}</label></li>`).join('')}</ul>
          <p class="note">This isn't auto-graded. Be honest: anything you missed is what to re-read.</p>
          <button class="btn" id="efin">Finish lesson</button>`;
        document.getElementById('efin').onclick = () => {
          const ticked = document.querySelectorAll('.checklist input:checked').length;
          finish(ticked, ex.points.length);
        };
      };
    }
    function finish(ticked, total) {
      markDone(l.id);
      const msg = total !== undefined && ticked < total ? ` You covered ${ticked}/${total} points. Re-read the parts you missed; these questions will come back in Review.` : '';
      document.getElementById('pexplain').insertAdjacentHTML('beforeend', `<div class="result ok">✓ Lesson complete.${esc(msg)}</div>`);
      document.getElementById('pdone').hidden = false;
    }
    ask();
  }

  // ---------- mixed practice (interleaved across finished lessons) ----------
  function viewMixed() {
    const pool = [];
    tracks.forEach((t) => t.lessons.forEach((l) => { if (done[l.id] && PMAP[l.id]) PMAP[l.id].gens.forEach((g) => pool.push({ g, l, t })); }));
    if (!pool.length) {
      app.innerHTML = '<section class="trackhead"><h1>Mixed practice</h1><p>Finish a lesson with practice problems first. Mixed practice then shuffles problems from everything you’ve mastered, so you have to recognize WHICH principle applies, not just how to apply it.</p><p><a class="btn" href="#/">Back to your path</a></p></section>';
      return;
    }
    const N = 10;
    let i = 0;
    let right = 0;
    let lastG = null;
    app.innerHTML = `
      <section class="trackhead"><h1>Mixed practice</h1>
        <p>${N} new problems drawn from everything you've mastered, in random order. Mixing topics forces you to identify which principle applies, which is the skill exams and real incidents test (interleaving; Rohrer & Taylor, 2007).</p></section>
      <section class="practice reviewcard">
        <div class="mstatus" id="mxs"></div>
        <div id="mxi"></div><div id="mxf"></div>
        <div class="nextrow" id="mxn" hidden><button class="btn" id="mxb">Next →</button></div>
      </section>`;
    const st = document.getElementById('mxs');
    function ask() {
      document.getElementById('mxf').innerHTML = '';
      document.getElementById('mxn').hidden = true;
      if (i >= N) {
        document.getElementById('mxi').innerHTML = `<div class="result ${right >= 8 ? 'ok' : 'bad'}"><strong>${right}/${N}</strong> correct and unaided.</div><p class="row"><button class="btn" id="mxagain">Another set</button> <a class="btn ghost" href="#/">Back to path</a></p>`;
        document.getElementById('mxagain').onclick = viewMixed;
        st.textContent = 'Set complete';
        return;
      }
      let pickd;
      do { pickd = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && pickd.g === lastG);
      lastG = pickd.g;
      const item = PR.make(pickd.g);
      st.textContent = `Problem ${i + 1} of ${N} · ${right} right so far (topic hidden until you answer)`;
      renderPracticeItem(document.getElementById('mxi'), item, (ok, hinted) => {
        if (ok && !hinted) right++;
        i++;
        document.getElementById('mxf').innerHTML = feedback(item, ok, hinted) + `<p class="note">Topic: ${esc(item.topic)}, from "${esc(pickd.l.title)}" (${esc(pickd.t.title)})</p>`;
        document.getElementById('mxn').hidden = false;
      });
    }
    document.getElementById('mxb').onclick = ask;
    ask();
  }


  // ---------- projects (learning by building) ----------
  function pjProgress(p) {
    const st = pjState[p.id] || {};
    const n = p.milestones.filter((m) => (st.passed || {})[m.id]).length;
    return { n, total: p.milestones.length, complete: n === p.milestones.length, assisted: !!st.assisted };
  }
  function projectCards(list) {
    return list.map((p) => {
      const pr = pjProgress(p);
      const after = findTrack(p.after);
      const pct = Math.round((pr.n / pr.total) * 100);
      return `<a class="card project" href="#/project/${p.id}">
        <span class="tag">${esc(p.level)}${pr.complete ? ' · ✓ built' : ''}${pr.assisted ? ' (assisted)' : ''}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.concepts.join(' · '))}</p>
        <div class="bar" role="progressbar" aria-label="${esc(p.title)} milestones" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
        <small>${pr.n}/${pr.total} milestones${after ? ` · pairs with ${esc(after.title)}` : ''}</small>
      </a>`;
    }).join('');
  }
  function viewProjects() {
    app.innerHTML = `
      <section class="trackhead">
        <h1>Projects</h1>
        <p>Real tools, written by you, in Python. Each project is a job at Harborview Logistics, built in milestones. Hidden tests run your code against <strong>new random data every time</strong>, so the only way to pass is a solution that genuinely works. Python runs inside the app, fully offline.</p>
      </section>
      <section class="grid">${projectCards(PJ.projects)}</section>`;
  }

  function viewProject(id) {
    const p = PJ.projects.find((x) => x.id === id);
    if (!p) return viewNotFound();
    const st = pjState[p.id] = pjState[p.id] || { passed: {}, attempts: 0 };
    const idx = PJ.projects.indexOf(p);
    const nextP = PJ.projects[idx + 1];
    app.innerHTML = `
      <nav class="crumbs"><a href="#/projects">Projects</a> / ${esc(p.level)}</nav>
      <div class="lesson projectlayout">
        <section class="explain">
          <h1>${esc(p.title)}</h1>
          ${p.briefing}
          <h2>Milestones</h2>
          <ol class="milestones" id="mlist"></ol>
          <p class="note">Concepts: ${esc(p.concepts.join(', '))}. Stuck on a concept? The matching lessons and the Sandbox are always available. Hints are per milestone; there's nothing wrong with using them, but try first.</p>
        </section>
        <section class="practice">
          <div class="edhead"><strong>solution.py</strong><small id="saved">saved on this device</small></div>
          <textarea class="code editor" id="ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python code editor"></textarea>
          <div class="row">
            <button class="btn" id="btest">Run hidden tests ▶</button>
            <button class="btn ghost" id="brun">Just run my code</button>
            <button class="btn ghost small" id="breset">Reset to starter</button>
          </div>
          <div id="pjstatus" class="result" aria-live="polite"></div>
          <pre class="pyout" id="pjout" aria-label="Output"></pre>
          <details class="refsol"><summary>Stuck for good? Show a reference solution (marks the project as assisted)</summary><div id="refbox"></div></details>
          <div class="nextrow" id="pjnext" hidden>${nextP ? `<a class="btn" href="#/project/${nextP.id}">Next project: ${esc(nextP.title)} →</a>` : '<a class="btn" href="#/projects">All projects</a>'}</div>
        </section>
      </div>`;
    const ed = document.getElementById('ed');
    ed.value = pjCode(p.id, p.starter);
    let saveT = null;
    ed.addEventListener('input', () => { clearTimeout(saveT); saveT = setTimeout(() => savePjCode(p.id, ed.value), 300); });
    ed.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const a = ed.selectionStart;
        ed.value = ed.value.slice(0, a) + '    ' + ed.value.slice(ed.selectionEnd);
        ed.selectionStart = ed.selectionEnd = a + 4;
        savePjCode(p.id, ed.value);
      } else if (e.key === 'Enter') {
        // keep the current line's indentation, and indent after a colon
        const a = ed.selectionStart;
        const lineStart = ed.value.lastIndexOf('\n', a - 1) + 1;
        const line = ed.value.slice(lineStart, a);
        let ind = (line.match(/^\s*/) || [''])[0];
        if (/:\s*$/.test(line)) ind += '    ';
        e.preventDefault();
        ed.value = ed.value.slice(0, a) + '\n' + ind + ed.value.slice(ed.selectionEnd);
        ed.selectionStart = ed.selectionEnd = a + 1 + ind.length;
        savePjCode(p.id, ed.value);
      }
    });
    let lastResults = null;
    function drawMilestones() {
      document.getElementById('mlist').innerHTML = p.milestones.map((m, i) => {
        const ok = st.passed[m.id];
        const r = lastResults && lastResults[m.id];
        const fails = r && !r.passed && r.msgs && r.msgs.length ? `<pre class="failmsg">${esc(r.msgs.join('\n\n'))}</pre>` : '';
        return `<li class="ms ${ok ? 'ok' : r ? 'bad' : ''}">
          <div><span class="msmark">${ok ? '✓' : r ? '✗' : '○'}</span> <code>${esc(m.title)}</code></div>
          <p>${esc(m.desc)}</p>${fails}
          <details><summary>Hint</summary><p>${esc(p.hints[i])}</p></details>
        </li>`;
      }).join('');
    }
    drawMilestones();
    const status = document.getElementById('pjstatus');
    const out = document.getElementById('pjout');
    const busy = (b) => ['btest', 'brun'].forEach((k) => { document.getElementById(k).disabled = b; });
    async function go(withTests) {
      savePjCode(p.id, ed.value);
      busy(true);
      status.className = 'result';
      status.textContent = 'Running… (the first run starts Python, which takes a couple of seconds)';
      out.textContent = '';
      try {
        const seed = Math.floor(Math.random() * 1e9);
        const r = await CM.runPython(withTests ? PJ.program(p, ed.value, seed) : ed.value);
        if (!withTests) {
          out.textContent = r.stdout + (r.error ? '\n' + r.error : '');
          status.className = r.error ? 'result bad' : 'result';
          status.textContent = r.error ? 'Your code raised an error (see the last lines of the output).' : 'Ran without errors. Use "Run hidden tests" to check the milestones.';
          return;
        }
        st.attempts = (st.attempts || 0) + 1;
        const res = PJ.parseResults(p, r.stdout);
        out.textContent = res.userOut.trim() + (r.error ? '\n' + r.error : '');
        if (!res.ran) {
          status.className = 'result bad';
          status.textContent = 'The tests could not run. Usually that’s a syntax error, or code that crashes before your functions are defined. Read the error in the output.';
          return;
        }
        lastResults = res.results;
        p.milestones.forEach((m) => { if (res.results[m.id].passed) st.passed[m.id] = true; });
        savePj();
        drawMilestones();
        const now = p.milestones.filter((m) => res.results[m.id].passed).length;
        if (now === p.milestones.length) {
          status.className = 'result ok';
          status.textContent = `✓ All ${now} milestones pass on fresh random data. You built a working tool.${st.assisted ? ' (Assisted: try rebuilding it from scratch later.)' : ''}`;
          document.getElementById('pjnext').hidden = false;
        } else {
          status.className = 'result bad';
          status.textContent = `${now}/${p.milestones.length} milestones pass this run. Failing milestones show what was expected vs what your code returned, on the left.`;
        }
      } catch (e) {
        status.className = 'result bad';
        status.textContent = e.message;
      } finally {
        busy(false);
      }
    }
    document.getElementById('btest').onclick = () => go(true);
    document.getElementById('brun').onclick = () => go(false);
    document.getElementById('breset').onclick = () => {
      if (confirm('Replace your code with the original starter? Your current code will be lost.')) { ed.value = p.starter; savePjCode(p.id, ed.value); }
    };
    document.querySelector('.refsol').addEventListener('toggle', (e) => {
      if (!e.target.open) return;
      st.assisted = true;
      savePj();
      document.getElementById('refbox').innerHTML = `<pre class="question">${esc(p.reference)}</pre><p class="note">Read it, close it, then write your own version from memory. Typing it in without understanding it teaches very little.</p>`;
    });
    if (pjProgress(p).complete) document.getElementById('pjnext').hidden = false;
  }


  // ---------- study notes (in-depth, per lesson) ----------
  const STUDY = CM.study || {};
  function studyHtml(lid) {
    const n = STUDY[lid];
    const list = (arr) => `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    return `
      ${n.sections.map((sec) => `<section class="studysec"><h2>${esc(sec.h)}</h2>${sec.html}</section>`).join('')}
      ${n.misconceptions && n.misconceptions.length ? `<section class="studysec"><h2>Common misconceptions</h2>${list(n.misconceptions)}</section>` : ''}
      ${n.examTraps && n.examTraps.length ? `<section class="studysec"><h2>Exam traps</h2>${list(n.examTraps)}</section>` : ''}
      ${n.onTheJob ? `<section class="studysec"><h2>On the job</h2><p>${esc(n.onTheJob)}</p></section>` : ''}
      ${n.checks && n.checks.length ? `<section class="studysec"><h2>Reasoning checks</h2><p class="note">New situations, not the examples above. Pick an answer and read why EVERY option is right or wrong.</p>
        ${n.checks.map((c, ci) => `<div class="rcheck" data-ci="${ci}"><pre class="question">${esc(c.q)}</pre><div class="opts">${c.options.map((o, oi) => `<button class="opt" data-oi="${oi}">${esc(o)}</button>`).join('')}</div><div class="whys"></div></div>`).join('')}</section>` : ''}
      ${n.sources && n.sources.length ? `<section class="studysec"><h2>Sources and further reading</h2><ul>${n.sources.map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a></li>`).join('')}</ul></section>` : ''}`;
  }
  // Adds Overview / Study tabs to a lesson's explanation panel when notes exist.
  function enhanceWithStudy(lid) {
    const n = STUDY[lid];
    const art = document.querySelector('article.explain');
    if (!n || !art) return;
    const h1 = art.querySelector('h1');
    const overview = document.createElement('div');
    while (h1.nextSibling) overview.appendChild(h1.nextSibling);
    const study = document.createElement('div');
    study.className = 'studybody';
    study.hidden = true;
    study.innerHTML = studyHtml(lid);
    const tabs = document.createElement('nav');
    tabs.className = 'tabs lessontabs';
    tabs.innerHTML = '<button class="tab on" data-t="o">Overview</button><button class="tab" data-t="s">Study notes (in depth)</button>';
    art.append(tabs, overview, study);
    tabs.querySelectorAll('.tab').forEach((b) => {
      b.onclick = () => {
        tabs.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === b));
        overview.hidden = b.dataset.t !== 'o';
        study.hidden = b.dataset.t !== 's';
      };
    });
    study.querySelectorAll('.rcheck').forEach((box) => {
      const c = n.checks[Number(box.dataset.ci)];
      box.querySelectorAll('.opt').forEach((b) => {
        b.onclick = () => {
          const oi = Number(b.dataset.oi);
          box.querySelectorAll('.opt').forEach((x, k) => {
            x.disabled = true;
            if (k === c.answer) x.classList.add('chosen-ok');
            else if (k === oi) x.classList.add('chosen-bad');
          });
          box.querySelector('.whys').innerHTML = `<div class="result ${oi === c.answer ? 'ok' : 'bad'}">${oi === c.answer ? '✓ Correct.' : '✗ Not quite. The correct answer is highlighted.'}</div>
            <ul class="whylist">${c.options.map((o, k) => `<li class="${k === c.answer ? 'right' : ''}"><strong>${esc(o)}</strong>: ${esc(c.why[k])}</li>`).join('')}</ul>`;
        };
      });
    });
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
      a.classList.toggle('active', h ? parts[0] === h || (h === 'missions' && parts[0] === 'mission') || (h === 'projects' && parts[0] === 'project') || (h === 'exams' && parts[0] === 'exam') : !parts.length || parts[0] === 'track' || parts[0] === 'lesson');
    });
    updateBadge();
    if (!parts.length) return viewHome();
    if (parts[0] === 'track') return viewTrack(parts[1]);
    if (parts[0] === 'lesson') return viewLesson(parts[1], parts[2]);
    if (parts[0] === 'review') return viewReview();
    if (parts[0] === 'missions') return viewMissions();
    if (parts[0] === 'drills') return viewDrills(parts[1]);
    if (parts[0] === 'mixed') return viewMixed();
    if (parts[0] === 'projects') return viewProjects();
    if (parts[0] === 'project') return viewProject(parts[1]);
    if (parts[0] === 'exams') return viewExams();
    if (parts[0] === 'exam') return viewExam(parts[1]);
    if (parts[0] === 'mission') return viewMission(parts[1]);
    if (parts[0] === 'roadmap' || parts[0] === 'career') return viewRoadmap();
    if (parts[0] === 'sandbox') return viewSandbox();
    viewNotFound();
  }
  window.addEventListener('hashchange', route);
  route();
})();
