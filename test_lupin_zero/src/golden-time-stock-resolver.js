import { GameMode } from './game-flow-spec.js';

export function resolveGoldenTimeContinuationPriority(snapshot = {}) {
  const eligible = snapshot.mode === GameMode.GOLDEN_TIME
    && snapshot.modeResult === 'PENDING_GT_CONTINUATION';
  const stockCount = Number.isInteger(snapshot.goldenTimeStockCount)
    ? Math.max(0, snapshot.goldenTimeStockCount)
    : 0;

  if (!eligible) {
    return Object.freeze({ accepted: false, route: 'NONE', stockCount });
  }

  if (stockCount > 0) {
    return Object.freeze({
      accepted: true,
      route: 'STOCK',
      stockBefore: stockCount,
      stockAfter: stockCount - 1,
      continuationGuaranteed: true,
      evidenceStatus: 'PUBLISHED_ANALYSIS'
    });
  }

  return Object.freeze({
    accepted: true,
    route: 'TREASURE_BATTLE',
    stockBefore: 0,
    stockAfter: 0,
    continuationGuaranteed: false,
    evidenceStatus: 'PUBLISHED_ANALYSIS'
  });
}
