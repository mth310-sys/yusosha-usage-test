import assert from 'node:assert/strict';
import { CONFIRMED_PRESENTATION_SPEC, resolveConfirmedPresentation } from '../test_lupin_zero/src/confirmed-presentation-resolver.js';

const expected = [
  'GOLD_PRESENTATION',
  'TIGER_PATTERN',
  'RAINBOW',
  'ATTACK_VISION',
  'GOLD_HOLD',
  'TAMACHAN_HOLD',
  'TIGER_FUJIKO_HOLD'
];

assert.deepEqual(CONFIRMED_PRESENTATION_SPEC.triggers, expected);
assert.equal(CONFIRMED_PRESENTATION_SPEC.confirmedDestinationFamily, 'LUPIN_BONUS_OR_GOLDEN_TIME');
assert.equal(CONFIRMED_PRESENTATION_SPEC.exactBonusVsGoldenTimeSplitResolved, false);
assert.equal(CONFIRMED_PRESENTATION_SPEC.naturalOccurrenceRatesResolved, false);
for (const trigger of expected) {
  const result = resolveConfirmedPresentation(trigger);
  assert.equal(result.confirmed, true);
  assert.equal(result.destinationFamily, 'LUPIN_BONUS_OR_GOLDEN_TIME');
  assert.equal(result.exactDestination, null);
}
const unknown = resolveConfirmedPresentation('UNKNOWN_PRESENTATION');
assert.equal(unknown.confirmed, false);
assert.equal(unknown.destinationFamily, null);
console.log('lupin-zero-confirmed-presentation.spec: ok');
