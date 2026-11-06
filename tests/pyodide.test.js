// The bundled Python runtime (pyodide npm dependency) must run offline and be
// able to call into the JavaScript lab simulation through a registered module.
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

test('bundled Python runs and can talk to a JS lab module', { timeout: 120000 }, async () => {
  const { loadPyodide } = require('pyodide');
  const py = await loadPyodide({ indexURL: path.join(__dirname, '..', 'node_modules', 'pyodide') + path.sep });
  py.registerJsModule('labnet', {
    scan: (host) => (host === '10.10.10.5' ? [22, 80] : []),
    banner: (h, p) => (p === 22 ? 'SSH-2.0-SimSSH' : 'HTTP/1.1 200 OK'),
  });
  let out = '';
  py.setStdout({ batched: (s) => { out += s + '\n'; } });
  await py.runPythonAsync('import labnet\nfor p in labnet.scan("10.10.10.5").to_py():\n    print(p, labnet.banner("10.10.10.5", p))\nprint(sum(range(10)))');
  assert.strictEqual(out, '22 SSH-2.0-SimSSH\n80 HTTP/1.1 200 OK\n45\n');
});
