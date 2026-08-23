import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import {
  createGoldenTimeSetProfile,
  getGoldenTimeContinuationPercent,
  resolveGoldenTimeContinuation,
  GOLDEN_TIME_PRODUCTION_POLICY
} from '../test_lupin_zero/src/golden-time-resolver.js';
import { createMachineState, reduceMachine, KernelPhase, ModeResult } from '../test_lupin_zero/src/machine-kernel.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

function stopAll(state) {
  let result = reduceMachine(state, { type: 'STOP_REEL', reelIndex: 0 });
  state = result.state;
  result = reduceMachine(state, { type: 'STOP_REEL', reelIndex: 1 });
  state = result.state;
  result = reduceMachine(state, { type: 'STOP_REEL', reelIndex: 2 });
  return result.state;
}

function playGoldenTimeGame(state, profile) {
  let result = reduceMachine(state, { type: 'MAX_BET' });
  expect(result.accepted).toBe(true);
  state = result.state;
  result = reduceMachine(state, { type: 'START' });
  expect(result.accepted).toBe(true);
  state = stopAll(result.state);
  result = reduceMachine(state, {
    type: 'SETTLE_GOLDEN_TIME_GAME',
    payoutCoins: profile.payoutCoinsPerGame,
    evidenceStatus: profile.initialTreasureEvidenceStatus
  });
  expect(result.accepted).toBe(true);
  return result.state;
}

test('published treasure continuation table is preserved', () => {
  expect(getGoldenTimeContinuationPercent(100000)).toBe(69.7);
  expect(getGoldenTimeContinuationPercent(350000)).toBe(73.6);
  expect(getGoldenTimeContinuationPercent(500000)).toBe(76.3);
  expect(getGoldenTimeContinuationPercent(950000)).toBe(97.2);
  expect(getGoldenTimeContinuationPercent(1000000)).toBe(100);
});

test('one million treasure guarantees continuation', () => {
  const resolved = resolveGoldenTimeContinuation(new SequenceRandomSource([0.999999]), 1000000);
  expect(resolved.continued).toBe(true);
  expect(resolved.continuationPercent).toBe(100);
});

test('production profile keeps unresolved initial Rush awards replaceable', () => {
  const profile = createGoldenTimeSetProfile();
  expect(profile.games).toBe(40);
  expect(profile.pureIncreaseCoinsPerGame).toBe(2);
  expect(profile.betCoinsPerGame).toBe(3);
  expect(profile.payoutCoinsPerGame).toBe(5);
  expect(profile.publishedInitialRushAverageTreasure).toBe(342000);
  expect(profile.initialTreasure).toBe(350000);
  expect(profile.initialTreasureEvidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(profile.exactTreasureAcquisitionDuringSetImplemented).toBe(false);
  expect(GOLDEN_TIME_PRODUCTION_POLICY.extraBonusAtOneMillionImplemented).toBe(true);
  expect(GOLDEN_TIME_PRODUCTION_POLICY.goldRushRuntimeImplemented).toBe(false);
  expect(GOLDEN_TIME_PRODUCTION_POLICY.treasureRushAutomaticEntryImplemented).toBe(false);
});

test('forty Golden Time games net plus eighty coins and reach continuation battle', () => {
  const profile = createGoldenTimeSetProfile();
  let state = {
    ...createMachineState({ credit: 50 }),
    phase: KernelPhase.IDLE,
    mode: GameMode.RAIUN_MODE,
    modeGamesRemaining: 0,
    modeResult: ModeResult.PENDING_GOLDEN_TIME,
    modeResultEvidenceStatus: 'MULTI_SOURCE_MATCH'
  };

  let result = reduceMachine(state, { type: 'ENTER_GOLDEN_TIME', profile });
  expect(result.accepted).toBe(true);
  state = result.state;
  expect(state.mode).toBe(GameMode.GOLDEN_TIME);
  expect(state.modeGamesRemaining).toBe(40);
  expect(state.goldenTimeTreasure).toBe(350000);

  for (let game = 0; game < 40; game++) {
    state = playGoldenTimeGame(state, profile);
  }

  expect(state.credit).toBe(130);
  expect(state.modeGamesRemaining).toBe(0);
  expect(state.modeResult).toBe(ModeResult.PENDING_GT_CONTINUATION);
});

test('continued battle starts the next forty-game set', () => {
  const profile = createGoldenTimeSetProfile();
  let state = {
    ...createMachineState({ credit: 50 }),
    phase: KernelPhase.IDLE,
    mode: GameMode.GOLDEN_TIME,
    modeGamesRemaining: 0,
    modeResult: ModeResult.PENDING_GT_CONTINUATION,
    goldenTimeTreasure: 350000,
    goldenTimeSetNumber: 1
  };
  const resolution = resolveGoldenTimeContinuation(new SequenceRandomSource([0]), state.goldenTimeTreasure);
  const result = reduceMachine(state, { type: 'RESOLVE_GOLDEN_TIME_CONTINUATION', resolution, profile });
  expect(result.accepted).toBe(true);
  expect(result.state.mode).toBe(GameMode.GOLDEN_TIME);
  expect(result.state.modeGamesRemaining).toBe(40);
  expect(result.state.goldenTimeSetNumber).toBe(2);
  expect(result.state.modeResult).toBeNull();
});
