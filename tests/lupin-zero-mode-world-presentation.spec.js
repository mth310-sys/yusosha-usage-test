import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../test_lupin_zero/src/mode-world-presentation-runtime.js', import.meta.url), 'utf8');

assert.match(source, /evidenceStatus: 'PRESENTATION_ONLY'/);
assert.match(source, /affectsGameLogic: false/);
assert.match(source, /usesExternalImages: false/);
assert.match(source, /drawNormal/);
assert.match(source, /drawWanted/);
assert.match(source, /drawRaiun/);
assert.match(source, /drawCz/);
assert.match(source, /drawBonus/);
assert.match(source, /hideForGt/);
assert.match(source, /GameMode\.GOLDEN_TIME/);
assert.match(source, /GameMode\.TREASURE_RUSH/);
assert.match(source, /GameMode\.EXTRA_BONUS/);
assert.doesNotMatch(source, /credit\s*=/);
assert.doesNotMatch(source, /kernelState\s*=/);

console.log('mode world presentation boundary ok');
