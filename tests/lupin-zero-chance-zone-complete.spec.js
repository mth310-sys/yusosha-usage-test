import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import {
  CHANCE_ZONE_DETAIL_SPEC,
  CHANCE_ZONE_DETAIL_POLICY,
  resolveChanceZoneStage,
  resolveChanceZoneOutcome
} from '../test_lupin_zero/src/chance-zone-detail-resolver.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

test('published CZ stage scenario table is preserved', () => {
  expect(CHANCE_ZONE_DETAIL_SPEC.stageSelectionBySetting[1]).toEqual([71.88, 23.44, 3.13, 1.56]);
  expect(CHANCE_ZONE_DETAIL_SPEC.stageSelectionBySetting[6]).toEqual([51.56, 39.06, 6.25, 3.13]);
  expect(resolveChanceZoneStage(new SequenceRandomSource([0]), 1).stage).toBe('A');
  expect(resolveChanceZoneStage(new SequenceRandomSource([0.72]), 1).stage).toBe('B');
});

test('setting 1 total CZ expectation boundaries are deterministic', () => {
  expect(resolveChanceZoneOutcome(new SequenceRandomSource([0.398999]), GameMode.ODOROBO_ZONE, 1).hit).toBe(true);
  expect(resolveChanceZoneOutcome(new SequenceRandomSource([0.399]), GameMode.ODOROBO_ZONE, 1).hit).toBe(false);
  expect(resolveChanceZoneOutcome(new SequenceRandomSource([0.587999]), GameMode.FUJIKO_ZONE, 1).hit).toBe(true);
  expect(resolveChanceZoneOutcome(new SequenceRandomSource([0.588]), GameMode.FUJIKO_ZONE, 1).hit).toBe(false);
});

test('CZ detail model does not invent per-game or stage-specific hit rates', () => {
  expect(CHANCE_ZONE_DETAIL_SPEC.stageSpecificSuccessRatesKnown).toBe(false);
  expect(CHANCE_ZONE_DETAIL_SPEC.perGameSuccessLotteryKnown).toBe(false);
  expect(CHANCE_ZONE_DETAIL_POLICY.inventPerGameHitRates).toBe(false);
  expect(CHANCE_ZONE_DETAIL_POLICY.inventStageSpecificHitRates).toBe(false);
  expect(CHANCE_ZONE_DETAIL_POLICY.replaceableWhenExactLotteryIsRecovered).toBe(true);
});

test('CZ exhaustion no longer leaves the machine stuck at zero games', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    app.core.enterMode('ODOROBO_ZONE', 10, 'MULTI_SOURCE_MATCH');
    for (let i = 0; i < 10; i += 1) app.core.advanceModeGame();
    const s = app.core.snapshot();
    return { mode: s.mode, remaining: s.modeGamesRemaining, result: s.modeResult };
  });
  expect(result.mode === 'ODOROBO_ZONE' && result.remaining === 0).toBe(false);
});
