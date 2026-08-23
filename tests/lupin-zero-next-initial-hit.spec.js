import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import {
  NEXT_INITIAL_HIT_TABLE,
  NextInitialHitEvidence,
  resolveNextInitialHit
} from '../test_lupin_zero/src/next-initial-hit-resolver.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

test('published setting table is preserved', () => {
  expect(NEXT_INITIAL_HIT_TABLE[1]).toEqual({ lupinBonusPercent: 98.4, goldenTimePercent: 1.6 });
  expect(NEXT_INITIAL_HIT_TABLE[2]).toEqual({ lupinBonusPercent: 98.4, goldenTimePercent: 1.6 });
  expect(NEXT_INITIAL_HIT_TABLE[3]).toEqual({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 });
  expect(NEXT_INITIAL_HIT_TABLE[4]).toEqual({ lupinBonusPercent: 96.9, goldenTimePercent: 3.1 });
  expect(NEXT_INITIAL_HIT_TABLE[5]).toEqual({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 });
  expect(NEXT_INITIAL_HIT_TABLE[6]).toEqual({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 });
});

test('setting 1 Golden Time boundary is 1.6 percent', () => {
  const hit = resolveNextInitialHit(new SequenceRandomSource([0.015999]), 1, 'AFTER_BONUS_OR_ART');
  expect(hit.destination).toBe(GameMode.GOLDEN_TIME);
  expect(hit.evidenceStatus).toBe(NextInitialHitEvidence.AFTER_BONUS_OR_ART);

  const bonus = resolveNextInitialHit(new SequenceRandomSource([0.016]), 1, 'AFTER_BONUS_OR_ART');
  expect(bonus.destination).toBe(GameMode.LUPIN_BONUS);
});

test('initial boot reservation stays inferred rather than published', () => {
  const initial = resolveNextInitialHit(new SequenceRandomSource([0.5]), 1, 'INITIAL_BOOT');
  expect(initial.destination).toBe(GameMode.LUPIN_BONUS);
  expect(initial.evidenceStatus).toBe(NextInitialHitEvidence.INITIAL_BOOT);
});

test('unsupported settings are not silently interpolated', () => {
  expect(() => resolveNextInitialHit(new SequenceRandomSource([0]), 7, 'AFTER_BONUS_OR_ART')).toThrow();
});
