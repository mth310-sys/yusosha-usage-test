import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { LUPIN_BONUS_SPEC, createLupinBonusProfile, resolveLupinBonusOutcome } from '../test_lupin_zero/src/lupin-bonus-resolver.js';
import { REVENGE_CHANCE_SPEC, resolveBonusEndRevengeEntry, resolveBonusEndRevengeOutcome } from '../test_lupin_zero/src/revenge-chance-resolver.js';

test('Lupin Bonus structure is preserved', () => {
  const profile = createLupinBonusProfile();
  expect(profile.totalGames).toBe(35);
  expect(profile.bodyGames).toBe(30);
  expect(profile.finalBattleGames).toBe(5);
  expect(profile.betCoinsPerGame).toBe(3);
  expect(profile.payoutCoinsPerGame).toBe(5);
  expect(profile.pureIncreaseCoinsPerGame).toBe(2);
  expect(profile.artExpectationPercent).toBe(50);
  expect(profile.episodeCount).toBe(11);
  expect(profile.finalBattleOpponent).toBe('ZENIGATA');
});

test('50 percent outcome boundary is deterministic', () => {
  expect(resolveLupinBonusOutcome(new SequenceRandomSource([0.499999])).artHit).toBe(true);
  expect(resolveLupinBonusOutcome(new SequenceRandomSource([0.5])).artHit).toBe(false);
});

test('success destination is Golden Time', () => {
  const outcome = resolveLupinBonusOutcome(new SequenceRandomSource([0]));
  expect(outcome.successDestination).toBe('GOLDEN_TIME');
  expect(outcome.exactPerRoleLotteryStatus).toBe('UNRESOLVED');
});

test('thirty-five game credit model adds seventy net credits', () => {
  const profile = createLupinBonusProfile();
  const consumed = profile.betCoinsPerGame * profile.totalGames;
  const returned = profile.payoutCoinsPerGame * profile.totalGames;
  expect(returned - consumed).toBe(70);
});

test('post-failure Revenge Chance uses published 1 in 25 entry and 39 percent hit expectation', () => {
  expect(LUPIN_BONUS_SPEC.failureMayRouteToRevengeChance).toBe(true);
  expect(LUPIN_BONUS_SPEC.failureRevengeEntryDenominator).toBe(25);
  expect(LUPIN_BONUS_SPEC.failureRevengeEntryRatePercent).toBe(4);
  expect(LUPIN_BONUS_SPEC.failureRevengeHitExpectationPercent).toBe(39);
  expect(REVENGE_CHANCE_SPEC.bonusEndEntryDenominator).toBe(25);
  expect(REVENGE_CHANCE_SPEC.bonusEndHitExpectationPercent).toBe(39);
});

test('bonus-end Revenge Chance boundaries are deterministic', () => {
  expect(resolveBonusEndRevengeEntry(new SequenceRandomSource([0.039999])).hit).toBe(true);
  expect(resolveBonusEndRevengeEntry(new SequenceRandomSource([0.04])).hit).toBe(false);
  expect(resolveBonusEndRevengeOutcome(new SequenceRandomSource([0.389999])).hit).toBe(true);
  expect(resolveBonusEndRevengeOutcome(new SequenceRandomSource([0.39])).hit).toBe(false);
});
