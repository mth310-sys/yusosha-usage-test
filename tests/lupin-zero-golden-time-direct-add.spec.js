import assert from 'node:assert/strict';
import { GOLDEN_TIME_TREASURE_SPEC, resolveGoldenTimeTreasureAcquisition } from '../test_lupin_zero/src/golden-time-treasure-resolver.js';

const hitRandom = { nextFloat: () => 0 };
const missRandom = { nextFloat: () => 0.999999 };

assert.equal(GOLDEN_TIME_TREASURE_SPEC.directAddPresentation, 'TRIPLE_T_SYMBOL_ALIGNED');
assert.deepEqual(GOLDEN_TIME_TREASURE_SPEC.treasureVisualClasses, ['SILVER', 'GOLD']);
assert.equal(GOLDEN_TIME_TREASURE_SPEC.exactVisualClassSelectionRateKnown, false);
assert.equal(GOLDEN_TIME_TREASURE_SPEC.exactAwardDistributionKnown, false);

const hit = resolveGoldenTimeTreasureAcquisition(hitRandom, 3);
assert.equal(hit.hit, true);
assert.equal(hit.presentation, 'TRIPLE_T_SYMBOL_ALIGNED');
assert.equal(hit.treasureVisualClass, null);
assert.equal(hit.treasureVisualClassSelectionStatus, 'UNRESOLVED');
assert.equal(hit.presentationEvidenceStatus, 'PUBLISHED_ANALYSIS');

const miss = resolveGoldenTimeTreasureAcquisition(missRandom, 16.9);
assert.equal(miss.hit, false);
assert.equal(miss.presentation, null);

console.log('lupin-zero-golden-time-direct-add.spec: ok');
