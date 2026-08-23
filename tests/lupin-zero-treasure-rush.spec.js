import assert from 'node:assert/strict';
import { TREASURE_RUSH_SPEC, createTreasureRushProfile, resolveTreasureRushDuration, resolveTreasureRushGame } from '../test_lupin_zero/src/treasure-rush-resolver.js';
import { TREASURE_HUNT_SPEC, resolveGuaranteedTreasureHunt, resolveImmortalBondSuccess } from '../test_lupin_zero/src/treasure-hunt-resolver.js';

const source = (value) => ({ nextFloat: () => value });

assert.equal(TREASURE_RUSH_SPEC.minimumGames, 4);
assert.equal(TREASURE_RUSH_SPEC.maximumGames, 9);
assert.equal(TREASURE_RUSH_SPEC.publishedAverageTreasure, 499000);
assert.equal(TREASURE_RUSH_SPEC.everyGameAddsTreasure, true);
assert.equal(TREASURE_RUSH_SPEC.durationDistributionResolved, false);
assert.equal(TREASURE_RUSH_SPEC.perGameDistributionResolved, false);
assert.equal(TREASURE_RUSH_SPEC.naturalEntryRateResolved, false);
assert.deepEqual(TREASURE_RUSH_SPEC.productionModel.durationModel.counts, { 4: 5, 5: 3, 6: 2 });
assert.equal(TREASURE_RUSH_SPEC.productionModel.durationModel.sampleSize, 10);
assert.deepEqual(TREASURE_RUSH_SPEC.productionModel.durationModel.unobservedPublishedDurations, [7, 8, 9]);
assert.equal(TREASURE_RUSH_SPEC.boundaries.sevenToNineGamesRemainPossibleButUncalibrated, true);

assert.equal(resolveTreasureRushDuration(source(0)).games, 4);
assert.equal(resolveTreasureRushDuration(source(0.499999)).games, 4);
assert.equal(resolveTreasureRushDuration(source(0.5)).games, 5);
assert.equal(resolveTreasureRushDuration(source(0.799999)).games, 5);
assert.equal(resolveTreasureRushDuration(source(0.8)).games, 6);
assert.equal(resolveTreasureRushDuration(source(0.999999)).games, 6);
assert.equal(createTreasureRushProfile(source(0)).games, 4);
assert.equal(createTreasureRushProfile(source(0.6)).games, 5);
assert.equal(createTreasureRushProfile(source(0.9)).games, 6);

const model4 = TREASURE_RUSH_SPEC.productionModel.awardModelByDuration[4];
const model5 = TREASURE_RUSH_SPEC.productionModel.awardModelByDuration[5];
const model6 = TREASURE_RUSH_SPEC.productionModel.awardModelByDuration[6];
const expectedTotal = (games, model) => games * (model.low * (1 - model.highProbability) + model.high * model.highProbability);
assert.ok(Math.abs(expectedTotal(4, model4) - 499000) < 1e-6);
assert.ok(Math.abs(expectedTotal(5, model5) - 499000) < 1e-6);
assert.ok(Math.abs(expectedTotal(6, model6) - 499000) < 1e-6);
assert.equal(resolveTreasureRushGame(source(0), 4).treasure, 150000);
assert.equal(resolveTreasureRushGame(source(0.9999), 4).treasure, 100000);
assert.equal(resolveTreasureRushGame(source(0), 5).treasure, 100000);
assert.equal(resolveTreasureRushGame(source(0.9999), 5).treasure, 50000);
assert.equal(resolveTreasureRushGame(source(0), 6).treasure, 100000);
assert.equal(resolveTreasureRushGame(source(0.9999), 6).treasure, 50000);
assert.equal(TREASURE_RUSH_SPEC.productionModel.expectedTreasure, 499000);

assert.equal(TREASURE_HUNT_SPEC.unresolved.naturalEntryRate, true);
assert.equal(TREASURE_HUNT_SPEC.unresolved.treasureVsRushDestinationSplit, true);
assert.equal(resolveGuaranteedTreasureHunt('FLAME_LUPIN').minimumTreasure, 200000);
assert.equal(resolveGuaranteedTreasureHunt('FUJIKO').minimumTreasure, 300000);
assert.equal(resolveGuaranteedTreasureHunt('TAMACHAN').minimumTreasure, 1000000);
assert.equal(resolveImmortalBondSuccess().treasureRushGuaranteed, true);
assert.equal(resolveImmortalBondSuccess().artStockRateResolved, false);
console.log('lupin-zero-treasure-rush.spec: ok');
