# Roadmap

## Phase 1 - Game (current)
- [x] Learn mode (5 tiers)
- [x] Abyss endless dive
- [ ] Grow the question bank (hundreds per tier)
- [ ] New question types: fill-in-the-blank, "fix the bug", write-the-code
- [ ] Sound + more sea creatures per depth zone

## Phase 2 - Accounts & leaderboard
- Supabase (free tier): Auth, `scores` table, row-level security
- Implement `src/services/auth.js` and `src/services/leaderboard.js` (stubs exist)
- Leaderboard tab

## Phase 3 - Admin
- Admin-only dashboard to add/edit questions (move the bank from `src/data/questions` into the database)
- Basic stats (most-missed questions)
