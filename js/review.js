/*
 * review.js — spaced retrieval practice (a simple Leitner system).
 *
 * Questions from completed lessons enter box 1. A correct answer moves an
 * item up a box and pushes its next review further out. A wrong answer
 * sends it back to box 1. This applies the spacing effect (Cepeda et al., 2006)
 * and retrieval practice (Roediger & Karpicke, 2006).
 */
(function (root) {
  'use strict';
  const DAY = 24 * 60 * 60 * 1000;
  // Days until the next review once an item reaches each box (index = box).
  const INTERVALS = [0, 1, 3, 7, 14, 30];
  const MAX_BOX = INTERVALS.length - 1;

  // Collect every reviewable item from completed lessons. Lessons with
  // generated practice (map) contribute one item per generator; each review
  // then shows a NEW instance, so review tests the principle, not recall.
  function collect(tracks, done, map) {
    const items = [];
    for (const t of tracks) {
      for (const l of t.lessons) {
        if (!done[l.id]) continue;
        const ex = l.exercise;
        if (map && map[l.id]) {
          map[l.id].gens.forEach((g) => items.push({ type: 'gen', gen: g, id: l.id + ':g:' + g, lesson: l.title, track: t.title }));
        } else if (ex && (ex.type === 'quiz' || ex.type === 'input')) {
          items.push(Object.assign({ id: l.id + ':ex', lesson: l.title, track: t.title }, ex));
        }
        (l.review || []).forEach((r, i) => {
          items.push(Object.assign({ type: 'quiz', id: l.id + ':r' + i, lesson: l.title, track: t.title }, r));
        });
      }
    }
    return items;
  }

  // Items due now, oldest-due first. New items (no state yet) are due immediately.
  function due(items, state, now) {
    return items
      .filter((it) => !state[it.id] || state[it.id].due <= now)
      .sort((a, b) => ((state[a.id] || { due: 0 }).due - (state[b.id] || { due: 0 }).due));
  }

  // Returns the new state entry for an item after an answer.
  function grade(entry, correct, now) {
    const box = correct ? Math.min(MAX_BOX, ((entry && entry.box) || 0) + 1) : 1;
    // A wrong answer comes back after 10 minutes, so it can be retried later in the same session.
    const wait = correct ? INTERVALS[box] * DAY : 10 * 60 * 1000;
    return { box, due: now + wait };
  }

  function normalize(s) {
    return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
  }
  function checkInput(item, answer) {
    return item.accept.some((a) => normalize(a) === normalize(answer));
  }

  const api = { collect, due, grade, checkInput, INTERVALS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CM = root.CM || {}; root.CM.review = api; }
})(typeof window !== 'undefined' ? window : globalThis);
