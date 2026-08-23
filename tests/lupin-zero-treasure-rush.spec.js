import assert from 'node:assert/strict';
import { TREASURE_RUSH_SPEC, createTreasureRushProfile, resolveTreasureRushGame } from '../test_lupin_zero/src/treasure-rush-resolver.js';
import { TREASURE_HUNT_SPEC, resolveGuaranteedTreasureHunt, resolveImmortalBondSuccess } from '../test_lupin_zero/src/treasure-hunt-resolver.js';

const low = { nextFloat: () => 0 };
const high = { nextFloat: () => 0.9999 };

assert.equal(TREASURE_RUSH_SPEC.minimumGames, 4);
assert.equal(TREASURE_RUSH_SPEC.maximumGames, 9);
assert.equal(TREASURE_RUSH_SPEC.publishedAverageTreasure, 499000);
assert.equal(TREASURE_RUSH_SPEC.everyGameAddsTreasure, true);
assert.equal(TREASURE_RUSH_SPEC.durationDistributionResolved, false);
assert.equal(TREASURE_RUSH_SPEC.perGameDistributionResolved, false);
assert.equal(TREASURE_RUSH_SPEC.naturalEntryRateResolved, false);
assert.equal(createTreasureRushProfile().games, 5);
assert.equal(resolveTreasureRushGame(low).treasure, 100000);
assert.equal(resolveTreasureRushGame(high).treasure, 50000);
assert.equal(TREASURE_RUSH_SPEC.productionModel.expectedTreasure, 499000);
assert.equal(TREASURE_HUNT_SPEC.unresolved.naturalEntryRate, true);
assert.equal(TREASURE_HUNT_SPEC.unresolved.treasureVsRushDestinationSplit, true);
assert.equal(resolveGuaranteedTreasureHunt('FLAME_LUPIN').minimumTreasure, 200000);
assert.equal(resolveGuaranteedTreasureHunt('FUJIKO').minimumTreasure, 300000);
assert.equal(resolveGuaranteedTreasureHunt('TAMACHAN').minimumTreasure, 1000000);
assert.equal(resolveImmortalBondSuccess().treasureRushGuaranteed, true);
assert.equal(resolveImmortalBondSuccess().artStockRateResolved, false);
console.log('lupin-zero-treasure-rush.spec: ok');
