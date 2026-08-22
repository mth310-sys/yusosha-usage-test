import { test, expect } from '@playwright/test';
import { createMachineState, reduceMachine } from '../test_lupin_zero/src/machine-kernel.js';
import { getMbFollowupGameSettlement, MB_FOLLOWUP_POLICY } from '../test_lupin_zero/src/mb-followup.js';

test('MB followup is two 3-coin games with 10-coin payout each for net +14', () => {
  let state = createMachineState({ credit: 50, maxBet: 3 });

  let step = reduceMachine(state, {
    type: 'SETTLE_NORMAL_ROLE',
    role: 'MB',
    creditDelta: 0,
    replayAutoBet: 0,
    mbFollowupGames: 2,
    evidenceStatus: 'MULTI_SOURCE_MATCH'
  });
  expect(step.accepted).toBe(true);
  state = step.state;
  expect(state.mbFollowupGamesRemaining).toBe(2);

  const followup = getMbFollowupGameSettlement();
  expect(followup.creditDelta).toBe(10);
  expect(followup.betCoinsPerGame).toBe(3);

  for (const expectedRemaining of [1, 0]) {
    step = reduceMachine(state, { type: 'MAX_BET' });
    expect(step.accepted).toBe(true);
    state = step.state;

    step = reduceMachine(state, { type: 'START' });
    expect(step.accepted).toBe(true);
    state = step.state;

    for (const reelIndex of [0, 1, 2]) {
      step = reduceMachine(state, { type: 'STOP_REEL', reelIndex });
      expect(step.accepted).toBe(true);
      state = step.state;
    }

    step = reduceMachine(state, {
      type: 'SETTLE_MB_FOLLOWUP_GAME',
      creditDelta: followup.creditDelta,
      evidenceStatus: followup.evidenceStatus
    });
    expect(step.accepted).toBe(true);
    state = step.state;
    expect(state.mbFollowupGamesRemaining).toBe(expectedRemaining);
  }

  expect(state.credit).toBe(64);
  expect(MB_FOLLOWUP_POLICY.netGainPerMb).toBe(14);
});

test('MB followup does not run normal role or liquid chance-eye lottery', () => {
  expect(MB_FOLLOWUP_POLICY.normalRoleLotteryRunsDuringFollowup).toBe(false);
  expect(MB_FOLLOWUP_POLICY.liquidChanceEyeLotteryRunsDuringFollowup).toBe(false);
  expect(MB_FOLLOWUP_POLICY.exactPhysicalStopPatternDuringFollowupKnown).toBe(false);
  expect(MB_FOLLOWUP_POLICY.payoutEvidenceStatus).toBe('MULTI_SOURCE_MATCH');
});
