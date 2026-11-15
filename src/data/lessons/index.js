import beginner from './beginner.js';
import novice from './novice.js';
import intermediate from './intermediate.js';

// Index = tier number (matches TIERS in config.js). Empty = quick quiz only.
export const LESSONS_BY_TIER = [beginner, novice, intermediate, [], []];
