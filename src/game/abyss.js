import { MAX_LEVEL, MAX_OXYGEN, METERS_PER_LEVEL, TIERS, TIER_START } from '../config.js';
import { QUESTIONS_BY_TIER } from '../data/questions/index.js';
import { renderQuestion } from '../ui/quiz.js';
import { getBestDepth, submitScore } from '../services/leaderboard.js';
import { createOcean } from './ocean.js';
import { $ } from '../utils/dom.js';
import { pick } from '../utils/random.js';

const tierOf = (level) => TIER_START.reduce((t, start, i) => (level >= start ? i : t), 0);

export function initAbyss() {
  const ocean = createOcean($('#ocean'));
  const startBox = $('#abyss-start');
  const playBox = $('#abyss-play');
  let run = null;

  function renderHud() {
    if (!run) return;
    $('#hud-depth').textContent = `DEPTH ${run.level * METERS_PER_LEVEL}M  LV ${run.level}/${MAX_LEVEL}`;
    $('#hud-oxygen').textContent = 'O2 ' + '\u25A0'.repeat(run.oxygen) + '\u25A1'.repeat(MAX_OXYGEN - run.oxygen);
    $('#hud-tier').textContent = TIERS[tierOf(run.level)];
  }

  function showStart(message = '') {
    playBox.classList.add('hide');
    startBox.classList.remove('hide');
    startBox.innerHTML = message || `
      <div class="big">DIVE INTO THE ABYSS</div>
      <p class="dim">Each right answer takes you ${METERS_PER_LEVEL}m deeper and the questions get harder. Wrong answers drain oxygen. Run out and you surface.</p>
      <button class="go" id="dive">DIVE &gt;</button>
      <p class="dim">BEST: ${getBestDepth()}M</p>`;
    $('#dive').onclick = dive;
  }

  function dive() {
    run = { level: 0, oxygen: MAX_OXYGEN, used: TIERS.map(() => []) };
    ocean.reset();
    startBox.classList.add('hide');
    playBox.classList.remove('hide');
    renderHud();
    nextQuestion();
  }

  function nextQuestion() {
    if (run.level >= MAX_LEVEL) return finish(true);
    const tier = tierOf(run.level);
    const pool = QUESTIONS_BY_TIER[tier];
    let fresh = pool.filter((q) => !run.used[tier].includes(q));
    if (!fresh.length) { run.used[tier] = []; fresh = pool; }
    const q = pick(fresh);
    run.used[tier].push(q);

    renderQuestion(
      $('#abyss-question'),
      q,
      (ok) => {
        if (ok) { run.level++; ocean.setLevel(run.level); } else run.oxygen--;
        renderHud();
        return run.oxygen <= 0 ? 'SURFACE' : ok ? 'SWIM DEEPER >' : 'TRY AGAIN >';
      },
      () => (run.oxygen <= 0 ? finish(false) : nextQuestion()),
    );
  }

  async function finish(won) {
    const depth = run.level * METERS_PER_LEVEL;
    await submitScore(depth);
    showStart(`
      <div class="big">${won ? 'YOU REACHED THE ABYSS FLOOR' : 'OUT OF OXYGEN'}</div>
      <p>DEPTH REACHED: ${depth}M</p>
      <p class="dim">BEST: ${getBestDepth()}M</p>
      <p class="dim">Leaderboard saving comes with login (next phase).</p>
      <button class="go" id="dive">DIVE AGAIN &gt;</button>`);
  }

  showStart();
}
