import { test, expect } from '@playwright/test';
import { createMachineState, reduceMachine, KernelPhase } from '../test_lupin_zero/src/machine-kernel.js';
import { getNormalRoleSettlement, NORMAL_ROLE_SETTLEMENT_POLICY } from '../test_lupin_zero/src/normal-role-settlement.js';

function completedSpinState(credit = 47) {
  return {
    ...createMachineState({ credit, maxBet: 3 }),
    phase: KernelPhase.IDLE,
    bet: 0,
    stopped: Object.freeze([true, true, true]),
    spinId: 1
  };
}

test('3, 9 and 10 coin roles add published payout to credit', () => {
  for (const [role, payout] of [['THREE_COIN', 3], ['NINE_COIN', 9], ['TEN_COIN', 10]]) {
    const settlement = getNormalRoleSettlement({ role, evidenceStatus: 'MULTI_SOURCE_MATCH' }, 3);
    const reduced = reduceMachine(completedSpinState(47), { type: 'SETTLE_NORMAL_ROLE', ...settlement });
    expect(reduced.accepted).toBe(true);
    expect(reduced.state.credit).toBe(47 + payout);
    expect(reduced.state.lastPayout).toBe(payout);
    expect(reduced.state.lastSettledRole).toBe(role);
  }
});

test('replay prepares the next max-bet game without consuming more credit', () => {
  const settlement = getNormalRoleSettlement({ role: 'REPLAY', evidenceStatus: 'MULTI_SOURCE_MATCH' }, 3);
  expect(settlement.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  const reduced = reduceMachine(completedSpinState(47), { type: 'SETTLE_NORMAL_ROLE', ...settlement });
  expect(reduced.state.credit).toBe(47);
  expect(reduced.state.bet).toBe(3);
  expect(reduced.state.phase).toBe(KernelPhase.READY);
});

test('MB reserves exactly two followup games without inventing their payout execution', () => {
  const settlement = getNormalRoleSettlement({ role: 'MB', evidenceStatus: 'MULTI_SOURCE_MATCH' }, 3);
  const reduced = reduceMachine(completedSpinState(47), { type: 'SETTLE_NORMAL_ROLE', ...settlement });
  expect(reduced.state.credit).toBe(47);
  expect(reduced.state.mbFollowupGamesRemaining).toBe(2);
  expect(NORMAL_ROLE_SETTLEMENT_POLICY.mbFollowupPayoutExecutionImplementedHere).toBe(false);
});

test('replay inference is never automatically promoted to verified evidence', () => {
  expect(NORMAL_ROLE_SETTLEMENT_POLICY.replayAutoBetEvidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(NORMAL_ROLE_SETTLEMENT_POLICY.replayAutoBetMayBePromotedToVerifiedAutomatically).toBe(false);
});
