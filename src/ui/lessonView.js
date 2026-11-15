import { escapeHtml } from '../utils/dom.js';
import { shuffle } from '../utils/random.js';
import { mountTry, mountChallenge } from './exercises.js';

// `code` inside text becomes <code>
const inline = (s) => escapeHtml(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const caption = (b) => (b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : '');

// Interactive blocks are looked up by id when mounted
const registry = [];
const register = (b) => registry.push(b) - 1;

const RENDERERS = {
  h: (b) => `<h3>${inline(b.text)}</h3>`,
  p: (b) => `<p>${inline(b.text)}</p>`,
  list: (b) => `<ul>${b.items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`,
  code: (b) =>
    `<pre class="code">${escapeHtml(b.code)}</pre>` +
    (b.output != null ? `<pre class="out">${escapeHtml(b.output)}</pre>` : ''),
  tip: (b) => `<div class="note tip"><b>TIP</b>${inline(b.text)}</div>`,
  warn: (b) => `<div class="note warn"><b>WATCH OUT</b>${inline(b.text)}</div>`,
  varbox: (b) =>
    `<figure class="fig"><div class="varbox"><span class="vn">${escapeHtml(b.name)}</span><span class="vv">${escapeHtml(b.value)}</span></div>${caption(b)}</figure>`,
  cells: (b) =>
    `<figure class="fig"><div class="cells">${b.items
      .map((x, i) => `<div class="cell"><small>${i}</small><span>${escapeHtml(x)}</span><small>${i - b.items.length}</small></div>`)
      .join('')}</div>${caption(b)}</figure>`,
  image: (b) =>
    `<figure class="fig"><img src="${escapeHtml(b.src)}" alt="${escapeHtml(b.alt || '')}">${caption(b)}</figure>`,

  // names -> values diagram: rows: [{ names: ['a', 'b'], value: '[1, 2]' }]
  names: (b) =>
    `<figure class="fig">${b.rows
      .map((r) => `<div class="nrow"><span>${r.names.map((n) => `<i class="tag">${escapeHtml(n)}</i>`).join('')}</span><span class="arr">&rarr;</span><span class="obj">${escapeHtml(r.value)}</span></div>`)
      .join('')}${caption(b)}</figure>`,

  // line-by-line trace table: rows: [[code, what happens], ...]
  trace: (b) =>
    `<table class="trace"><tr><th>CODE</th><th>WHAT HAPPENS</th></tr>${b.rows
      .map(([c, s]) => `<tr><td><code>${escapeHtml(c)}</code></td><td>${inline(s)}</td></tr>`)
      .join('')}</table>`,

  // common mistake: wrong code vs right code + why
  mistake: (b) =>
    `<div class="note mis"><b>COMMON MISTAKE - ${inline(b.title)}</b><div class="two"><div><small class="bad">WRONG</small><pre class="code wr">${escapeHtml(b.wrong)}</pre></div><div><small class="good">RIGHT</small><pre class="code rt">${escapeHtml(b.right)}</pre></div></div>${inline(b.why)}</div>`,

  // PRIMM: predict first, then reveal the real output
  predict: (b) =>
    `<div class="ex" data-ex="${register(b)}" data-kind="predict"><b class="exh">PREDICT FIRST</b><p>${inline(b.ask || 'What will this print? Decide before you look.')}</p><pre class="code">${escapeHtml(b.code)}</pre><div class="options">${b.options
      .map((o, i) => `<button data-i="${i}">${escapeHtml(o)}</button>`)
      .join('')}</div><div class="feedback"></div></div>`,

  // Parsons problem: tap shuffled lines into the right order
  parsons: (b) =>
    `<div class="ex" data-ex="${register(b)}" data-kind="parsons"><b class="exh">ARRANGE THE CODE</b><p>${inline(b.goal)}</p><div class="pool"></div><div class="built"></div><div class="row"><button class="go chk">CHECK</button><button class="rst">RESET</button></div><div class="feedback"></div></div>`,
  // Python editor: free play (modify and run)
  try: (b) =>
    `<div class="ex py" data-ex="${register(b)}" data-kind="try"><b class="exh">TRY IT - EDIT AND RUN</b><p>${inline(b.goal || 'Change the code and run it. What happens?')}</p><div class="editor"></div></div>`,

  // Python editor with automatic tests (Make)
  challenge: (b) =>
    `<div class="ex py" data-ex="${register(b)}" data-kind="challenge"><b class="exh">YOUR TURN - WRITE THE CODE</b><p>${inline(b.goal)}</p><div class="editor"></div></div>`,
};

export const renderBlocks = (blocks) => blocks.map((b) => (RENDERERS[b.type] ? RENDERERS[b.type](b) : '')).join('');

// Wire up interactive blocks after the HTML is in the page
export function mountBlocks(root) {
  root.querySelectorAll('[data-ex]').forEach((el) => {
    const b = registry[+el.dataset.ex];
    const mount = { predict: mountPredict, parsons: mountParsons, try: mountTry, challenge: mountChallenge }[el.dataset.kind];
    mount(el, b);
  });
}

function mountPredict(el, b) {
  const fb = el.querySelector('.feedback');
  const buttons = [...el.querySelectorAll('.options button')];
  let locked = false;
  buttons.forEach((btn) => {
    btn.onclick = () => {
      if (locked) return;
      locked = true;
      const ok = +btn.dataset.i === b.answer;
      buttons[b.answer].classList.add('ok');
      if (!ok) btn.classList.add('no');
      fb.innerHTML =
        `<pre class="out">${escapeHtml(b.output)}</pre>` +
        `<div class="${ok ? 'good' : 'bad'}">${ok ? 'YOUR PREDICTION MATCHED.' : 'NOT QUITE - compare it with your guess.'} ${inline(b.explain)}</div>`;
    };
  });
}

function mountParsons(el, b) {
  const poolEl = el.querySelector('.pool');
  const builtEl = el.querySelector('.built');
  const fb = el.querySelector('.feedback');
  let pool = [];
  let built = [];

  const lineButton = (item, from) => {
    const x = document.createElement('button');
    x.className = 'pl';
    x.textContent = item.t;
    x.onclick = () => {
      const src = from === 'pool' ? pool : built;
      const dst = from === 'pool' ? built : pool;
      src.splice(src.indexOf(item), 1);
      dst.push(item);
      draw();
    };
    return x;
  };
  const draw = () => {
    poolEl.replaceChildren(...pool.map((o) => lineButton(o, 'pool')));
    builtEl.replaceChildren(...built.map((o) => lineButton(o, 'built')));
    builtEl.classList.toggle('empty', !built.length);
  };
  const reset = () => {
    pool = shuffle([...b.lines, ...(b.distractors || [])].map((t) => ({ t })));
    built = [];
    fb.innerHTML = '';
    draw();
  };

  el.querySelector('.chk').onclick = () => {
    const ok = built.map((o) => o.t).join('\n') === b.lines.join('\n');
    fb.innerHTML = ok
      ? `<div class="good">CORRECT. ${inline(b.explain)}</div>` + (b.output != null ? `<pre class="out">${escapeHtml(b.output)}</pre>` : '')
      : `<div class="bad">NOT YET - check the order and the indentation.</div>`;
  };
  el.querySelector('.rst').onclick = reset;
  reset();
}
