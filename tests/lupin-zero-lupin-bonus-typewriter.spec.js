import assert from 'node:assert/strict';
import { LUPIN_BONUS_TYPEWRITER_SPEC, applyLupinBonusTypewriterGuarantee } from '../test_lupin_zero/src/lupin-bonus-typewriter-resolver.js';

assert.equal(LUPIN_BONUS_TYPEWRITER_SPEC.highChanceZoneExists, true);
assert.equal(LUPIN_BONUS_TYPEWRITER_SPEC.highChanceEntryRateKnown, false);
assert.equal(LUPIN_BONUS_TYPEWRITER_SPEC.typewriterOccurrenceGuaranteesArt, true);
assert.equal(LUPIN_BONUS_TYPEWRITER_SPEC.exactTypewriterOccurrenceRateKnown, false);
assert.equal(LUPIN_BONUS_TYPEWRITER_SPEC.exactPerRoleArtLotteryKnown, false);

const miss = Object.freeze({ artHit: false, successDestination: null, evidenceStatus: 'CALIBRATED_TO_PUBLISHED_50_PERCENT' });
const upgraded = applyLupinBonusTypewriterGuarantee(miss);
assert.equal(upgraded.artHit, true);
assert.equal(upgraded.successDestination, 'GOLDEN_TIME');
assert.equal(upgraded.guaranteedBy, 'LUPIN_BONUS_TYPEWRITER');
assert.equal(upgraded.evidenceStatus, 'TYPEWRITER_ART_GUARANTEE');

const alreadyHit = Object.freeze({ artHit: true, successDestination: 'GOLDEN_TIME', evidenceStatus: 'CALIBRATED_TO_PUBLISHED_50_PERCENT' });
assert.equal(applyLupinBonusTypewriterGuarantee(alreadyHit), alreadyHit);

console.log('lupin-zero-lupin-bonus-typewriter.spec: ok');
