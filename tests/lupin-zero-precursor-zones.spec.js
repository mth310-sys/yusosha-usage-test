import assert from 'node:assert/strict';
import { PRECURSOR_ZONE_SPEC, PRECURSOR_ZONE_POLICY, resolveRizeZoneOutcome, resolveSevenZoneOutcome } from '../test_lupin_zero/src/precursor-zone-resolver.js';

const low = { nextFloat: () => 0.449999 };
const edge = { nextFloat: () => 0.45 };

assert.equal(PRECURSOR_ZONE_SPEC.rize.expectationPercent, 45);
assert.equal(resolveRizeZoneOutcome(low).hit, true);
assert.equal(resolveRizeZoneOutcome(edge).hit, false);
assert.equal(PRECURSOR_ZONE_SPEC.rize.stepUpIncreasesExpectation, true);
assert.equal(PRECURSOR_ZONE_SPEC.rize.trueRizeExists, true);
assert.equal(PRECURSOR_ZONE_SPEC.rize.trueRizeExactExpectationPercent, null);
assert.equal(PRECURSOR_ZONE_SPEC.rize.exactDurationGames, null);
assert.equal(PRECURSOR_ZONE_SPEC.rize.automaticEntryProbability, null);

const seven = resolveSevenZoneOutcome();
assert.equal(seven.hit, true);
assert.equal(seven.expectationPercent, 100);
assert.equal(seven.destination, 'GOLDEN_TIME');
assert.equal(PRECURSOR_ZONE_SPEC.seven.exactDurationGames, null);
assert.equal(PRECURSOR_ZONE_SPEC.seven.automaticEntryProbability, null);

assert.equal(PRECURSOR_ZONE_POLICY.naturalEntryImplemented, false);
assert.equal(PRECURSOR_ZONE_POLICY.rizeDurationInvented, false);
assert.equal(PRECURSOR_ZONE_POLICY.trueRizeExpectationInvented, false);
assert.equal(PRECURSOR_ZONE_POLICY.sevenDestinationVerified, true);
assert.equal(PRECURSOR_ZONE_POLICY.noSyntheticEntryProbability, true);

console.log('lupin-zero-precursor-zones.spec: ok');
