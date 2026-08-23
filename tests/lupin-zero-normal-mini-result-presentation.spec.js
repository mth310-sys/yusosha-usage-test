import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../test_lupin_zero/src/normal-mini-presentation-runtime.js', import.meta.url), 'utf8');

assert.match(source, /selectionSource: 'SPIN_ID_ONLY'/);
assert.match(source, /resultSource: 'RESOLVED_EVENT_ONLY'/);
assert.match(source, /affectsGameLogic: false/);
assert.match(source, /role === 'PREMIUM' \|\| role === 'LEGEND' \|\| role === 'MB'/);
assert.match(source, /role === 'REPLAY'/);
assert.match(source, /GameMode\.ODOROBO_ZONE, GameMode\.FUJIKO_ZONE/);
assert.match(source, /finish\('CHANCE', \{ role: 'CHANCE_EYE' \}\)/);
assert.match(source, /normal-mini-presentation-finished/);

console.log('lupin-zero normal mini result presentation boundary locked');
