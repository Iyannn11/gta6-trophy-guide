# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Iyannn11/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Iyannn11/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, no online trophies.

## What it is

A static web app under `app/` — no build step, no network at run time. Open `app/index.html` in desktop Chrome with the network off and it works: it loads only its own files.

- **Every trophy** with its official name, description and grade exactly as PlayStation publishes them, plus a step-by-step guide written in the author's own words, a difficulty rating (1–5), a time estimate, a practical tip, and the sources each fact comes from (named beside the guide: Exophase, PSNProfiles, GTABase, PlanetGTA6, Games.gg).
- **Tracker**: tick trophies off in the checklist; progress saves in the browser (localStorage) and can be exported to a file and imported back, or reset.
- **Stats dashboard**: completion % per grade and per kind, estimated hours remaining from the un-earned trophies, and a “next best trophy” suggestion — the easiest un-earned trophy first.
- **Filters**: search, grade, kind (story, collectibles, activities, combat, exploration, economy, secret), missable-only, earned-only, and a spoiler setting that hides the names and descriptions of un-earned hidden story trophies until they are earned.
- **Roadmap to the platinum**: five stages in play order, each with its own checklist of trophies, so you can tick progress off stage by stage.
- **Missable policy, stated honestly**: PlayStation has not published a verified missable list, so this guide does not invent one. Only two trophies are flagged “possible” — Hot Together and Retail Therapy — because both need your partner beside you, and partner availability is tied to the story. Do them in chapters 2–3.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`. Two runs write the same bytes.

## Files

- `app/index.html` — the page
- `app/style.css` — the Vice-neon look, grade-coloured trophy medallions
- `app/app.js` — checklist, dashboard, roadmap, filters, spoiler setting, export/import
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, kind, roadmap stage, missable flag, difficulty, time estimate, guide, steps, tip, sources
- `screenshots/` — renders of the real app in headless Chromium
- `main.ts` — the hand-in program
- `serve.ts` — the kit's static server
- `vendor/makefun-frontend.ts` — make.fun's dossier library, unchanged from the kit

## Note

An unofficial fan guide. Grand Theft Auto and GTA are trademarks of Rockstar Games; this guide uses no Rockstar logo, artwork or game screenshots.
