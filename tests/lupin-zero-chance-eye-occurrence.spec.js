import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import {
  resolveChanceEyeOccurrence,
  getChanceEyeOccurrenceWeights,
  getChanceEyeOccurrenceMass,
  CHANCE_EYE_OCCURRENCE,
  CHANCE_EYE_OCCURRENCE_POLICY
} from '../test_lupin_zero/src/chance-eye-occurrence-resolver.js';

test('normal liquid chance-eye weights preserve published denominators', () => {
  const weights = getChanceEyeOccurrenceWeights('normal');
  expect(weights.find((item) => item.kind === CHANCE_EYE_OCCURRENCE.WEAK)?.denominator).toBe(53.6);
  expect(weights.find((item) => item.kind === CHANCE_EYE_OCCURRENCE.MIDDLE)?.denominator).toBe(149.2);
  expect(weights.find((item) => item.kind === CHANCE_EYE_OCCURRENCE.STRONG)?.denominator).toBe(3857);
  expect(getChanceEyeOccurrenceMass('normal')).toBeGreaterThan(0);
  expect(getChanceEyeOccurrenceMass('normal')).toBeLessThan(1);
});

test('one liquid-display draw resolves mutually exclusive gold red blue or none', () => {
  const weights = getChanceEyeOccurrenceWeights('normal');
  const strong = weights.find((item) => item.kind === CHANCE_EYE_OCCURRENCE.STRONG);
  const middle = weights.find((item) => item.kind === CHANCE_EYE_OCCURRENCE.MIDDLE);
  const weak = weights.find((item) => item.kind === CHANCE_EYE_OCCURRENCE.WEAK);

  expect(resolveChanceEyeOccurrence(new SequenceRandomSource([0]), 'normal').kind).toBe(CHANCE_EYE_OCCURRENCE.STRONG);
  expect(resolveChanceEyeOccurrence(new SequenceRandomSource([strong.probability + 0.000001]), 'normal').kind).toBe(CHANCE_EYE_OCCURRENCE.MIDDLE);
  expect(resolveChanceEyeOccurrence(new SequenceRandomSource([strong.probability + middle.probability + 0.000001]), 'normal').kind).toBe(CHANCE_EYE_OCCURRENCE.WEAK);
  expect(resolveChanceEyeOccurrence(new SequenceRandomSource([strong.probability + middle.probability + weak.probability + 0.01]), 'normal').kind).toBe(CHANCE_EYE_OCCURRENCE.NONE);
});

test('liquid chance-eye occurrence remains separate from base physical role lottery', () => {
  expect(CHANCE_EYE_OCCURRENCE_POLICY.occurrenceRatesUsedDirectly).toBe(true);
  expect(CHANCE_EYE_OCCURRENCE_POLICY.coupledToBasePhysicalRoleLottery).toBe(false);
  expect(CHANCE_EYE_OCCURRENCE_POLICY.baseRoleRelationshipStatus).toBe('UNRESOLVED');
  expect(CHANCE_EYE_OCCURRENCE_POLICY.automaticNormalOccurrenceImplemented).toBe(true);
  expect(CHANCE_EYE_OCCURRENCE_POLICY.automaticWantedEntryImplemented).toBe(false);
});
