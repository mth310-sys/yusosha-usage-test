import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime = fs.readFileSync(new URL('../test_lupin_zero/src/character-presentation-runtime.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../test_lupin_zero/index.html', import.meta.url), 'utf8');

test('character presentation stays vector-only and presentation-only', () => {
  assert.match(runtime, /PRESENTATION_ONLY/);
  assert.match(runtime, /affectsGameLogic:\s*false/);
  assert.match(runtime, /usesExternalImages:\s*false/);
  assert.match(runtime, /exactCharacterArtworkReproduced:\s*false/);
  assert.match(runtime, /exactRealMachineSceneTimingVerified:\s*false/);
});

test('normal, wanted, raiun and bonus character scenes are present', () => {
  assert.match(runtime, /showNormal/);
  assert.match(runtime, /showWanted/);
  assert.match(runtime, /showRaiun/);
  assert.match(runtime, /showBonus/);
  assert.match(runtime, /figures\.lupin/);
  assert.match(runtime, /figures\.jigen/);
  assert.match(runtime, /figures\.goemon/);
  assert.match(runtime, /figures\.zenigata/);
});

test('GT and chance-zone screens can suppress character silhouettes', () => {
  assert.match(runtime, /GameMode\.GOLDEN_TIME/);
  assert.match(runtime, /GameMode\.TREASURE_RUSH/);
  assert.match(runtime, /GameMode\.EXTRA_BONUS/);
  assert.match(runtime, /GameMode\.GOLD_RUSH/);
  assert.match(runtime, /GameMode\.LEGEND_GATE/);
  assert.match(runtime, /GameMode\.ODOROBO_ZONE/);
  assert.match(runtime, /GameMode\.FUJIKO_ZONE/);
  assert.match(runtime, /hideAll/);
});

test('runtime is loaded after the world background layer', () => {
  const world = index.indexOf('mode-world-presentation-runtime.js');
  const characters = index.indexOf('character-presentation-runtime.js');
  const hud = index.indexOf('mode-lcd-runtime.js');
  assert.ok(world >= 0 && characters > world && hud > characters);
});
