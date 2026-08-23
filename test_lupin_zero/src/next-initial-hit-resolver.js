import { GameMode } from './game-flow-spec.js';

export const NEXT_INITIAL_HIT_TABLE = Object.freeze({
  1: Object.freeze({ lupinBonusPercent: 98.4, goldenTimePercent: 1.6 }),
  2: Object.freeze({ lupinBonusPercent: 98.4, goldenTimePercent: 1.6 }),
  3: Object.freeze({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 }),
  4: Object.freeze({ lupinBonusPercent: 96.9, goldenTimePercent: 3.1 }),
  5: Object.freeze({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 }),
  6: Object.freeze({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 })
});

export const NextInitialHitEvidence = Object.freeze({
  AFTER_BONUS_OR_ART: 'PUBLISHED_ANALYSIS',
  INITIAL_BOOT: 'INFERRED_HIGH_CONFIDENCE'
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

export function resolveNextInitialHit(randomSource, setting = 1, context = 'AFTER_BONUS_OR_ART') {
  requireRandomSource(randomSource);
  const table = NEXT_INITIAL_HIT_TABLE[setting];
  if (!table) throw new RangeError(`unsupported setting: ${setting}`);
  const draw = randomSource.nextFloat();
  const goldenTime = draw < table.goldenTimePercent / 100;
  return Object.freeze({
    destination: goldenTime ? GameMode.GOLDEN_TIME : GameMode.LUPIN_BONUS,
    draw,
    setting,
    lupinBonusPercent: table.lupinBonusPercent,
    goldenTimePercent: table.goldenTimePercent,
    context,
    evidenceStatus: context === 'AFTER_BONUS_OR_ART'
      ? NextInitialHitEvidence.AFTER_BONUS_OR_ART
      : NextInitialHitEvidence.INITIAL_BOOT
  });
}
