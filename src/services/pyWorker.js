/* Classic web worker that runs Python with Pyodide.
   Keep it a classic worker (not type: 'module'): it uses importScripts. */
const PYODIDE_VERSION = '0.26.3'; // bump here to upgrade Python
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
importScripts(BASE + 'pyodide.js');

let py = null;
let out = [];

// Keep only the user-facing part of a Python traceback and fix line numbers
function clean(message, offset) {
  const lines = String(message).split('\n');
  const i = lines.findIndex((l) => l.includes('File "<exec>"'));
  const kept = i >= 0 ? ['Traceback (most recent call last):', ...lines.slice(i)] : lines;
  return kept
    .join('\n')
    .trim()
    .replace(/File "<exec>", line (\d+)/g, (m, n) => `File "<your code>", line ${Math.max(1, Number(n) - offset)}`);
}

(async () => {
  try {
    py = await loadPyodide({ indexURL: BASE });
    py.setStdout({ batched: (s) => out.push(s) });
    py.setStderr({ batched: (s) => out.push(s) });
    postMessage({ type: 'ready' });
  } catch (err) {
    postMessage({ type: 'fatal', error: String(err) });
  }
})();

// { id, code, pre, test }
//   pre  = setup code run before the learner's code (keeps line numbers correct)
//   test = code run after the learner's code in the same namespace (checks results)
self.onmessage = async (e) => {
  const { id, code, pre, test } = e.data;
  const offset = pre ? pre.split('\n').length : 0;
  const globals = py.globals.get('dict')();
  out = [];
  try {
    await py.runPythonAsync((pre ? pre + '\n' : '') + code, { globals });
    const stdout = out.join('\n');
    out = [];
    if (test) {
      try {
        await py.runPythonAsync(test, { globals });
      } catch (err) {
        postMessage({ id, ok: false, stdout, error: clean(err.message, 0) });
        return;
      }
      postMessage({ id, ok: true, stdout, testOut: out.join('\n') });
    } else {
      postMessage({ id, ok: true, stdout });
    }
  } catch (err) {
    postMessage({ id, ok: false, stdout: out.join('\n'), error: clean(err.message, offset) });
  } finally {
    globals.destroy();
  }
};
