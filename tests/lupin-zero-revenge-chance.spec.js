import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import {
  REVENGE_CHANCE_SPEC,
  getRevengePullbackPercent,
  resolveRevengePullback
} from '../test_lupin_zero/src/revenge-chance-resolver.js';
import { GameMode, getVerifiedFlowLinks } from '../test_lupin_zero/src/game-flow-spec.js';


test('published Revenge Chance pullback table and timing semantics are preserved', () => {
  expect(REVENGE_CHANCE_SPEC.games).toBe(10);
  expect(REVENGE_CHANCE_SPEC.averagePullbackPercent).toBe(5.6);
  expect(REVENGE_CHANCE_SPEC.gtBattlePullbackLotteryTiming).toBe('TREASURE_BATTLE_LOSS');
  expect(REVENGE_CHANCE_SPEC.gtBattleRevengeChanceRole).toBe('PULLBACK_WIN_PRESENTATION_AFTER_LOTTERY_HIT');
  expect(REVENGE_CHANCE_SPEC.rerollGtBattlePullbackInsideRevengeChance).toBe(false);
  expect(REVENGE_CHANCE_SPEC.successDestinations).toEqual(['LUPIN_BONUS', 'GOLDEN_TIME']);
  expect(REVENGE_CHANCE_SPEC.successDestinationSplit).toBeNull();
  expect(REVENGE_CHANCE_SPEC.automaticSuccessDestination).toBeNull();
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

test('pullback hit preserves both destinations without inventing the split', () => {
  const hit = resolveRevengePullback(new SequenceRandomSource([0]), 350000);
  expect(hit.hit).toBe(true);
  expect(hit.percent).toBe(1.6);
  expect(hit.games).toBe(10);
  expect(hit.destination).toBeNull();
  expect(hit.destinationCandidates).toEqual(['LUPIN_BONUS', 'GOLDEN_TIME']);
  expect(hit.destinationSplit).toBeNull();
  expect(hit.evidenceStatus).toBe('UNRESOLVED');

  const miss = resolveRevengePullback(new SequenceRandomSource([0.99]), 350000);
  expect(miss.hit).toBe(false);
  expect(miss.destinationCandidates).toEqual([]);
});

test('unsupported treasure values stay unresolved rather than inventing a rate', () => {
  const result = resolveRevengePullback(new SequenceRandomSource([0]), 425000);
  expect(result.eligible).toBe(false);
  expect(result.hit).toBe(false);
  expect(result.percent).toBeNull();
  expect(result.evidenceStatus).toBe('UNRESOLVED');
});

test('flow graph exposes GT loss pullback and both published Revenge success destinations', () => {
  const gtLinks = getVerifiedFlowLinks(GameMode.GOLDEN_TIME);
  expect(gtLinks.some((link) => link.trigger === 'TREASURE_BATTLE_LOSS_PULLBACK_HIT' && link.to === GameMode.REVENGE_CHANCE)).toBe(true);
  const revengeLinks = getVerifiedFlowLinks(GameMode.REVENGE_CHANCE);
  expect(revengeLinks.some((link) => link.to === GameMode.LUPIN_BONUS)).toBe(true);
  expect(revengeLinks.some((link) => link.to === GameMode.GOLDEN_TIME)).toBe(true);
});
