import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { PhysicalRoleSession, getPhysicalStopPlan, PHYSICAL_ROLE_SESSION_POLICY } from '../test_lupin_zero/src/physical-role-session.js';
import { adaptNormalRoleForProduction, NORMAL_ROLE_PRODUCTION_POLICY } from '../test_lupin_zero/src/normal-role-production-adapter.js';

test('unresolved residual becomes replaceable high-confidence no-payout fallback', () => {
  const adapted = adaptNormalRoleForProduction(Object.freeze({
    kind: 'UNRESOLVED_OTHER',
    role: null,
    draw: 0.9,
    setting: 1,
    evidenceStatus: 'UNRESOLVED'
  }));

  expect(adapted.kind).toBe('INFERRED_ROLE');
  expect(adapted.role).toBe('NO_PAYOUT_OTHER');
  expect(adapted.payoutCoins).toBe(0);
  expect(adapted.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(adapted.replaceable).toBe(true);
  expect(NORMAL_ROLE_PRODUCTION_POLICY.fallbackMayBePromotedToVerifiedAutomatically).toBe(false);
});

test('MB role exposes only the published middle-line 次元・五エ門・ルパン stop pattern', () => {
  const plan = getPhysicalStopPlan({ role: 'MB' });
  expect(plan.middleLineSymbols).toEqual(['次元', '五エ門', 'ルパン']);
  expect(plan.reversePushCutIn).toBe(false);
  expect(plan.exactFullReelPositionsKnown).toBe(false);
});

test('RUPIN REPLAY A/B/C/D expose only verified reel-presence patterns', () => {
  const a = getPhysicalStopPlan({ role: 'RUPIN_REPLAY_A' });
  const b = getPhysicalStopPlan({ role: 'RUPIN_REPLAY_B' });
  const c = getPhysicalStopPlan({ role: 'RUPIN_REPLAY_C' });
  const d = getPhysicalStopPlan({ role: 'PREMIUM' });

  expect(a.targetReelsWithLupinSymbol).toEqual([0]);
  expect(b.targetReelsWithLupinSymbol).toEqual([1, 2]);
  expect(c.targetReelsWithLupinSymbol).toEqual([0, 2]);
  expect(d.targetReelsWithLupinSymbol).toEqual([0, 1, 2]);

  for (const plan of [a, b, c, d]) {
    expect(plan.reversePushCutIn).toBe(true);
    expect(plan.middleLineSymbols).toBeNull();
    expect(plan.exactLupinStopRowKnown).toBe(false);
    expect(plan.exactFullReelPositionsKnown).toBe(false);
  }
  expect(a.longFreezeOnLupinAlignment).toBe(false);
  expect(b.longFreezeOnLupinAlignment).toBe(false);
  expect(c.longFreezeOnLupinAlignment).toBe(false);
  expect(d.longFreezeOnLupinAlignment).toBe(true);
});

test('PhysicalRoleSession can report verified Lupin-symbol reel presence without inventing a stop row', () => {
  const session = new PhysicalRoleSession({ randomSource: new SequenceRandomSource([0]), setting: 1 });
  const spin = session.start(1);
  expect(spin.production.role).toBe('PREMIUM');
  expect(spin.stopPlan.middleLineSymbols).toBeNull();
  expect(session.hasVerifiedLupinSymbolOnReel(0)).toBe(true);
  expect(session.hasVerifiedLupinSymbolOnReel(1)).toBe(true);
  expect(session.hasVerifiedLupinSymbolOnReel(2)).toBe(true);
  expect(session.stopSymbol(0)).toBeNull();
});

test('ordinary non-MB non-RUPIN role does not invent a physical stop pattern', () => {
  const plan = getPhysicalStopPlan({ role: 'REPLAY' });
  expect(plan.middleLineSymbols).toBeNull();
  expect(plan.targetReelsWithLupinSymbol).toEqual([]);
  expect(plan.status).toBe('UNRESOLVED');
});

test('policy explicitly preserves unresolved stop-row/full-strip boundaries', () => {
  expect(PHYSICAL_ROLE_SESSION_POLICY.rupinReplayReelPresencePatternsConnected).toBe(true);
  expect(PHYSICAL_ROLE_SESSION_POLICY.rupinReplayExactStopRowInvented).toBe(false);
  expect(PHYSICAL_ROLE_SESSION_POLICY.completeReelStripsRequiredForExactStops).toBe(true);
});
