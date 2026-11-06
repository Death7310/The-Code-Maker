/*
 * python-runner.js — runs learner Python in a Web Worker (js/py-worker.js)
 * using the Pyodide runtime bundled with the app, so it works fully offline.
 * A run that exceeds the time limit (e.g. an infinite loop) is stopped and the
 * worker is restarted, so the page never freezes.
 */
(function (root) {
  'use strict';
  const TIME_LIMIT_MS = 20000; // first run includes loading Python (~2s)
  let worker = null;
  let seq = 0;
  const pending = new Map();

  function getWorker() {
    if (worker) return worker;
    if (location.protocol === 'file:') {
      throw new Error('Python needs the app served over http(s): use the website or the Android app, or run "npm run build" and serve www/.');
    }
    worker = new Worker('js/py-worker.js');
    worker.onmessage = (e) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      clearTimeout(p.timer);
      p.resolve({ stdout: e.data.stdout, error: e.data.error });
    };
    worker.onerror = (e) => {
      const err = new Error('The Python runtime failed to start: ' + (e.message || 'unknown error'));
      pending.forEach((p) => { clearTimeout(p.timer); p.reject(err); });
      pending.clear();
      worker = null;
    };
    return worker;
  }

  // Returns {stdout, error}. Rejects only if Python can't start at all.
  function runPython(code, opts) {
    const limit = (opts && opts.timeLimit) || TIME_LIMIT_MS;
    return new Promise((resolve, reject) => {
      let w;
      try { w = getWorker(); } catch (e) { reject(e); return; }
      const id = ++seq;
      const timer = setTimeout(() => {
        pending.delete(id);
        w.terminate();
        worker = null; // a fresh worker is created on the next run
        resolve({ stdout: '', error: `Stopped: your code ran longer than ${Math.round(limit / 1000)} seconds. Check for a loop that never ends (e.g. a while loop whose condition never becomes False).` });
      }, limit);
      pending.set(id, { resolve, reject, timer });
      w.postMessage({ id, code });
    });
  }

  root.CM = root.CM || {};
  root.CM.runPython = runPython;
})(window);
