import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { resolveRaiunModeGame, RAIUN_MODE_PRODUCTION_POLICY } from '../test_lupin_zero/src/raiun-mode-resolver.js';
import { createMachineState, reduceMachine, ModeResult } from '../test_lupin_zero/src/machine-kernel.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

function playThreeCoinSpin(state) {
  let result = reduceMachine(state, { type: 'MAX_BET' });
  expect(result.accepted).toBe(true);
  state = result.state;
  result = reduceMachine(state, { type: 'START' });
  expect(result.accepted).toBe(true);
  state = result.state;
  for (const reelIndex of [0, 1, 2]) {
    result = reduceMachine(state, { type: 'STOP_REEL', reelIndex });
    expect(result.accepted).toBe(true);
    state = result.state;
  }
  return state;
}

test('Raiun Mode production calibration preserves published 20G / 23% / +2 coins per game', () => {
  expect(RAIUN_MODE_PRODUCTION_POLICY.games).toBe(20);
  expect(RAIUN_MODE_PRODUCTION_POLICY.publishedArtExpectationPercent).toBe(23);
  expect(RAIUN_MODE_PRODUCTION_POLICY.productionBetCoinsPerGame).toBe(3);
  expect(RAIUN_MODE_PRODUCTION_POLICY.productionPayoutCoinsPerGame).toBe(5);
  expect(RAIUN_MODE_PRODUCTION_POLICY.publishedNetIncreaseCoinsPerGame).toBe(2);
  expect(RAIUN_MODE_PRODUCTION_POLICY.inferredArtHitDenominatorPerGame).toBeCloseTo(77.0224979612, 8);
  const aggregate = 1 - Math.pow(1 - RAIUN_MODE_PRODUCTION_POLICY.inferredArtHitProbabilityPerGame, 20);
  expect(aggregate).toBeCloseTo(0.23, 12);
  expect(RAIUN_MODE_PRODUCTION_POLICY.exactPerRoleArtLotteryKnown).toBe(false);
  expect(RAIUN_MODE_PRODUCTION_POLICY.exactCoinAwardDistributionKnown).toBe(false);
  expect(RAIUN_MODE_PRODUCTION_POLICY.mayPromoteToVerifiedAutomatically).toBe(false);
});

test('Raiun Mode resolver exposes 7 alignment only on calibrated ART hit', () => {
  const hit = resolveRaiunModeGame(new SequenceRandomSource([0]));
  const miss = resolveRaiunModeGame(new SequenceRandomSource([0.999999]));
  expect(hit.artHit).toBe(true);
  expect(hit.successPresentation).toBe('LCD_7_ALIGNED');
  expect(hit.destination).toBe('GOLDEN_TIME');
  expect(hit.payoutCoins).toBe(5);
  expect(hit.netCoins).toBe(2);
  expect(miss.artHit).toBe(false);
  expect(miss.successPresentation).toBeNull();
});

test('twenty miss games produce +40 net coins and exhaust Raiun Mode', () => {
  let state = createMachineState({ credit: 50, maxBet: 3 });
  let result = reduceMachine(state, { type: 'ENTER_MODE', mode: GameMode.RAIUN_MODE, games: 20, evidenceStatus: 'MULTI_SOURCE_MATCH' });
  expect(result.accepted).toBe(true);
  state = result.state;

  for (let game = 1; game <= 20; game++) {
    state = playThreeCoinSpin(state);
    result = reduceMachine(state, {
      type: 'SETTLE_RAIUN_MODE_GAME',
      resolution: { artHit: false, payoutCoins: 5, evidenceStatus: 'INFERRED_HIGH_CONFIDENCE' }
    });
    expect(result.accepted).toBe(true);
    state = result.state;
    expect(state.modeGamesRemaining).toBe(20 - game);
  }

  expect(state.credit).toBe(90);
  expect(state.mode).toBe(GameMode.RAIUN_MODE);
  expect(state.modeGamesRemaining).toBe(0);
  result = reduceMachine(state, { type: 'EXIT_RAIUN_MODE' });
  expect(result.accepted).toBe(true);
  expect(result.state.mode).toBe(GameMode.NORMAL);
});

test('Raiun Mode ART hit enters a blocking Golden Time boundary without inventing GT internals', () => {
  let state = createMachineState({ credit: 50, maxBet: 3 });
  let result = reduceMachine(state, { type: 'ENTER_MODE', mode: GameMode.RAIUN_MODE, games: 20, evidenceStatus: 'MULTI_SOURCE_MATCH' });
  state = result.state;
  state = playThreeCoinSpin(state);

  result = reduceMachine(state, {
    type: 'SETTLE_RAIUN_MODE_GAME',
    resolution: {
      artHit: true,
      payoutCoins: 5,
      successPresentation: 'LCD_7_ALIGNED',
      destinationEvidenceStatus: 'MULTI_SOURCE_MATCH',
      evidenceStatus: 'INFERRED_HIGH_CONFIDENCE'
    }
  });
  expect(result.accepted).toBe(true);
  state = result.state;
  expect(state.modeGamesRemaining).toBe(0);
  expect(state.modeResult).toBe(ModeResult.PENDING_GOLDEN_TIME);
  expect(result.events.some((event) => event.type === 'RAIUN_MODE_ART_SUCCESS' && event.destination === GameMode.GOLDEN_TIME)).toBe(true);

  result = reduceMachine(state, { type: 'MAX_BET' });
  expect(result.accepted).toBe(true);
  state = result.state;
  result = reduceMachine(state, { type: 'START' });
  expect(result.accepted).toBe(false);
});
