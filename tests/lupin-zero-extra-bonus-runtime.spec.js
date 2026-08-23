import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { createExtraBonusProfile, resolveExtraBonusGame, EXTRA_BONUS_SPEC } from '../test_lupin_zero/src/extra-bonus-resolver.js';
import { GameMode, GAME_FLOW_SPEC } from '../test_lupin_zero/src/game-flow-spec.js';

const mainSource = readFileSync(new URL('../test_lupin_zero/src/main.js', import.meta.url), 'utf8');
const coreSource = readFileSync(new URL('../test_lupin_zero/src/machine-core.js', import.meta.url), 'utf8');

test('Extra Bonus duration is fifteen games plus remaining Golden Time games', () => {
  const profile = createExtraBonusProfile(14);
  expect(profile.baseGames).toBe(15);
  expect(profile.absorbedGoldenTimeGames).toBe(14);
  expect(profile.games).toBe(29);
  expect(profile.betCoinsPerGame).toBe(3);
  expect(profile.payoutCoinsPerGame).toBe(5);
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

test('production runtime automatically enters Extra Bonus at one million treasure and settles its games', () => {
  expect(mainSource).toContain('createExtraBonusProfile(afterSettlement.modeGamesRemaining ?? 0)');
  expect(mainSource).toContain('core.enterExtraBonus(extraBonus)');
  expect(mainSource).toContain('completedMode === GameMode.EXTRA_BONUS');
  expect(mainSource).toContain('settleCurrentExtraBonusGame()');
  expect(coreSource).toContain("mode: GameMode.EXTRA_BONUS");
  expect(coreSource).toContain("source: 'EXTRA_BONUS_ODD_ALIGNMENT'");
  expect(coreSource).toContain("modeResult: 'PENDING_GOLD_RUSH'");
  expect(coreSource).toContain("modeResult: 'PENDING_GT_CONTINUATION'");
  expect(coreSource).toContain("this.emit('golden-time-battle-ready', { treasure: 1000000 })");
});
