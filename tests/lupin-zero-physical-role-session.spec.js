import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { PhysicalRoleSession } from '../test_lupin_zero/src/physical-role-session.js';
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
  const session = new PhysicalRoleSession({ randomSource: new SequenceRandomSource([0.01]), setting: 1 });
  const spin = session.start(7);

  expect(spin.production.kind).toBe('KNOWN_ROLE');
  expect(spin.production.role).toBe('MB');
  expect(spin.stopPlan.middleLineSymbols).toEqual(['次元', '五エ門', 'ルパン']);
  expect(session.stopSymbol(0)).toBe('次元');
  expect(session.stopSymbol(1)).toBe('五エ門');
  expect(session.stopSymbol(2)).toBe('ルパン');
  expect(spin.stopPlan.exactFullReelPositionsKnown).toBe(false);
});

test('non-MB role does not invent a physical stop pattern', () => {
  const session = new PhysicalRoleSession({ randomSource: new SequenceRandomSource([0]), setting: 1 });
  const spin = session.start(1);

  expect(spin.production.role).toBe('PREMIUM');
  expect(spin.stopPlan.middleLineSymbols).toBeNull();
  expect(spin.stopPlan.status).toBe('UNRESOLVED');
  expect(session.stopSymbol(0)).toBeNull();
});
