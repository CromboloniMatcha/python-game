import { escapeHtml } from '../utils/dom.js';
import { runPython, warmup, pythonReady } from '../services/python.js';
import { storage } from '../services/storage.js';

const SOLVED_KEY = 'pyabyss_solved';
const LOADING = 'LOADING PYTHON... (first time only, about 10 MB)';
const norm = (s) => String(s ?? '').replace(/[ \t]+$/gm, '').replace(/\s+$/, '');
const lastLine = (s) => String(s || '').trim().split('\n').pop();

const editorHtml = (buttons) =>
  `<textarea class="ed" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>` +
  `<div class="row">${buttons}<span class="dim keys">CTRL+ENTER TO RUN</span></div><pre class="console hide"></pre>`;

// Textarea with Tab = 4 spaces, auto-indent on Enter, Ctrl/Cmd+Enter to run
function setupEditor(host, starter, onRun) {
  const ta = host.querySelector('.ed');
  ta.value = starter;
  ta.rows = Math.max(4, starter.split('\n').length + 1);
  ta.addEventListener('focus', () => warmup(), { once: true });

  const insert = (text) => {
    const s = ta.selectionStart;
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(ta.selectionEnd);
    ta.selectionStart = ta.selectionEnd = s + text.length;
  };
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insert('    ');
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onRun();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const before = ta.value.slice(0, ta.selectionStart);
      const line = before.slice(before.lastIndexOf('\n') + 1);
      insert('\n' + line.match(/^ */)[0] + (line.trimEnd().endsWith(':') ? '    ' : ''));
    }
  });
  return ta;
}

function show(con, text, isError = false) {
  con.classList.remove('hide');
  con.classList.toggle('err', isError);
  con.textContent = text;
}

// Free play: edit the code and run it (PRIMM: Investigate / Modify)
export function mountTry(el, b) {
  const host = el.querySelector('.editor');
  host.innerHTML = editorHtml('<button class="go run">&#9654; RUN</button><button class="rst">RESET</button>');
  const con = host.querySelector('.console');
  let busy = false;

  const run = async () => {
    if (busy) return;
    busy = true;
    show(con, pythonReady() ? 'RUNNING...' : LOADING);
    const r = await runPython({ code: ta.value });
    show(con, ((r.stdout ? r.stdout + '\n' : '') + (r.error || '')) || '(no output)', !r.ok);
    busy = false;
  };
  const ta = setupEditor(host, b.starter || '', run);
  host.querySelector('.run').onclick = run;
  host.querySelector('.rst').onclick = () => { ta.value = b.starter || ''; con.classList.add('hide'); };
}

// Write code and get it checked by tests (PRIMM: Make). Tests check results, not exact printing.
export function mountChallenge(el, b) {
  const host = el.querySelector('.editor');
  host.innerHTML =
    editorHtml('<button class="go chk">CHECK</button><button class="run">RUN</button><button class="hnt">HINT</button><button class="sol hide">SHOW SOLUTION</button><button class="rst">RESET</button>') +
    '<div class="results"></div>';
  const con = host.querySelector('.console');
  const results = host.querySelector('.results');
  let busy = false;
  let fails = 0;

  const solvedIds = () => storage.get(SOLVED_KEY, {});
  const badge = () => { if (b.id && solvedIds()[b.id]) results.innerHTML = '<div class="good">SOLVED BEFORE. Try it again if you like.</div>'; };

  const run = async () => {
    if (busy) return;
    busy = true;
    show(con, pythonReady() ? 'RUNNING...' : LOADING);
    const r = await runPython({ code: ta.value, pre: b.tests[0]?.pre || '' });
    show(con, ((r.stdout ? r.stdout + '\n' : '') + (r.error || '')) || '(no output)', !r.ok);
    busy = false;
  };

  const check = async () => {
    if (busy) return;
    busy = true;
    con.classList.add('hide');
    results.innerHTML = `<div class="dim">${pythonReady() ? 'CHECKING...' : LOADING}</div>`;
    let all = true;
    let html = '';
    for (const t of b.tests) {
      const r = await runPython({ code: ta.value, pre: t.pre || '', test: t.test || '' });
      const got = r.ok ? (t.test ? r.testOut : r.stdout) : lastLine(r.error);
      const ok = r.ok && norm(got) === norm(t.expect);
      if (!ok) all = false;
      const label = [t.pre ? t.pre.replace(/\n/g, '; ') : '', t.test ? lastLine(t.test) : ''].filter(Boolean).join(' then ') || 'your output';
      html += `<div class="tr ${ok ? 'pass' : 'fail'}"><b>${ok ? 'PASS' : 'FAIL'}</b><code>${escapeHtml(label)}</code>` +
        (ok ? '' : `<div>expected <code>${escapeHtml(t.expect)}</code> got <code>${escapeHtml(got || '(nothing)')}</code></div>`) + '</div>';
    }
    if (all) {
      if (b.id) storage.set(SOLVED_KEY, { ...solvedIds(), [b.id]: true });
      html += `<div class="good">ALL TESTS PASSED - SOLVED!</div><p class="dim">Compare with a model solution:</p><pre class="code">${escapeHtml(b.solution)}</pre>`;
    } else if (++fails >= 3) {
      host.querySelector('.sol').classList.remove('hide');
    }
    results.innerHTML = html;
    busy = false;
  };

  const ta = setupEditor(host, b.starter || '', check);
  host.querySelector('.chk').onclick = check;
  host.querySelector('.run').onclick = run;
  host.querySelector('.rst').onclick = () => { ta.value = b.starter || ''; con.classList.add('hide'); results.innerHTML = ''; };
  host.querySelector('.hnt').onclick = () => {
    results.innerHTML = `<div class="note tip"><b>HINT</b>${escapeHtml(b.hint || 'Re-read the lesson examples and try again.')}</div>`;
  };
  host.querySelector('.sol').onclick = () => {
    results.innerHTML = `<p class="dim">Study it, then close it and type it yourself:</p><pre class="code">${escapeHtml(b.solution)}</pre>`;
  };
  badge();
}
