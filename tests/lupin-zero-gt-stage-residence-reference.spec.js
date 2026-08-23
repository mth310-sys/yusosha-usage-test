import test from 'node:test';
import assert from 'node:assert/strict';
import { GT_STAGE_RESIDENCE_REFERENCE, getGtStageResidenceReference } from '../test_lupin_zero/src/gt-stage-residence-reference.js';

test('published GT stage residence ratios are retained for all settings', () => {
  assert.deepEqual(getGtStageResidenceReference(1), { JAPAN: 38.9, SWITZERLAND: 40.1, CARIBBEAN: 14.8, UNDERGROUND_CITY: 6.1 });
  assert.deepEqual(getGtStageResidenceReference(2), { JAPAN: 39.6, SWITZERLAND: 40.0, CARIBBEAN: 14.3, UNDERGROUND_CITY: 6.0 });
  assert.deepEqual(getGtStageResidenceReference(3), { JAPAN: 38.7, SWITZERLAND: 40.2, CARIBBEAN: 15.0, UNDERGROUND_CITY: 6.2 });
  assert.deepEqual(getGtStageResidenceReference(4), { JAPAN: 37.8, SWITZERLAND: 39.9, CARIBBEAN: 15.6, UNDERGROUND_CITY: 6.7 });
  assert.deepEqual(getGtStageResidenceReference(5), { JAPAN: 34.4, SWITZERLAND: 39.9, CARIBBEAN: 16.7, UNDERGROUND_CITY: 7.1 });
  assert.deepEqual(getGtStageResidenceReference(6), { JAPAN: 36.1, SWITZERLAND: 39.9, CARIBBEAN: 16.8, UNDERGROUND_CITY: 7.1 });
});

test('stage residence table is validation-only and does not add another runtime lottery', () => {
  assert.equal(GT_STAGE_RESIDENCE_REFERENCE.purpose, 'VALIDATION_REFERENCE_ONLY');
  assert.equal(GT_STAGE_RESIDENCE_REFERENCE.affectsRuntimeSelection, false);
});
