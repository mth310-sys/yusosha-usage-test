import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import {
  REVENGE_CHANCE_SPEC,
  getRevengePullbackPercent,
  resolveRevengePullback
} from '../test_lupin_zero/src/revenge-chance-resolver.js';
import { GameMode, getVerifiedFlowLinks } from '../test_lupin_zero/src/game-flow-spec.js';


test('published Revenge Chance pullback table is preserved', () => {
  expect(REVENGE_CHANCE_SPEC.games).toBe(10);
  expect(REVENGE_CHANCE_SPEC.averagePullbackPercent).toBe(5.6);
  expect(getRevengePullbackPercent(50000).percent).toBe(2.3);
  expect(getRevengePullbackPercent(350000).percent).toBe(1.6);
  expect(getRevengePullbackPercent(750000).percent).toBe(12.5);
  expect(getRevengePullbackPercent(950000).percent).toBe(50.0);
  expect(getRevengePullbackPercent(950000).evidenceStatus).toBe('PUBLISHED_ANALYSIS');
});

test('only exact midpoint needed by current 50k production treasure model is inferred', () => {
  const midpoint = getRevengePullbackPercent(400000);
  expect(midpoint.percent).toBe(1.8);
  expect(midpoint.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(midpoint.method).toBe('MIDPOINT_BETWEEN_ADJACENT_PUBLISHED_TREASURE_POINTS');
  expect(getRevengePullbackPercent(425000)).toBeNull();
});

test('pullback hit and miss use the selected treasure rate deterministically', () => {
  const hit = resolveRevengePullback(new SequenceRandomSource([0]), 350000);
  expect(hit.hit).toBe(true);
  expect(hit.percent).toBe(1.6);
  expect(hit.games).toBe(10);
  expect(hit.destination).toBe('LUPIN_BONUS');

  const miss = resolveRevengePullback(new SequenceRandomSource([0.99]), 350000);
  expect(miss.hit).toBe(false);
});

test('unsupported treasure values stay unresolved rather than inventing a rate', () => {
  const result = resolveRevengePullback(new SequenceRandomSource([0]), 425000);
  expect(result.eligible).toBe(false);
  expect(result.hit).toBe(false);
  expect(result.percent).toBeNull();
  expect(result.evidenceStatus).toBe('UNRESOLVED');
});

test('flow graph exposes GT loss pullback to Revenge Chance and then Lupin Bonus', () => {
  const gtLinks = getVerifiedFlowLinks(GameMode.GOLDEN_TIME);
  expect(gtLinks.some((link) => link.trigger === 'TREASURE_BATTLE_LOSS_PULLBACK_HIT' && link.to === GameMode.REVENGE_CHANCE)).toBe(true);
  const revengeLinks = getVerifiedFlowLinks(GameMode.REVENGE_CHANCE);
  expect(revengeLinks.some((link) => link.to === GameMode.LUPIN_BONUS)).toBe(true);
});
