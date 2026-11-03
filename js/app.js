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
  const examStats = load('codemaker.exams.v1');
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
      <h2 class="sect">Practice tools</h2>
      <section class="grid">
        <a class="card" href="#/drills/subnet"><span class="tag">Drills</span><h3>Subnetting, binary & ports</h3><p>Endless generated problems with worked solutions. Ten minutes a day makes subnetting automatic.</p></a>
        <a class="card" href="#/exams"><span class="tag">Practice exams</span><h3>A+, Network+, Security+</h3><p>Exam-style sets with shuffled options and results by official domain, so you know what to study next.</p></a>
      </section>
      <h2 class="sect">Missions: scenarios that unlock as you progress</h2>
      <section class="grid">${missionCards()}</section>
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
    mountTerminal(document.getElementById('term'), new CM.Shell({ files: MS.shellFiles(m) }));
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
      a.classList.toggle('active', h ? parts[0] === h || (h === 'missions' && parts[0] === 'mission') || (h === 'exams' && parts[0] === 'exam') : !parts.length || parts[0] === 'track' || parts[0] === 'lesson');
    });
    updateBadge();
    if (!parts.length) return viewHome();
    if (parts[0] === 'track') return viewTrack(parts[1]);
    if (parts[0] === 'lesson') return viewLesson(parts[1], parts[2]);
    if (parts[0] === 'review') return viewReview();
    if (parts[0] === 'missions') return viewMissions();
    if (parts[0] === 'drills') return viewDrills(parts[1]);
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
