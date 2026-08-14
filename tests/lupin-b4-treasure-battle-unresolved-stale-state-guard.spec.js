import { test, expect } from '@playwright/test';

test('Treasure Battle unresolved boundary clears stale battle presentation state', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      treasurePoints: gt.treasurePoints,
      battleContinuationPct: gt.battleContinuationPct,
      battleResult: gt.battleResult,
      battleSource: gt.battleSource,
      battleGameCount: gt.battleGameCount,
      battlePhase: gt.battlePhase,
      battleOpponent: gt.battleOpponent,
      battleHiddenOutcome: gt.battleHiddenOutcome,
      lastEvent: gt.lastEvent
    });

    const unresolved = new GoldenTimeSystem(new RNG(1), 1);
    unresolved.state = 'ACTIVE_SET';
    unresolved.treasurePoints = 125000;
    unresolved.guaranteedStocks = 0;
    unresolved.battleContinuationPct = 97.2;
    unresolved.battleResult = 'WIN';
    unresolved.battleSource = 'PREVIOUS_BATTLE';
    unresolved.battleGameCount = 4;
    unresolved.battlePhase = 'RESULT_WIN';
    unresolved.battleOpponent = 'PREVIOUS_OPPONENT';
    unresolved.battleHiddenOutcome = 'WIN';
    unresolved.lastEvent = 'PREVIOUS_BATTLE_EVENT';
    const unresolvedOut = unresolved.startTreasureBattle();

    const known = new GoldenTimeSystem(new RNG(1), 1);
    known.state = 'ACTIVE_SET';
    known.treasurePoints = 100000;
    known.guaranteedStocks = 0;
    known.battleContinuationPct = 97.2;
    known.battleResult = 'WIN';
    known.battleSource = 'PREVIOUS_BATTLE';
    known.battleGameCount = 4;
    known.battlePhase = 'RESULT_WIN';
    known.battleOpponent = 'PREVIOUS_OPPONENT';
    known.battleHiddenOutcome = 'WIN';
    known.lastEvent = 'PREVIOUS_BATTLE_EVENT';
    const knownOut = known.startTreasureBattle();

    return {
      unresolved: { out: unresolvedOut, after: capture(unresolved) },
      known: { out: knownOut, after: capture(known) }
    };
  });

  expect(result.unresolved.after.state).toBe('BATTLE_PENDING_UNVERIFIED_TREASURE_POINT');
  expect(result.unresolved.after.treasurePoints).toBe(125000);
  expect(result.unresolved.after.battleContinuationPct).toBeNull();
  expect(result.unresolved.after.battleResult).toBe('UNRESOLVED');
  expect(result.unresolved.after.battleSource).toBe('NO_INTERPOLATION');
  expect(result.unresolved.after.battleGameCount).toBe(0);
  expect(result.unresolved.after.battlePhase).toBeNull();
  expect(result.unresolved.after.battleOpponent).toBeNull();
  expect(result.unresolved.after.battleHiddenOutcome).toBeNull();
  expect(result.unresolved.after.lastEvent).toBe('GT_BATTLE_PENDING_EXACT_TREASURE_VALUE');

  expect(result.known.after.state).toBe('BATTLE_ACTIVE');
  expect(result.known.after.battleContinuationPct).toBe(69.7);
  expect(result.known.after.battleResult).toBe('HIDDEN');
  expect(result.known.after.battleSource).toBe('VERIFIED_TREASURE_TABLE_OUTCOME_4G_PRESENTATION');
  expect(result.known.after.battleGameCount).toBe(0);
  expect(result.known.after.battlePhase).toBe('ENTRY');
  expect(result.known.after.battleOpponent).toBeNull();
  expect(['WIN', 'LOSE']).toContain(result.known.after.battleHiddenOutcome);
  expect(result.known.after.lastEvent).toBe('TREASURE_BATTLE_START_4G_OPPONENT_DISTRIBUTION_UNVERIFIED');
});
