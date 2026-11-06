/*
 * py-worker.js — runs Python (bundled Pyodide) in a background thread so a
 * learner's infinite loop can't freeze the app; the page stops this worker
 * if a run takes too long. Message in: {id, code}; out: {id, stdout, error}.
 */
/* global importScripts, loadPyodide */
importScripts('../vendor/pyodide/pyodide.js');
const ready = loadPyodide({ indexURL: '../vendor/pyodide/' });

self.onmessage = async (e) => {
  const { id, code } = e.data;
  let out = '';
  try {
    const py = await ready;
    py.setStdout({ batched: (s) => { out += s + '\n'; } });
    py.setStderr({ batched: (s) => { out += s + '\n'; } });
    const ns = py.globals.get('dict')(); // fresh namespace for each run
    try {
      await py.runPythonAsync(code, { globals: ns });
    } finally {
      ns.destroy();
    }
    self.postMessage({ id, stdout: out, error: null });
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    // Keep the meaningful end of a Python traceback.
    self.postMessage({ id, stdout: out, error: msg.trim().split('\n').slice(-3).join('\n') });
  }
};
