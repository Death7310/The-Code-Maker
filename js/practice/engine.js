/*
 * practice/engine.js — generated practice for mastery learning.
 *
 * A generator makes a NEW problem from the same principle each time, so the
 * learner has to apply the idea rather than recall a memorized example
 * (transfer of learning; Barnett & Ceci, 2002). Lessons list several
 * generators that are interleaved (Rohrer & Taylor, 2007), and a lesson
 * completes only after several consecutive unaided correct answers
 * (mastery learning; Bloom, 1984).
 *
 * Every generated item has:
 *   kind      'choice' | 'input' | 'shell'
 *   prompt    the question (plain text)
 *   options/answer (choice) or accept[] (input; shell items also answer by input)
 *   solution  a worked solution for THIS instance, shown after an attempt
 *   hint      (optional) a nudge toward the method without the answer
 *   shell     (shell items) {files, meta?, processes?} for a fresh sandbox
 *   solve     (shell items) a reference command whose output contains the answer
 */
(function (root) {
  'use strict';

  // ---------- randomness helpers ----------
  function rngFrom(seed) {
    // mulberry32: small, fast, deterministic (used by tests)
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function shuffle(r, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sample(r, arr, n) { return shuffle(r, arr).slice(0, n); }

  // Build a multiple-choice item, shuffling options and tracking the answer.
  function choice(r, prompt, correct, distractors, solution, extra) {
    const opts = shuffle(r, [correct].concat(distractors.filter((d) => d !== correct)));
    return Object.assign({ kind: 'choice', prompt, options: opts, answer: opts.indexOf(correct), solution }, extra || {});
  }
  function input(prompt, accept, solution, extra) {
    return Object.assign({ kind: 'input', prompt, accept: [].concat(accept).map(String), solution }, extra || {});
  }

  const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/,(?=\d{3}\b)/g, '').replace(/^\$/, '');
  function check(item, response) {
    if (item.kind === 'choice') return response === item.answer;
    return item.accept.some((a) => norm(a) === norm(response));
  }

  // ---------- registry ----------
  const GENS = {};
  function register(id, meta, fn) {
    if (GENS[id]) throw new Error('duplicate generator ' + id);
    GENS[id] = Object.assign({ id, make: fn }, meta);
  }
  function make(id, r) {
    const g = GENS[id];
    if (!g) throw new Error('unknown generator ' + id);
    const item = g.make(r || Math.random);
    item.gen = id;
    item.topic = g.topic;
    return item;
  }

  // ---------- mastery session ----------
  // need: consecutive unaided correct answers required. Items rotate through
  // the lesson's generators (interleaved) and never repeat the previous prompt.
  function Session(gens, need, r) {
    this.gens = gens;
    this.need = need || 4;
    this.r = r || Math.random;
    this.streak = 0;
    this.attempts = 0;
    this.correct = 0;
    this.order = [];
    this.last = null;
    this.current = null;
  }
  Session.prototype.next = function () {
    if (!this.order.length) this.order = shuffle(this.r, this.gens);
    const id = this.order.pop();
    let item;
    for (let tries = 0; tries < 8; tries++) {
      item = make(id, this.r);
      if (!this.last || item.prompt !== this.last.prompt) break;
    }
    this.last = item;
    this.current = item;
    this.hinted = false;
    return item;
  };
  Session.prototype.useHint = function () { this.hinted = true; };
  // Returns {correct, counted, mastered}
  Session.prototype.answer = function (response) {
    const ok = check(this.current, response);
    this.attempts++;
    if (ok) this.correct++;
    const counted = ok && !this.hinted;
    if (counted) this.streak++;
    else this.streak = 0;
    return { correct: ok, counted, mastered: this.streak >= this.need };
  };

  const api = { GENS, register, make, check, Session, rngFrom, int, pick, shuffle, sample, choice, input };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CM = root.CM || {}; root.CM.practice = api; }
})(typeof window !== 'undefined' ? window : globalThis);
