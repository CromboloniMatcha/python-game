import beginner from './beginner.js';
import novice from './novice.js';
import intermediate from './intermediate.js';
import advanced from './advanced.js';
import expert from './expert.js';

// Index = tier number (matches TIERS in config.js)
export const QUESTIONS_BY_TIER = [beginner, novice, intermediate, advanced, expert];
