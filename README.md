# PyAbyss

Pixel-art web game that teaches Python from beginner to expert.
**Learn** by tier, or **dive** into the endless Abyss where every right answer takes you deeper and the questions get harder.

## Run it
Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs ./dist (static files)
npm run preview  # test the production build
```

Deploy `dist/` for free on Cloudflare Pages, Netlify or GitHub Pages.

## Project structure
```
pyabyss/
├─ index.html              page markup
├─ public/                 static assets (favicon)
├─ docs/ROADMAP.md         phases and TODOs
└─ src/
   ├─ main.js              entry point
   ├─ config.js            game constants (MAX_LEVEL, tiers, oxygen...)
   ├─ styles/              base.css (theme, layout), components.css
   ├─ data/questions/      one file per tier + index.js
   ├─ game/                learn.js, abyss.js, ocean.js (canvas)
   ├─ ui/                  quiz.js (question renderer), tabs.js
   ├─ services/            storage, auth (stub), leaderboard (stub)
   └─ utils/               dom.js, random.js
```

## Adding questions
Open the file for the tier in `src/data/questions/` and add an object:

```js
{ code: `print(1 + 1)`, answer: '2', wrong: ['11', '1', 'Error'], explain: 'Why it is 2.' }
```

## Scaling to 1011+ levels
Raise `MAX_LEVEL` in `src/config.js`. Questions repeat after a tier's pool is used up, so grow the bank accordingly.
