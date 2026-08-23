import assert from 'node:assert/strict';
import { RUPIN_REPLAY_BENEFIT_SPEC, getRupinReplayBenefit, RUPIN_REPLAY_BENEFIT_POLICY } from '../test_lupin_zero/src/rupin-replay-benefit-spec.js';

for (const key of ['A','B','C']) {
  const spec = RUPIN_REPLAY_BENEFIT_SPEC[key];
  assert.equal(spec.guaranteedBonus, false);
  assert.equal(spec.guaranteedArt, false);
  assert.equal(spec.guaranteedLegendGate, false);
  assert.equal(spec.exactDownstreamLotteryKnown, false);
}

assert.equal(RUPIN_REPLAY_BENEFIT_SPEC.D.guaranteedArt, true);
assert.equal(RUPIN_REPLAY_BENEFIT_SPEC.D.guaranteedLegendGate, true);
assert.equal(RUPIN_REPLAY_BENEFIT_SPEC.D.longFreeze, true);
assert.equal(getRupinReplayBenefit('RUPIN_REPLAY_A').role, 'RUPIN_REPLAY_A');
assert.equal(getRupinReplayBenefit('PREMIUM').role, 'PREMIUM');
assert.equal(getRupinReplayBenefit('REPLAY'), null);
assert.equal(RUPIN_REPLAY_BENEFIT_POLICY.abcAutomaticBonusOrArtLotteryImplemented, false);
assert.equal(RUPIN_REPLAY_BENEFIT_POLICY.abcGuaranteedDestinationInvented, false);
assert.equal(RUPIN_REPLAY_BENEFIT_POLICY.dLongFreezeAndLegendGateConnected, true);

console.log('lupin-zero-rupin-replay-benefit.spec: ok');
