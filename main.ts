// Leonida Platinum — the hand-in program for the gta6-trophy-guide-01 bounty.
//
// The guide itself is plain static files in app/ (index.html, app.js,
// style.css and app/data/trophies.json): no build step, no network at run
// time, served by any static server with app/ at its root. This program
// (Node 22, standard library only) gathers the entry for the scorer: it
// copies app/ and screenshots/ next to this file into the output directory
// and writes /output/dossier.json with buildDossier from the kit's vendored
// make.fun library (vendor/makefun-frontend.ts, left untouched — the scorer
// rebuilds the dossier with its own copy and compares byte for byte).
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

function fail(message: string): never {
  throw new Error(`leonida-platinum main.ts: ${message}`);
}

if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
if (!existsSync(join(appDir, 'data', 'trophies.json'))) fail('app/data/trophies.json is missing');

// The gate allows at most 4 screenshots; refuse early rather than handing
// the scorer an entry it would reject.
const shotFiles = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => statSync(join(shotsDir, name)).isFile())
  : [];
if (shotFiles.length < 3 || shotFiles.length > 4) {
  fail(`expected 3 or 4 screenshots, found ${shotFiles.length}`);
}

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

// Same caps the scorer enforces (see the kit's RULES.txt): the dossier text
// is capped at 160 KiB, screenshots at 4 files of 256 KiB, app/ at 993
// entries and 48 MiB. Only text_max_bytes changes the bytes written; the
// rest refuse an entry the scorer would refuse.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
const dossierBytes = statSync(join(outputDir, 'dossier.json')).size;
console.log(`wrote ${join(outputDir, 'dossier.json')} (${dossierBytes} bytes; ${shotFiles.length} screenshots, ${shotFiles.join(', ')})`);
