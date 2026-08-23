import { GameMode } from './game-flow-spec.js';

export const LEGEND_GATE_SPEC = Object.freeze({
  triggerRoles: Object.freeze(['PREMIUM', 'LEGEND']),
  presentation: 'LONG_FREEZE',
  destination: GameMode.GOLDEN_TIME,
  destinationGuaranteed: true,
  medalSteps: 3,
  medalAcquisitionRates: null,
  stockByMedal: Object.freeze({
    1: Object.freeze({ minimumStocks: 2 }),
    2: Object.freeze({ minimumStocks: 5 }),
    3: Object.freeze({ minimumStocks: 6, specialMovieGames: 70 })
  }),
  evidenceStatus: 'MULTI_SOURCE_MATCH',
  unresolved: Object.freeze([
    'MEDAL_ACQUISITION_RATES',
    'EXACT_STOCK_DISTRIBUTION_ABOVE_MINIMUM',
    'EXACT_PREMIUM_LEGEND_PHYSICAL_STOP_PATTERNS'
  ])
});

export function resolveLegendGateTrigger(roleResolution) {
  const role = roleResolution?.role ?? null;
  const hit = LEGEND_GATE_SPEC.triggerRoles.includes(role);
  return Object.freeze({
    hit,
    role,
    presentation: hit ? LEGEND_GATE_SPEC.presentation : null,
    destination: hit ? LEGEND_GATE_SPEC.destination : null,
    destinationGuaranteed: hit,
    evidenceStatus: hit ? LEGEND_GATE_SPEC.evidenceStatus : 'NOT_APPLICABLE'
  });
}

export function createLegendGateEntry(trigger) {
  if (!trigger?.hit) return null;
  return Object.freeze({
    mode: GameMode.LEGEND_GATE,
    presentation: LEGEND_GATE_SPEC.presentation,
    guaranteedDestination: GameMode.GOLDEN_TIME,
    automaticMedalLotteryImplemented: false,
    automaticStockAwardImplemented: false,
    evidenceStatus: LEGEND_GATE_SPEC.evidenceStatus,
    unresolved: LEGEND_GATE_SPEC.unresolved
  });
}
