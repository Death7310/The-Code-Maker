/*
 * python-runner.js — lazily loads Pyodide (CPython compiled to WebAssembly)
 * and runs learner code inside the browser tab. Code cannot reach the
 * learner's filesystem. Needs an internet connection the first time.
 */
(function (root) {
  'use strict';
  const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  let loading = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load the Python runtime (are you offline?)'));
      document.head.appendChild(s);
    });
  }

  function getPyodide() {
    if (!loading) {
      loading = loadScript(PYODIDE_URL + 'pyodide.js').then(() => root.loadPyodide({ indexURL: PYODIDE_URL }));
      loading.catch(() => { loading = null; });
    }
    return loading;
  }

  // Returns {stdout, error}
  async function runPython(code) {
    const py = await getPyodide();
    let out = '';
    py.setStdout({ batched: (s) => { out += s + '\n'; } });
    py.setStderr({ batched: (s) => { out += s + '\n'; } });
    try {
      // Fresh namespace for each run so earlier runs don't leak state.
      const ns = py.globals.get('dict')();
      await py.runPythonAsync(code, { globals: ns });
      ns.destroy();
      return { stdout: out, error: null };
    } catch (e) {
      const msg = String(e.message || e);
      // Keep just the last meaningful lines of the traceback.
      const tail = msg.trim().split('\n').slice(-3).join('\n');
      return { stdout: out, error: tail };
    }
  }

  root.CM = root.CM || {};
  root.CM.runPython = runPython;
})(window);
