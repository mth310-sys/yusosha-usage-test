import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { NEXT_INITIAL_HIT_TABLE } from '../test_lupin_zero/src/next-initial-hit-resolver.js';

const routeSource = await readFile(new URL('../test_lupin_zero/src/chance-eye-initial-hit-runtime.js', import.meta.url), 'utf8');
const reservationSource = await readFile(new URL('../test_lupin_zero/src/next-initial-hit-runtime.js', import.meta.url), 'utf8');
const orchestratorSource = await readFile(new URL('../test_lupin_zero/src/presentation-orchestrator.js', import.meta.url), 'utf8');

assert.deepEqual(NEXT_INITIAL_HIT_TABLE[1], { lupinBonusPercent: 98.4, goldenTimePercent: 1.6 });
assert.deepEqual(NEXT_INITIAL_HIT_TABLE[6], { lupinBonusPercent: 95.3, goldenTimePercent: 4.7 });
assert.match(routeSource, /BONUS_OR_ART_UNRESOLVED/);
assert.match(routeSource, /PRESELECTED_NEXT_INITIAL_HIT_RESERVATION/);
assert.match(routeSource, /rerollOnChanceEyeHit: false/);
assert.match(routeSource, /LUPIN_BONUS\]: 'RED'/);
assert.match(routeSource, /GOLDEN_TIME\]: 'SEVEN'/);
assert.match(routeSource, /showLiquidReelAlignment/);
assert.match(routeSource, /consumeConfirmedPresentation/);
assert.match(reservationSource, /GameMode.NORMAL, GameMode.WANTED_CHANCE/);
assert.match(orchestratorSource, /chance-eye-presented/);
console.log('lupin-zero-chance-eye-initial-hit.spec: ok');
