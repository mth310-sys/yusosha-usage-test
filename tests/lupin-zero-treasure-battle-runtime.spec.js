import { test, expect } from '@playwright/test';

async function seedPendingBattle(page, { treasure = 350000, stockCount = 0, continued = true } = {}) {
  return page.evaluate(async ({ treasure, stockCount, continued }) => {
    const app = window.__LUPIN_ZERO__;
    const core = app.core;
    const { createGoldenTimeSetProfile } = await import('/test_lupin_zero/src/golden-time-resolver.js');
    core.kernelState = Object.freeze({
      ...core.kernelState,
      credit: 100,
      bet: 0,
      phase: 'IDLE',
      stopped: Object.freeze([true, true, true]),
      mode: 'GOLDEN_TIME',
      modeGamesRemaining: 0,
      modeResult: 'PENDING_GT_CONTINUATION',
      modeResultEvidenceStatus: 'PUBLISHED_ANALYSIS',
      goldenTimeTreasure: treasure,
      goldenTimeSetNumber: 1,
      goldenTimeStockCount: stockCount
    });
    const resolution = Object.freeze({
      eligible: true,
      treasure,
      continuationPercent: 73.6,
      draw: continued ? 0 : 0.99,
      continued,
      evidenceStatus: 'PUBLISHED_ANALYSIS'
    });
    const accepted = core.resolveGoldenTimeContinuation(resolution, createGoldenTimeSetProfile());
    return {
      accepted,
      runtime: app.getTreasureBattleRuntimeState(),
      snapshot: core.snapshot(),
      policy: app.treasureBattleRuntimePolicy
    };
  }, { treasure, stockCount, continued });
}

async function playOneBattleGame(page) {
  return page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const core = app.core;
    const creditBefore = core.snapshot().credit;
    const maxBetAccepted = core.maxBetNow();
    const creditAfterBet = core.snapshot().credit;
    const startAccepted = core.start();
    const stops = [core.stop(0), core.stop(1), core.stop(2)];
    return {
      creditBefore,
      creditAfterBet,
      maxBetAccepted,
      startAccepted,
      stops,
      runtime: app.getTreasureBattleRuntimeState(),
      snapshot: core.snapshot()
    };
  });
}

test('Treasure Battle uses the existing BET START STOP loop for four physical spins and reveals outcome only on game four', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const seeded = await seedPendingBattle(page, { continued: true });
  expect(seeded.accepted).toBe(true);
  expect(seeded.runtime.active).toBe(true);
  expect(seeded.runtime.presentation.completedGames).toBe(0);
  expect(seeded.runtime.presentation.hiddenOutcome).toBe('HIDDEN');
  expect(seeded.runtime.presentation.revealedOutcome).toBeNull();
  expect(seeded.policy.usesNormalBetStartStopControls).toBe(true);
  expect(seeded.policy.usesExistingResearchReelSpin).toBe(true);
  expect(seeded.policy.battleRoleLottery).toBeNull();
  expect(seeded.policy.battlePayoutCoins).toBeNull();
  expect(seeded.policy.battleRoleAndPayoutEvidenceStatus).toBe('UNRESOLVED');
  expect(seeded.policy.economyAccounting).toBe('SUSPENDED_UNTIL_BATTLE_ROLE_AND_PAYOUT_ARE_RESOLVED');
  expect(seeded.policy.battleBetChangesCredit).toBe(false);
  expect(seeded.policy.syntheticZeroPayoutForbidden).toBe(true);

  expect(seeded.runtime.opponentCandidates.map((x) => x.key)).toEqual([
    'ZENIGATA',
    'ZENIGATA_ROBO',
    'LUPIN_GANG_ROBO',
    'MASS_PRODUCED',
    'FUJIKO'
  ]);
  expect(seeded.runtime.selectedOpponent).toBeNull();
  expect(seeded.runtime.opponentDistribution).toBeNull();
  expect(seeded.policy.opponentDistributionEvidenceStatus).toBe('UNRESOLVED');

  for (let game = 1; game <= 3; game++) {
    const played = await playOneBattleGame(page);
    expect(played.maxBetAccepted).toBe(true);
    expect(played.creditAfterBet).toBe(played.creditBefore);
    expect(played.startAccepted).toBe(true);
    expect(played.stops).toEqual([true, true, true]);
    expect(played.runtime.active).toBe(true);
    expect(played.runtime.presentation.completedGames).toBe(game);
    expect(played.runtime.presentation.hiddenOutcome).toBe('HIDDEN');
    expect(played.runtime.presentation.revealedOutcome).toBeNull();
    expect(played.runtime.selectedOpponent).toBeNull();
    expect(played.snapshot.credit).toBe(100);
    expect(played.snapshot.modeResult).toBe('PENDING_GT_CONTINUATION');
  }

  const finalGame = await playOneBattleGame(page);
  expect(finalGame.maxBetAccepted).toBe(true);
  expect(finalGame.creditAfterBet).toBe(finalGame.creditBefore);
  expect(finalGame.startAccepted).toBe(true);
  expect(finalGame.stops).toEqual([true, true, true]);
  expect(finalGame.runtime.active).toBe(false);
  expect(finalGame.snapshot.credit).toBe(100);
  expect(finalGame.snapshot.mode).toBe('GOLDEN_TIME');
  expect(finalGame.snapshot.modeResult).toBeNull();
  expect(finalGame.snapshot.modeGamesRemaining).toBe(40);
  expect(finalGame.snapshot.goldenTimeSetNumber).toBe(2);
  expect(finalGame.snapshot.goldenTimeLastContinuation.continued).toBe(true);
});

test('real battle-ready event leaves MAX BET usable after the legacy render listener runs', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    const core = window.__LUPIN_ZERO__.core;
    core.kernelState = Object.freeze({
      ...core.kernelState,
      credit: 100,
      bet: 0,
      phase: 'IDLE',
      stopped: Object.freeze([true, true, true]),
      mode: 'GOLDEN_TIME',
      modeGamesRemaining: 0,
      modeResult: 'PENDING_GT_CONTINUATION',
      modeResultEvidenceStatus: 'PUBLISHED_ANALYSIS',
      goldenTimeTreasure: 350000,
      goldenTimeSetNumber: 1,
      goldenTimeStockCount: 0
    });
    core.emit('golden-time-battle-ready', { treasure: 350000 });
  });

  await expect(page.locator('#maxBetBtn')).toBeEnabled();
  await expect(page.locator('#betBtn')).toBeEnabled();
  await expect(page.locator('#startBtn')).toBeDisabled();
  expect(await page.evaluate(() => window.__LUPIN_ZERO__.getTreasureBattleRuntimeState().active)).toBe(true);
});

test('GT stock priority bypasses Treasure Battle presentation and is consumed by the existing stock runtime', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const seeded = await seedPendingBattle(page, { stockCount: 1, continued: false });
  expect(seeded.accepted).toBe(true);
  expect(seeded.runtime.active).toBe(false);
  expect(seeded.snapshot.goldenTimeStockCount).toBe(0);
  expect(seeded.snapshot.goldenTimeSetNumber).toBe(2);
  expect(seeded.snapshot.modeResult).toBeNull();
  expect(seeded.snapshot.goldenTimeLastContinuation.source).toBe('STOCK');
});

test('production page loads Treasure Battle runtime after stock priority runtime', async ({ page }) => {
  const html = await (await page.request.get('/test_lupin_zero/')).text();
  const stock = html.indexOf('./src/golden-time-stock-runtime.js');
  const battle = html.indexOf('./src/treasure-battle-runtime.js');
  expect(stock).toBeGreaterThan(-1);
  expect(battle).toBeGreaterThan(stock);
});
