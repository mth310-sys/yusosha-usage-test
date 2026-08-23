import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { createExtraBonusProfile, resolveExtraBonusGame, EXTRA_BONUS_SPEC } from '../test_lupin_zero/src/extra-bonus-resolver.js';
import { GameMode, GAME_FLOW_SPEC } from '../test_lupin_zero/src/game-flow-spec.js';

const mainSource = readFileSync(new URL('../test_lupin_zero/src/main.js', import.meta.url), 'utf8');
const coreSource = readFileSync(new URL('../test_lupin_zero/src/machine-core.js', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../test_lupin_zero/index.html', import.meta.url), 'utf8');

test('Extra Bonus keeps 15G as a minimum and does not synthesize the unresolved added-game distribution', () => {
  const unresolved = createExtraBonusProfile(14);
  expect(EXTRA_BONUS_SPEC.minimumAddedGames).toBe(15);
  expect(EXTRA_BONUS_SPEC.averageAddedGames).toBe(18.2);
  expect(EXTRA_BONUS_SPEC.addedGameDistribution).toBeNull();
  expect(EXTRA_BONUS_SPEC.automaticDurationRollAllowed).toBe(false);
  expect(unresolved.games).toBeNull();
  expect(unresolved.minimumGames).toBe(29);
  expect(unresolved.minimumAddedGames).toBe(15);
  expect(unresolved.durationResolved).toBe(false);
  expect(unresolved.durationEvidenceStatus).toBe('UNRESOLVED');
  expect(unresolved.betCoinsPerGame).toBe(3);
  expect(unresolved.payoutCoinsPerGame).toBe(5);

  const verified = createExtraBonusProfile(14, 18);
  expect(verified.games).toBe(32);
  expect(verified.verifiedAddedGames).toBe(18);
  expect(verified.durationResolved).toBe(true);
  expect(verified.durationEvidenceStatus).toBe('VERIFIED');
});

test('published Extra Bonus odd and Gold Rush denominators are preserved', () => {
  expect(EXTRA_BONUS_SPEC.oddAlignmentDenominator).toBe(202.6);
  expect(EXTRA_BONUS_SPEC.goldRushDenominator).toBe(4924.3);

  const oddHit = resolveExtraBonusGame(new SequenceRandomSource([0, 0.999999]));
  expect(oddHit.oddAligned).toBe(true);
  expect(oddHit.goldRushHit).toBe(false);
  expect(oddHit.oddAlignmentConsequence).toBe('GOLDEN_TIME_SET_STOCK_PLUS_1');

  const goldHit = resolveExtraBonusGame(new SequenceRandomSource([0.999999, 0]));
  expect(goldHit.oddAligned).toBe(false);
  expect(goldHit.goldRushHit).toBe(true);
  expect(goldHit.goldRushDestination).toBe('GOLD_RUSH');
});

test('verified Golden Time special-zone links are represented without inventing Treasure Rush entry probability', () => {
  expect(GAME_FLOW_SPEC.links).toEqual(expect.arrayContaining([
    expect.objectContaining({ from: GameMode.GOLDEN_TIME, trigger: 'TREASURE_REACHES_1000000', to: GameMode.EXTRA_BONUS }),
    expect.objectContaining({ from: GameMode.EXTRA_BONUS, trigger: 'GOLD_SEVEN_ALIGNED', to: GameMode.GOLD_RUSH })
  ]));
  const treasureRush = GAME_FLOW_SPEC.knownButUnresolved.find((entry) => entry.mode === GameMode.TREASURE_RUSH);
  expect(treasureRush.automaticTreasureHuntOccurrenceRate).toBeNull();
  expect(treasureRush.treasureHuntSuccessRate).toBeNull();
});

test('production runtime holds at one million treasure until an Extra Bonus added-game count is verified', async ({ page }) => {
  expect(mainSource).toContain('createExtraBonusProfile(afterSettlement.modeGamesRemaining ?? 0)');
  expect(mainSource).toContain('core.enterExtraBonus(extraBonus)');
  expect(indexSource).toContain('./src/extra-bonus-duration-boundary-runtime.js');

  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const state = await page.evaluate(async () => {
    const app = window.__LUPIN_ZERO__;
    const { createExtraBonusProfile } = await import('/test_lupin_zero/src/extra-bonus-resolver.js');
    app.enterGoldenTime();
    app.core.kernelState = Object.freeze({
      ...app.core.kernelState,
      goldenTimeTreasure: 1000000,
      modeGamesRemaining: 14,
      modeResult: null,
      modeResultEvidenceStatus: null
    });
    const unresolvedProfile = createExtraBonusProfile(14);
    const automaticEntry = app.core.enterExtraBonus(unresolvedProfile);
    const held = app.core.snapshot();
    const manualProfile = app.enterExtraBonusWithVerifiedAddedGames(18);
    const entered = app.core.snapshot();
    return { automaticEntry, unresolvedProfile, held, manualProfile, entered, policy: app.extraBonusDurationPolicy };
  });

  expect(state.automaticEntry).toBe(false);
  expect(state.held.mode).toBe(GameMode.GOLDEN_TIME);
  expect(state.held.modeResult).toBe('PENDING_EXTRA_BONUS_DURATION');
  expect(state.held.modeResultEvidenceStatus).toBe('UNRESOLVED');
  expect(state.policy.minimumAddedGames).toBe(15);
  expect(state.policy.averageAddedGames).toBe(18.2);
  expect(state.policy.exactAddedGameDistribution).toBeNull();
  expect(state.policy.automaticDurationRollAllowed).toBe(false);
  expect(state.manualProfile.games).toBe(32);
  expect(state.manualProfile.verifiedAddedGames).toBe(18);
  expect(state.entered.mode).toBe(GameMode.EXTRA_BONUS);
  expect(state.entered.modeGamesRemaining).toBe(32);
});

test('Extra Bonus core still preserves verified stock and Gold Rush consequences once duration is explicitly supplied', () => {
  expect(coreSource).toContain("mode: GameMode.EXTRA_BONUS");
  expect(coreSource).toContain("source: 'EXTRA_BONUS_ODD_ALIGNMENT'");
  expect(coreSource).toContain("modeResult: 'PENDING_GOLD_RUSH'");
  expect(coreSource).toContain("modeResult: 'PENDING_GT_CONTINUATION'");
  expect(coreSource).toContain("this.emit('golden-time-battle-ready', { treasure: 1000000 })");
});
