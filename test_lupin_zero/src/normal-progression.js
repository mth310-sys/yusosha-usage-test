import { VERIFIED_SPEC } from './verified-spec.js';
import { ReuseEvidenceStatus } from './reuse-registry.js';

export const WANTED_RESET_CONTEXT = Object.freeze({
  AFTER_BONUS_ART_OR_RESET: 'afterBonusArtOrReset',
  AFTER_WANTED: 'afterWanted'
});

export const WANTED_WINDOWS = Object.freeze(
  VERIFIED_SPEC.modeProfiles.wantedChance.cycleRanges.map((label, index) => {
    const [start, end] = label.split('-').map(Number);
    return Object.freeze({ index, label, start, end });
  })
);

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

function getWeights(setting, context) {
  if (context === WANTED_RESET_CONTEXT.AFTER_BONUS_ART_OR_RESET) {
    return VERIFIED_SPEC.modeProfiles.wantedChance.afterBonusArtOrReset;
  }
  if (context === WANTED_RESET_CONTEXT.AFTER_WANTED) {
    return VERIFIED_SPEC.modeProfiles.wantedChance.afterWantedBySetting[setting] ?? null;
  }
  return null;
}

export function selectWantedWindow(randomSource, setting = 1, context = WANTED_RESET_CONTEXT.AFTER_BONUS_ART_OR_RESET) {
  requireRandomSource(randomSource);
  const weights = getWeights(setting, context);
  if (!weights) throw new Error(`Unknown WANTED window profile: setting=${setting} context=${context}`);

  const total = weights.reduce((sum, value) => sum + value, 0);
  const draw = randomSource.nextFloat();
  let cursor = 0;
  let selectedIndex = weights.length - 1;

  for (let i = 0; i < weights.length; i++) {
    cursor += weights[i] / total;
    if (draw < cursor) {
      selectedIndex = i;
      break;
    }
  }

  const window = WANTED_WINDOWS[selectedIndex];
  return Object.freeze({
    setting,
    context,
    draw,
    window,
    publishedWeightPercent: weights[selectedIndex],
    normalizedOnlyForPublishedRounding: true,
    exactGameWithinWindowKnown: false,
    productionTriggerGame: window.end,
    productionTriggerEvidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
    productionTriggerInference: 'The published 32G range is preserved exactly. Until the exact in-window trigger distribution is known, production fires at the inclusive window end so the trigger never leaves the published range.',
    replaceable: true
  });
}

export const RAIUN_COUNTER_SPEC = Object.freeze({
  targetPoints: VERIFIED_SPEC.modeProfiles.raiunHigh.entryCounterPoints,
  highGames: VERIFIED_SPEC.modeProfiles.raiunHigh.games,
  initialAveragePoints: 22.6,
  incrementDenominatorRange: Object.freeze([7.0, 7.1]),
  averageIncrementOnHit: 3.3,
  averageGamesToTarget: 190,
  exactInitialPointDistributionKnown: false,
  exactIncrementDistributionKnown: false,
  automaticPointGenerationImplemented: true,
  productionInferenceModule: './raiun-counter-resolver.js',
  evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  replaceable: true
});

export const NORMAL_PROGRESSION_POLICY = Object.freeze({
  wantedPublishedWindowWeightsUsedDirectly: true,
  wantedExactInWindowTriggerKnown: false,
  wantedProductionFallback: 'WINDOW_END',
  wantedProductionFallbackEvidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  raiunTarget100PointsImplemented: true,
  raiunHighSevenGamesImplemented: true,
  raiunUnknownPointDistributionInvented: false,
  raiunProductionInferenceImplemented: true,
  raiunProductionInferenceEvidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  raiunProductionInferenceReplaceable: true
});
