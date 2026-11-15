export const MAX_LEVEL = 1011;      // raise later (e.g. 10101101) once the question bank is big enough
export const METERS_PER_LEVEL = 10;
export const MAX_OXYGEN = 3;

export const TIERS = ['BEGINNER', 'NOVICE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
// Abyss level at which each tier begins
export const TIER_START = [0, 10, 30, 70, 150];

export const STORAGE_KEYS = {
  learnBest: 'pyabyss_learn',
  abyssBest: 'pyabyss_best',
};
