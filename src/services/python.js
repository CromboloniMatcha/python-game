// Runs Python in a Web Worker (Pyodide). A stuck program is killed after a timeout
// and the worker restarts on the next run, so the page never freezes.
const DEFAULT_TIMEOUT_MS = 8000;

let worker = null;
let ready = null;
let loaded = false;
let seq = 0;
const pending = new Map();

function start() {
  loaded = false;
  worker = new Worker(new URL('./pyWorker.js', import.meta.url));
  ready = new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'ready') { loaded = true; resolve(); }
      else if (m.type === 'fatal') reject(new Error(m.error));
      else if (pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); p(m); }
    };
    worker.onerror = (e) => reject(new Error(e.message || 'worker failed to start'));
  });
  ready.catch(() => {});
  return ready;
}

export const pythonReady = () => loaded;

// Start downloading Python in the background (call when the learner focuses an editor)
export function warmup() {
  if (!worker) start();
  return ready;
}

/** Returns { ok, stdout, testOut?, error? } and never throws. */
export async function runPython({ code, pre = '', test = '', timeoutMs = DEFAULT_TIMEOUT_MS }) {
  if (!worker) start();
  try {
    await ready;
  } catch (err) {
    worker = null;
    return { ok: false, stdout: '', error: `Could not load Python. Check your internet connection.\n${err.message}` };
  }
  const id = ++seq;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      worker.terminate();
      worker = null; ready = null; loaded = false;
      resolve({ ok: false, stdout: '', error: `TimeoutError: your code ran for more than ${timeoutMs / 1000} seconds (infinite loop?).` });
    }, timeoutMs);
    pending.set(id, (m) => { clearTimeout(timer); resolve(m); });
    worker.postMessage({ id, code, pre, test });
  });
}
