// Leonida Platinum — hand-in program (Node 22, standard library only).
//
// It copies this repository's app/ and screenshots/ into the hand-in directory
// and writes dossier.json there with buildDossier from vendor/makefun-frontend.ts.
// The hand-in directory is MAKEFUN_OUTPUT_DIR when set, else /output.
// The program is deterministic: two runs on the same repository write the
// same bytes, because it first clears any previous hand-in and then copies
// the same files in the same way.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The bounty gate's own caps, as RULES.txt states them: the dossier text is
// capped at 160 KiB, screenshots at 4 images of 256 KiB, app/ at 993 entries
// and 48 MiB, and no app/ path over 1,000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function handInDir() {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim() !== '') return fromEnv;
  return '/output';
}

function clearPrevious(outDir) {
  // Remove only the hand-in's own outputs, so a stale run can never leak
  // files from an earlier state of the repository into the new dossier.
  for (const name of ['app', 'screenshots', 'dossier.json']) {
    const target = join(outDir, name);
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  }
}

function main() {
  const repoRoot = dirname(fileURLToPath(import.meta.url));
  const outDir = handInDir();
  mkdirSync(outDir, { recursive: true });
  clearPrevious(outDir);
  cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log('handed in ' + outDir + ' (' + dossier.length + ' dossier bytes)');
}

main();
