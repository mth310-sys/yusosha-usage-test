import { ReuseEvidenceStatus } from './reuse-registry.js';

export const GOLD_RUSH_SPEC = Object.freeze({
  entryTrigger: 'EXTRA_BONUS_GOLD_7_ALIGNED',
  continuationPercent: 52.6,
  averageGames: 2.1,
  stockPerContinuedGameMinimum: 1,
  returnDestination: 'EXTRA_BONUS',
  evidenceStatus: ReuseEvidenceStatus.MULTI_SOURCE_MATCH
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function resolveGoldRushGame(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const continued = draw < GOLD_RUSH_SPEC.continuationPercent / 100;
  return Object.freeze({
    draw,
    continued,
    continuationPercent: GOLD_RUSH_SPEC.continuationPercent,
    stockAward: continued ? GOLD_RUSH_SPEC.stockPerContinuedGameMinimum : 0,
    evidenceStatus: GOLD_RUSH_SPEC.evidenceStatus
  });
}
