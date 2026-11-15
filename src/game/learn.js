import { TIERS, STORAGE_KEYS } from '../config.js';
import { QUESTIONS_BY_TIER } from '../data/questions/index.js';
import { LESSONS_BY_TIER } from '../data/lessons/index.js';
import { renderQuestion } from '../ui/quiz.js';
import { renderBlocks, mountBlocks } from '../ui/lessonView.js';
import { storage } from '../services/storage.js';
import { $, escapeHtml } from '../utils/dom.js';
import { shuffle } from '../utils/random.js';

const PASS_RATIO = 0.6;   // share of correct answers needed to clear a lesson (2 of 3)
const REVIEW_SIZE = 8;    // questions in a mixed review

export function initLearn() {
  const menu = $('#learn-menu');
  const play = $('#learn-play');
  const head = $('#learn-head');
  const body = $('#learn-question');

  const done = () => storage.get(STORAGE_KEYS.lessonsDone, {});
  const markDone = (id) => storage.set(STORAGE_KEYS.lessonsDone, { ...done(), [id]: Date.now() });
  const view = (el) => { menu.classList.toggle('hide', el !== menu); play.classList.toggle('hide', el !== play); };
  const wire = (root, selector, fn) => { const b = root.querySelector(selector); if (b) b.onclick = fn; };
  const clearedLessons = () => { const d = done(); return LESSONS_BY_TIER.flat().filter((l) => d[l.id]); };

  // ---- screen 1: tiers ----
  function showTiers() {
    view(menu);
    const d = done();
    const cleared = clearedLessons().length;
    menu.innerHTML =
      `<div class="big" style="margin-bottom:10px">CHOOSE A LEVEL</div><div class="grid">` +
      TIERS.map((name, t) => {
        const ls = LESSONS_BY_TIER[t];
        const n = ls.filter((l) => d[l.id]).length;
        return `<button data-tier="${t}">${name} <span class="dim">&nbsp;${ls.length ? `${n}/${ls.length} LESSONS` : 'QUICK QUIZ'}</span></button>`;
      }).join('') +
      (cleared ? `<button class="go" data-review>REVIEW (MIXED, ${cleared} LESSON${cleared > 1 ? 'S' : ''})</button>` : '') +
      `</div>`;
    menu.querySelectorAll('[data-tier]').forEach((b) => (b.onclick = () => showTier(+b.dataset.tier)));
    wire(menu, '[data-review]', reviewQuiz);
  }

  // ---- screen 2: lessons in a tier ----
  function showTier(t) {
    view(menu);
    const d = done();
    const lessons = LESSONS_BY_TIER[t];
    menu.innerHTML =
      `<div class="big">${TIERS[t]}</div><div class="grid" style="margin-top:10px">` +
      lessons.map((l, i) => `<button data-lesson="${i}">${d[l.id] ? '[x]' : '[ ]'} ${i + 1}. ${escapeHtml(l.title)}</button>`).join('') +
      `<button data-quick>QUICK QUIZ (MIXED)</button><button data-back>&lt; BACK</button></div>`;
    menu.querySelectorAll('[data-lesson]').forEach((b) => (b.onclick = () => openLesson(t, +b.dataset.lesson)));
    wire(menu, '[data-quick]', () => quickQuiz(t));
    wire(menu, '[data-back]', showTiers);
  }

  // ---- screen 3: study + try (predict, arrange) ----
  function openLesson(t, i) {
    view(play);
    const lessons = LESSONS_BY_TIER[t];
    const lesson = lessons[i];
    head.textContent = `${TIERS[t]}  LESSON ${i + 1}/${lessons.length}`;
    body.innerHTML =
      `<div class="lesson"><h2>${escapeHtml(lesson.title)}</h2>${renderBlocks(lesson.blocks)}</div>` +
      `<div class="stack"><button class="go" data-start>START QUIZ &gt;</button><button data-back>&lt; LESSONS</button></div>`;
    mountBlocks(body);
    wire(body, '[data-start]', () => lessonQuiz(t, i));
    wire(body, '[data-back]', () => showTier(t));
  }

  // ---- screen 4: quizzes ----
  function runQuiz(label, questions, onEnd) {
    let i = 0;
    let score = 0;
    const step = () => {
      if (i >= questions.length) return onEnd(score, questions.length);
      head.textContent = `${label}  ${i + 1}/${questions.length}  SCORE ${score}`;
      renderQuestion(
        body,
        questions[i],
        (ok) => { if (ok) score++; return i === questions.length - 1 ? 'FINISH' : 'NEXT >'; },
        () => { i++; step(); },
      );
    };
    step();
  }

  function lessonQuiz(t, i) {
    const lessons = LESSONS_BY_TIER[t];
    const lesson = lessons[i];
    runQuiz(`${TIERS[t]} L${i + 1} QUIZ`, shuffle(lesson.quiz), (score, total) => {
      const pass = score >= Math.ceil(total * PASS_RATIO);
      if (pass) markDone(lesson.id);
      const hasNext = pass && i + 1 < lessons.length;
      head.textContent = `${TIERS[t]}  LESSON ${i + 1}/${lessons.length}`;
      body.innerHTML =
        `<div class="big">${pass ? 'LESSON CLEARED' : 'NOT YET'}</div><p>SCORE ${score}/${total}</p><div class="stack">` +
        (hasNext ? `<button class="go" data-next>NEXT LESSON &gt;</button>` : '') +
        `<button data-again>${pass ? 'REVIEW LESSON' : 'RE-READ LESSON'}</button><button data-back>&lt; LESSONS</button></div>`;
      wire(body, '[data-next]', () => openLesson(t, i + 1));
      wire(body, '[data-again]', () => openLesson(t, i));
      wire(body, '[data-back]', () => showTier(t));
    });
  }

  // Mixed retrieval practice across every cleared lesson (interleaved)
  function reviewQuiz() {
    view(play);
    const pool = shuffle(clearedLessons().flatMap((l) => l.quiz)).slice(0, REVIEW_SIZE);
    runQuiz('REVIEW', pool, (score, total) => {
      head.textContent = 'REVIEW COMPLETE';
      body.innerHTML = `<div class="big">SCORE ${score}/${total}</div><p class="dim">Mixed questions from every lesson you cleared.</p><div class="stack"><button class="go" data-back>&lt; BACK</button></div>`;
      wire(body, '[data-back]', showTiers);
    });
  }

  function quickQuiz(t) {
    runQuiz(`${TIERS[t]} QUICK`, shuffle(QUESTIONS_BY_TIER[t]), (score, total) => {
      const best = storage.get(STORAGE_KEYS.learnBest, {});
      best[t] = Math.max(best[t] || 0, score);
      storage.set(STORAGE_KEYS.learnBest, best);
      head.textContent = `${TIERS[t]} QUICK QUIZ COMPLETE`;
      body.innerHTML = `<div class="big">SCORE ${score}/${total}</div><p class="dim">BEST ${best[t]}/${total}</p><div class="stack"><button class="go" data-back>&lt; BACK</button></div>`;
      wire(body, '[data-back]', () => showTier(t));
    });
  }

  showTiers();
}
