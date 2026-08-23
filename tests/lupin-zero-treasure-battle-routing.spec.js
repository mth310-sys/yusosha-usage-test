import { test, expect } from '@playwright/test';

async function seedBattle(page, { continued }) {
  await page.evaluate(async ({ continued }) => {
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
      goldenTimeTreasure: 350000,
      goldenTimeSetNumber: 1,
      goldenTimeStockCount: 0
    });
    core.resolveGoldenTimeContinuation(Object.freeze({
      eligible: true,
      treasure: 350000,
      continuationPercent: 73.6,
      draw: continued ? 0 : 0.99,
      continued,
      evidenceStatus: 'PUBLISHED_ANALYSIS'
    }), createGoldenTimeSetProfile());
  }, { continued });
}

async function playFourBattleGames(page) {
  for (let game = 0; game < 4; game++) {
    await page.evaluate(() => {
      const core = window.__LUPIN_ZERO__.core;
      core.maxBetNow();
      core.start();
      core.stop(0);
      core.stop(1);
      core.stop(2);
    });
  }
}

test('Treasure Battle WIN reuses golden-time-continued and starts existing LUPIN RUSH runtime', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  await seedBattle(page, { continued: true });
  await playFourBattleGames(page);

  const state = await page.evaluate(() => ({
    snapshot: window.__LUPIN_ZERO__.core.snapshot(),
    rush: window.__LUPIN_ZERO__.getLupinRushState(),
    lcd: window.__LUPIN_ZERO__.getTreasureBattleLcdState()
  }));

  expect(state.snapshot.mode).toBe('GOLDEN_TIME');
  expect(state.snapshot.goldenTimeSetNumber).toBe(2);
  expect(state.snapshot.goldenTimeLastContinuation.continued).toBe(true);
  expect(state.rush.active).toBe(true);
  expect(state.rush.setNumber).toBe(2);
  expect(state.lcd.visible).toBe(false);
});

test('Treasure Battle LOSE passes through existing Revenge Chance wrapper and clears battle LCD', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    window.__LUPIN_ZERO__.revengePullbackRandom.nextFloat = () => 0;
  });
  await seedBattle(page, { continued: false });
  await playFourBattleGames(page);

  const state = await page.evaluate(() => ({
    snapshot: window.__LUPIN_ZERO__.core.snapshot(),
    battle: window.__LUPIN_ZERO__.getTreasureBattleRuntimeState(),
    lcd: window.__LUPIN_ZERO__.getTreasureBattleLcdState()
  }));

  expect(state.battle.active).toBe(false);
  expect(state.lcd.visible).toBe(false);
  expect(state.snapshot.mode).toBe('REVENGE_CHANCE');
  expect(state.snapshot.modeResult).toBeNull();
  expect(state.snapshot.goldenTimeLastContinuation.source).toBe('TREASURE_BATTLE_LOSS_PULLBACK_HIT');
});

test('production wrapper order is stock then Revenge Chance then Treasure Battle', async ({ page }) => {
  const html = await (await page.request.get('/test_lupin_zero/')).text();
  const stock = html.indexOf('./src/golden-time-stock-runtime.js');
  const revenge = html.indexOf('./src/revenge-chance-runtime.js');
  const battle = html.indexOf('./src/treasure-battle-runtime.js');
  expect(stock).toBeGreaterThan(-1);
  expect(revenge).toBeGreaterThan(stock);
  expect(battle).toBeGreaterThan(revenge);
});
