import assert from 'node:assert/strict';
import { VERIFIED_SPEC, getNormalRoleDenominator } from '../test_lupin_zero/src/verified-spec.js';
import { getKnownNormalRoleWeights } from '../test_lupin_zero/src/normal-role-resolver.js';
import { resolveLegendGateTrigger } from '../test_lupin_zero/src/legend-gate-resolver.js';

assert.equal(getNormalRoleDenominator('RUPIN_REPLAY_A', 1), 1400);
assert.equal(getNormalRoleDenominator('RUPIN_REPLAY_B', 1), 8000);
assert.equal(getNormalRoleDenominator('RUPIN_REPLAY_C', 1), 8000);
assert.equal(getNormalRoleDenominator('PREMIUM', 1), 65536);
assert.equal(getNormalRoleDenominator('PREMIUM', 5), 32768);
assert.equal(getNormalRoleDenominator('PREMIUM', 6), 32768);
assert.equal(getNormalRoleDenominator('LEGEND', 1), 65536);
assert.equal(getNormalRoleDenominator('LEGEND', 5), 32768);
assert.equal(getNormalRoleDenominator('LEGEND', 6), 21845.3);

assert.equal(VERIFIED_SPEC.rupinReplay.reversePushCutIn, true);
assert.equal(VERIFIED_SPEC.rupinReplay.A.stopPattern, 'ONE_LUPIN_SYMBOL');
assert.equal(VERIFIED_SPEC.rupinReplay.B.stopPattern, 'CENTER_AND_RIGHT_LUPIN_SYMBOLS');
assert.equal(VERIFIED_SPEC.rupinReplay.C.stopPattern, 'LEFT_AND_RIGHT_LUPIN_SYMBOLS');
assert.equal(VERIFIED_SPEC.rupinReplay.D.stopPattern, 'LUPIN_SYMBOLS_ALIGNED');
assert.equal(VERIFIED_SPEC.rupinReplay.D.longFreeze, true);
assert.equal(resolveLegendGateTrigger({ role: 'PREMIUM' }).hit, true);
assert.equal(resolveLegendGateTrigger({ role: 'LEGEND' }).hit, true);
assert.equal(resolveLegendGateTrigger({ role: 'RUPIN_REPLAY_A' }).hit, false);

const roles = getKnownNormalRoleWeights(6).map(x => x.role);
assert.equal(roles.includes('RUPIN_REPLAY_A'), true);
assert.equal(roles.includes('RUPIN_REPLAY_B'), true);
assert.equal(roles.includes('RUPIN_REPLAY_C'), true);
console.log('lupin-zero-rupin-replay.spec: ok');
