[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Iyannn11/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Iyannn11/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA VI Trophy Guide & Tracker

A complete offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze), built for the make.fun bounty `gta6-trophy-guide-01`.

## What it is

- **Every trophy, with its official name, description and grade** exactly as PlayStation publishes them (via Exophase and PSNProfiles, 18 Nov 2026). 28 of the 55 are hidden on PlayStation until earned — this guide flags them.
- **A guide in our own words for every trophy**: what to do, where, how, and when it can be missed — with its sources cited beside it (GTABase, PlanetGTA6, Games.gg, GTADB, GTA BOOM). No guide text is copied from another guide.
- **A roadmap to the platinum** in 5 stages, built from the official descriptions: story chapters and missions first, then side missions, collectibles and activities, then robberies, money and cleanup — ending with 100% completion and the platinum.
- **Missable flags**, honestly labelled: no verified missable list exists yet, so the guide flags the two trophies that carry a real warning (Positive Mental Attitude, Actions Speak Louder) and says so.
- **A tracker**: tick trophies off and progress is saved in localStorage; export it to a file and import it back. Filters by kind (story, missable, collectibles, activities, online), by grade, and by earned-only; a spoiler setting hides the names and descriptions of hidden story trophies until they are earned.

## Run it

Static files under `app/` — no build step, no network at run time:

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

Open `app/index.html` in desktop Chrome with the network off and it works.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Exophase and PSNProfiles — the official 55-trophy list (names, descriptions, grades, hidden flags)
- [GTABase — GTA 6 Trophy Guide & Achievements List](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series)
- [PlanetGTA6 — GTA 6 Trophies](https://www.planetgta6.com/en/gta-6-trophies/)
- [Games.gg — GTA 6 Trophy List](https://games.gg/grand-theft-auto-vi/guides/complete-grand-theft-auto-6-trophy-list/)
- [GTADB — GTA 6 PS5 Trophies & Platinum Guide](https://gtadb.net/articles/gta-6-trophies-platinum-guide/?show_secrets=1)
- [GTA BOOM — GTA 6 Trophy and Achievement List](https://www.gtaboom.com/every-gta-6-trophy-and-achievement-at-launch-and-how-to-unlock-them-fc5f)

This guide is unofficial and not affiliated with Rockstar Games. No Rockstar logo, artwork or game imagery is used; the look is our own.

## License

MIT — see `LICENSE`.
