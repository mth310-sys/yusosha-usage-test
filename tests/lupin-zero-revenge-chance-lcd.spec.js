import { test, expect } from '@playwright/test';
import {
  REVENGE_CHANCE_PRESENTATION_REUSE,
  REVENGE_CHANCE_REUSE_AUDIT
} from '../test_lupin_zero/src/revenge-chance-reuse-audit.js';

test('prior B4 Revenge Chance presentation mechanics are preserved without inventing their lotteries', () => {
  expect(REVENGE_CHANCE_REUSE_AUDIT.priorProfilePreservedInBackup).toBe(true);
  expect(REVENGE_CHANCE_REUSE_AUDIT.reusePresentationMechanics).toBe(true);
  expect(REVENGE_CHANCE_PRESENTATION_REUSE.games).toBe(10);
  expect(REVENGE_CHANCE_PRESENTATION_REUSE.verifiedMechanics).toEqual([
    'COLLECT_FOUR_CHARACTERS',
    'TYPEWRITER_REVENGE_PATTERNS'
  ]);
  expect(REVENGE_CHANCE_PRESENTATION_REUSE.characterCollectionTarget).toBe(4);
  expect(REVENGE_CHANCE_PRESENTATION_REUSE.perGameCharacterCollectionLottery).toBeNull();
  expect(REVENGE_CHANCE_PRESENTATION_REUSE.typewriterPatternDistribution).toBeNull();
  expect(REVENGE_CHANCE_PRESENTATION_REUSE.automaticCharacterAcquisition).toBe(false);
  expect(REVENGE_CHANCE_PRESENTATION_REUSE.automaticTypewriterPatternSelection).toBe(false);
});

test('Revenge Chance LCD exposes verified structure but keeps live collection progress unresolved', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const state = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    app.core.emit('revenge-chance-enter', {
      games: 10,
      source: 'GT_BATTLE',
      evidenceStatus: 'PUBLISHED_ANALYSIS'
    });
    return {
      lcd: app.getRevengeChanceLcdState(),
      policy: app.revengeChanceLcdPolicy
    };
  });

  expect(state.lcd.visible).toBe(true);
  expect(state.lcd.remaining).toBe(10);
  expect(state.lcd.collectedCharacters).toBeNull();
  expect(state.lcd.characterCollectionTarget).toBe(4);
  expect(state.lcd.typewriterPattern).toBeNull();
  expect(state.policy.automaticCharacterAcquisition).toBe(false);
  expect(state.policy.automaticTypewriterPatternSelection).toBe(false);
  expect(state.policy.syntheticCollectionProgressForbidden).toBe(true);
  expect(state.policy.syntheticTypewriterPatternForbidden).toBe(true);
});

test('Revenge Chance success LCD preserves LB and GT candidates without choosing a destination', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const state = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    app.core.emit('revenge-chance-success', {
      destination: null,
      destinationCandidates: ['LUPIN_BONUS', 'GOLDEN_TIME'],
      destinationSplit: null,
      source: 'GT_BATTLE',
      evidenceStatus: 'UNRESOLVED'
    });
    return app.getRevengeChanceLcdState();
  });

  expect(state.visible).toBe(true);
  expect(state.status).toBe('SUCCESS');
  expect(state.destination).toBeNull();
  expect(state.destinationCandidates).toEqual(['LUPIN_BONUS', 'GOLDEN_TIME']);
  expect(state.collectedCharacters).toBeNull();
  expect(state.typewriterPattern).toBeNull();
});

test('production page loads Revenge Chance LCD after Revenge Chance runtime', async ({ page }) => {
  const html = await (await page.request.get('/test_lupin_zero/')).text();
  const runtime = html.indexOf('./src/revenge-chance-runtime.js');
  const lcd = html.indexOf('./src/revenge-chance-lcd-runtime.js');
  expect(runtime).toBeGreaterThan(-1);
  expect(lcd).toBeGreaterThan(runtime);
});
