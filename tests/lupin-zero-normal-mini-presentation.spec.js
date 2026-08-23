import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../test_lupin_zero/src/normal-mini-presentation-runtime.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../test_lupin_zero/index.html', import.meta.url), 'utf8');

test('normal mini presentations remain presentation only', () => {
  assert.match(source, /evidenceStatus: 'PRESENTATION_ONLY'/);
  assert.match(source, /affectsGameLogic: false/);
  assert.match(source, /selectionSource: 'SPIN_ID_ONLY'/);
  assert.match(source, /exactRealMachineOccurrenceRatesVerified: false/);
  assert.match(source, /exactRealMachineTimingVerified: false/);
});

test('four normal presentation patterns are available', () => {
  for (const key of ['LUPIN_ESCAPE','JIGEN_SHOT','GOEMON_SLASH','ZENIGATA_APPROACH']) assert.match(source, new RegExp(key));
});

test('wanted prioritizes Zenigata and non-normal modes do not synthesize mini patterns', () => {
  assert.match(source, /mode === GameMode\.WANTED_CHANCE/);
  assert.match(source, /mode !== GameMode\.NORMAL/);
  assert.match(source, /raiunHighGamesRemaining > 0/);
});

test('presentation loads after character layer and before mode LCD', () => {
  const character = index.indexOf('character-presentation-runtime.js');
  const mini = index.indexOf('normal-mini-presentation-runtime.js');
  const lcd = index.indexOf('mode-lcd-runtime.js');
  assert.ok(character >= 0 && mini > character && lcd > mini);
});
