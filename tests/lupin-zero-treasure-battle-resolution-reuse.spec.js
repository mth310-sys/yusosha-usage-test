import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { GT_CONTINUATION_BY_TREASURE, getGoldenTimeContinuationPercent } from '../test_lupin_zero/src/golden-time-resolver.js';
import { TREASURE_PROFILE as PREVIOUS_B4_TREASURE_PROFILE } from '../test_lupin_b4/js/treasure-profile.js';
import {
  TREASURE_BATTLE_RESOLUTION_POLICY,
  prepareTreasureBattleResolution
} from '../test_lupin_zero/src/treasure-battle-resolution-adapter.js';
import { createGoldenTimeSetProfile } from '../test_lupin_zero/src/golden-time-resolver.js';
import { createMachineState, reduceMachine, KernelPhase, ModeResult } from '../test_lupin_zero/src/machine-kernel.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

test('Zero and prior B4 use the same exact published Treasure continuation table points', () => {
  expect(GT_CONTINUATION_BY_TREASURE).toEqual(PREVIOUS_B4_TREASURE_PROFILE.continuationPct);
  expect(TREASURE_BATTLE_RESOLUTION_POLICY.duplicateContinuationTableImplemented).toBe(false);
  expect(TREASURE_BATTLE_RESOLUTION_POLICY.opponentDistributionUsedForOutcome).toBe(false);
  expect(TREASURE_BATTLE_RESOLUTION_POLICY.chanceUpDistributionUsedForOutcome).toBe(false);
});

test('published table point prepares hidden Treasure Battle win or loss using Zero resolver', () => {
  const win = prepareTreasureBattleResolution(new SequenceRandomSource([0]), 350000);
  expect(win.eligible).toBe(true);
  expect(win.hiddenOutcome).toBe('WIN');
  expect(win.continuation.continuationPercent).toBe(73.6);
  expect(win.presentationGamesCandidate).toBe(4);

  const lose = prepareTreasureBattleResolution(new SequenceRandomSource([0.99]), 350000);
  expect(lose.eligible).toBe(true);
  expect(lose.hiddenOutcome).toBe('LOSE');
  expect(lose.continuation.continuationPercent).toBe(73.6);
});

test('unpublished treasure value does not floor, interpolate, or become a synthetic loss', () => {
  expect(getGoldenTimeContinuationPercent(425000)).toBeNull();
  const unresolved = prepareTreasureBattleResolution(new SequenceRandomSource([0]), 425000);
  expect(unresolved.eligible).toBe(false);
  expect(unresolved.hiddenOutcome).toBeNull();
  expect(unresolved.continuation.continuationPercent).toBeNull();
  expect(unresolved.continuation.continued).toBeNull();
  expect(unresolved.evidenceStatus).toBe('UNRESOLVED');
});

test('kernel refuses unresolved Treasure Battle outcome instead of treating it as defeat', () => {
  const profile = createGoldenTimeSetProfile();
  const state = {
    ...createMachineState({ credit: 50 }),
    phase: KernelPhase.IDLE,
    mode: GameMode.GOLDEN_TIME,
    modeGamesRemaining: 0,
    modeResult: ModeResult.PENDING_GT_CONTINUATION,
    goldenTimeTreasure: 425000,
    goldenTimeSetNumber: 1
  };
  const unresolved = prepareTreasureBattleResolution(new SequenceRandomSource([0]), 425000).continuation;
  const result = reduceMachine(state, { type: 'RESOLVE_GOLDEN_TIME_CONTINUATION', resolution: unresolved, profile });
  expect(result.accepted).toBe(false);
  expect(result.state.mode).toBe(GameMode.GOLDEN_TIME);
  expect(result.state.modeResult).toBe(ModeResult.PENDING_GT_CONTINUATION);
  expect(result.state.goldenTimeTreasure).toBe(425000);
});
