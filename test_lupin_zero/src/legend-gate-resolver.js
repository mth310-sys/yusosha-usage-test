import { GameMode } from './game-flow-spec.js';
import { LEGEND_GATE_SPEC } from './legend-gate-spec.js';

export const LEGEND_GATE_TRIGGER_ROLES = Object.freeze(['PREMIUM', 'LEGEND']);

export function resolveLegendGateTrigger(roleResolution) {
  const role = roleResolution?.role ?? null;
  const hit = LEGEND_GATE_TRIGGER_ROLES.includes(role);
  return Object.freeze({
    hit,
    role,
    presentation: hit ? LEGEND_GATE_SPEC.entry.trigger : null,
    destination: hit ? GameMode.GOLDEN_TIME : null,
    destinationGuaranteed: hit,
    evidenceStatus: hit ? LEGEND_GATE_SPEC.evidence.coreRoleAndFreezeEntry : 'NOT_APPLICABLE'
  });
}

export function createLegendGateEntry(trigger) {
  if (!trigger?.hit) return null;
  return Object.freeze({
    mode: GameMode.LEGEND_GATE,
    presentation: LEGEND_GATE_SPEC.entry.trigger,
    guaranteedDestination: GameMode.GOLDEN_TIME,
    automaticMedalLotteryImplemented: false,
    automaticStockAwardImplemented: false,
    evidenceStatus: LEGEND_GATE_SPEC.evidence.coreRoleAndFreezeEntry,
    unresolved: Object.freeze([
      'MEDAL_ACQUISITION_DISTRIBUTION',
      'EXACT_STOCK_DISTRIBUTION_ABOVE_MINIMUM',
      'EXACT_PREMIUM_LEGEND_PHYSICAL_STOP_PATTERNS'
    ])
  });
}
