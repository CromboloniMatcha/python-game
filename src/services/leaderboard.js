import { STORAGE_KEYS } from '../config.js';
import { storage } from './storage.js';

export const getBestDepth = () => storage.get(STORAGE_KEYS.abyssBest, 0);

// Today: local only. Later: also POST to the backend when a user is logged in.
export async function submitScore(depth) {
  if (depth > getBestDepth()) storage.set(STORAGE_KEYS.abyssBest, depth);
}

export async function getTopScores(/* limit = 50 */) { return []; }
