import assert from 'node:assert/strict';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';
import { LIQUID_REEL_ALIGNMENT_SPEC } from '../test_lupin_zero/src/liquid-reel-alignment-runtime.js';

assert.equal(LIQUID_REEL_ALIGNMENT_SPEC.RED.destination, GameMode.LUPIN_BONUS);
assert.equal(LIQUID_REEL_ALIGNMENT_SPEC.BLUE.destination, GameMode.RAIUN_MODE);
assert.equal(LIQUID_REEL_ALIGNMENT_SPEC.SEVEN.destination, GameMode.GOLDEN_TIME);
assert.equal(LIQUID_REEL_ALIGNMENT_SPEC.RED.evidenceStatus, 'MULTI_SOURCE_MATCH');
assert.equal(LIQUID_REEL_ALIGNMENT_SPEC.BLUE.evidenceStatus, 'MULTI_SOURCE_MATCH');
assert.equal(LIQUID_REEL_ALIGNMENT_SPEC.SEVEN.evidenceStatus, 'MULTI_SOURCE_MATCH');

const source = await import('node:fs/promises').then(fs => fs.readFile(new URL('../test_lupin_zero/src/liquid-reel-alignment-runtime.js', import.meta.url), 'utf8'));
assert.match(source, /raiun-high-game-resolved/);
assert.match(source, /showAlignment\('BLUE'\)/);
assert.match(source, /raiun-mode-art-success/);
assert.match(source, /showAlignment\('SEVEN'\)/);
assert.doesNotMatch(source, /normal-role-settled[\s\S]*showAlignment\('RED'\)/);
assert.match(source, /LIQUID_REEL_RED_ALIGNED/);
console.log('lupin-zero-liquid-reel-alignment.spec: ok');
