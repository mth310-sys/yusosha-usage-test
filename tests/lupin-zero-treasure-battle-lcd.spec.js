import { test, expect } from '@playwright/test';

async function seedBattle(page, { continued = true } = {}) {
  return page.evaluate(async ({ continued }) => {
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
    const resolution = Object.freeze({
      eligible: true,
      treasure: 350000,
      continuationPercent: 73.6,
      draw: continued ? 0 : 0.99,
      continued,
      evidenceStatus: 'PUBLISHED_ANALYSIS'
    });
    core.resolveGoldenTimeContinuation(resolution, createGoldenTimeSetProfile());
    return {
      lcd: app.getTreasureBattleLcdState(),
      policy: app.treasureBattleLcdPolicy,
      runtime: app.getTreasureBattleRuntimeState()
    };
  }, { continued });
}

async function playBattleGame(page) {
  return page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const core = app.core;
    core.maxBetNow();
    core.start();
    core.stop(0);
    core.stop(1);
    core.stop(2);
    return {
      lcd: app.getTreasureBattleLcdState(),
      runtime: app.getTreasureBattleRuntimeState(),
      snapshot: core.snapshot()
    };
  });
}

test('Treasure Battle LCD reuses Phaser and never invents an opponent or cabinet cue', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const seeded = await seedBattle(page);

  expect(seeded.lcd.visible).toBe(true);
  expect(seeded.lcd.game).toBe(1);
  expect(seeded.lcd.phase).toBe('FIRST_ATTACK');
  expect(seeded.lcd.opponentLabel).toBe('ENEMY ???');
  expect(seeded.lcd.selectedOpponent).toBeNull();
  expect(seeded.policy.reusesExistingPhaserScene).toBe(true);
  expect(seeded.policy.reusesGoldenTimeHud).toBe(true);
  expect(seeded.policy.selectedOpponent).toBeNull();
  expect(seeded.policy.opponentDistributionStatus).toBe('UNRESOLVED');
  expect(seeded.policy.prismAutomaticCue).toBeNull();
  expect(seeded.policy.ledAutomaticCue).toBeNull();
  expect(seeded.policy.cabinetCueEvidenceStatus).toBe('UNRESOLVED');
  expect(seeded.runtime.selectedOpponent).toBeNull();
});

test('Treasure Battle LCD advances reused four-game phase meanings while outcome remains hidden until game four', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  await seedBattle(page, { continued: true });

  const expected = [
    ['CHANCE_DISPLAY', 'CHANCE表示で期待度アップ。発生率は未確認。'],
    ['CUT_IN', 'ルパンカットイン 青＜緑＜赤。色振り分けは未確認。'],
    ['STAND_UP', '立ち上がり背景 青＜緑＜赤。ここで勝敗を開示。']
  ];

  for (let i = 0; i < 3; i++) {
    const state = await playBattleGame(page);
    expect(state.lcd.visible).toBe(true);
    expect(state.lcd.game).toBe(i + 2);
    expect(state.lcd.phase).toBe(expected[i][0]);
    expect(state.lcd.phaseNote).toBe(expected[i][1]);
    expect(state.lcd.outcomeVisibility).toBe('HIDDEN');
    expect(state.lcd.revealedOutcome).toBeNull();
    expect(state.lcd.selectedOpponent).toBeNull();
  }

  const finalState = await playBattleGame(page);
  expect(finalState.snapshot.modeResult).toBeNull();
  expect(finalState.snapshot.goldenTimeSetNumber).toBe(2);
  expect(finalState.lcd.visible).toBe(false);
});

test('production page loads battle LCD only after Treasure Battle runtime', async ({ page }) => {
  const html = await (await page.request.get('/test_lupin_zero/')).text();
  const battle = html.indexOf('./src/treasure-battle-runtime.js');
  const lcd = html.indexOf('./src/treasure-battle-lcd-runtime.js');
  expect(battle).toBeGreaterThan(-1);
  expect(lcd).toBeGreaterThan(battle);
});
