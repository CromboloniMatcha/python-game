import { escapeHtml } from '../utils/dom.js';
import { shuffle } from '../utils/random.js';

/**
 * Renders one multiple-choice question into `el`.
 * onAnswer(ok) runs once on answer and returns the label of the "next" button.
 * onNext() runs when that button is clicked.
 */
export function renderQuestion(el, q, onAnswer, onNext) {
  el.innerHTML = `<pre class="code">${escapeHtml(q.code)}</pre><div class="options"></div><div class="feedback"></div>`;
  const options = el.querySelector('.options');
  const feedback = el.querySelector('.feedback');
  let locked = false;

  shuffle([q.answer, ...q.wrong]).forEach((value) => {
    const btn = document.createElement('button');
    btn.textContent = value;
    btn.onclick = () => {
      if (locked) return;
      locked = true;
      const ok = value === q.answer;
      [...options.children].forEach((b) => { if (b.textContent === q.answer) b.classList.add('ok'); });
      if (!ok) btn.classList.add('no');

      const label = onAnswer(ok);
      feedback.innerHTML = `<div class="${ok ? 'good' : 'bad'}">${ok ? 'CORRECT' : 'WRONG'} - ${escapeHtml(q.explain)}</div>`;
      const next = document.createElement('button');
      next.className = 'go';
      next.textContent = label;
      next.onclick = onNext;
      feedback.append(next);
      next.focus();
    };
    options.append(btn);
  });
}
