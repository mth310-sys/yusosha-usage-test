import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../test_lupin_zero/src/liquid-reel-alignment-runtime.js', import.meta.url), 'utf8');
assert.match(source, /RED: Object\.freeze\(\{ label: '赤図柄揃い', symbol: '赤', destination: GameMode\.LUPIN_BONUS/);
assert.match(source, /BLUE: Object\.freeze\(\{ label: '青図柄揃い', symbol: '青', destination: GameMode\.RAIUN_MODE/);
assert.match(source, /SEVEN: Object\.freeze\(\{ label: '7揃い', symbol: '7', destination: GameMode\.GOLDEN_TIME/);
assert.match(source, /raiun-high-game-resolved/);
assert.match(source, /showAlignment\('BLUE'\)/);
assert.match(source, /raiun-mode-art-success/);
assert.match(source, /showAlignment\('SEVEN'\)/);
assert.doesNotMatch(source, /normal-role-settled[\s\S]*showAlignment\('RED'\)/);
assert.match(source, /LIQUID_REEL_RED_ALIGNED/);
assert.match(source, /MULTI_SOURCE_MATCH/);
console.log('lupin-zero-liquid-reel-alignment.spec: ok');
