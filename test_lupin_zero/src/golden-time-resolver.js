import { ReuseEvidenceStatus } from './reuse-registry.js';
import { VERIFIED_SPEC } from './verified-spec.js';

export const GT_CONTINUATION_BY_TREASURE = Object.freeze({
  100000: 69.7,
  150000: 70.5,
  200000: 71.3,
  250000: 72.0,
  300000: 72.8,
  350000: 73.6,
  400000: 74.4,
  450000: 75.2,
  500000: 76.3,
  550000: 77.5,
  600000: 78.7,
  650000: 79.8,
  700000: 81.0,
  750000: 82.2,
  800000: 85.9,
  850000: 89.7,
  900000: 93.4,
  950000: 97.2,
  1000000: 100.0
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function createGoldenTimeSetProfile() {
  const games = VERIFIED_SPEC.modeProfiles.goldenTime.setGamesApprox;
  return Object.freeze({
    games,
    gamesMeaning: 'APPROXIMATE_PUBLISHED_NOMINAL',
    fixedSetLengthAllowed: false,
    stageResidenceValidationGames: 30,
    continuationBattleEntryGame: null,
    continuationBattlePresentationGames: null,
    setCompositionEvidenceStatus: ReuseEvidenceStatus.UNRESOLVED,
    setCompositionNote: 'The 30G value is a stage-residence validation window, not a confirmed continuation-battle entry point. Published sources describe the set as approximately 40G, while observed play intervals vary around 40G; exact terminal timing remains unresolved.',
    previousB4BattlePresentationGamesCandidate: 4,
    previousB4BattlePresentationEvidenceStatus: 'PRIOR_B4_VERIFIED_PRESENTATION_STRUCTURE_EXTERNAL_RECONFIRMATION_PENDING',
    pureIncreaseCoinsPerGame: VERIFIED_SPEC.modeProfiles.goldenTime.pureIncreaseCoinsPerGame,
    betCoinsPerGame: 3,
    payoutCoinsPerGame: 5,
    initialTreasure: 350000,
    publishedInitialRushAverageTreasure: 342000,
    initialTreasureEvidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
    initialTreasureInference: 'LUPIN RUSH average is about 342,000T. Until the exact four-pattern award table is reconstructed, production starts at the nearest published battle-table step, 350,000T.',
    exactTreasureAcquisitionDuringSetImplemented: false,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
    replaceable: true
  });
}

export function getGoldenTimeContinuationPercent(treasure) {
  if (!Number.isInteger(treasure) || treasure < 0) return null;
  return GT_CONTINUATION_BY_TREASURE[treasure] ?? null;
}

export function resolveGoldenTimeContinuation(randomSource, treasure) {
  requireRandomSource(randomSource);
  const continuationPercent = getGoldenTimeContinuationPercent(treasure);
  if (continuationPercent == null) {
    return Object.freeze({
      eligible: false,
      treasure,
      continuationPercent: null,
      draw: null,
      continued: null,
      evidenceStatus: ReuseEvidenceStatus.UNRESOLVED,
      sourceRelation: 'NO_PUBLISHED_CONTINUATION_RATE_FOR_EXACT_TREASURE'
    });
  }
  const draw = randomSource.nextFloat();
  const continued = continuationPercent >= 100 || draw < continuationPercent / 100;
  return Object.freeze({
    eligible: true,
    treasure,
    continuationPercent,
    draw,
    continued,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
    sourceRelation: 'TREASURE_CONTINUATION_TABLE'
  });
}

export const GOLDEN_TIME_PRODUCTION_POLICY = Object.freeze({
  publishedSetGamesApprox: 40,
  publishedSetGamesMeaning: 'APPROXIMATE',
  fixedFortyGameRuntimeModelAllowed: false,
  fixedThirtyPlusTenRuntimeModelAllowed: false,
  stageResidenceValidationGames: 30,
  stageResidenceValidationMustNotDefineBattleEntry: true,
  continuationBattleExactEntryGame: null,
  continuationBattleExactPresentationGames: null,
  continuationBattleTimingEvidenceStatus: 'UNRESOLVED',
  previousB4BattlePresentationGamesCandidate: 4,
  previousB4BattlePresentationEvidenceStatus: 'PRIOR_B4_VERIFIED_PRESENTATION_STRUCTURE_EXTERNAL_RECONFIRMATION_PENDING',
  continuationBattlePerGameMechanics: 'UNRESOLVED',
  continuationRateLookup: 'EXACT_PUBLISHED_TABLE_POINTS_ONLY',
  floorUnknownTreasureToPublishedStep: false,
  interpolateUnknownTreasure: false,
  unsupportedTreasureOutcome: 'UNRESOLVED_NO_WIN_LOSS',
  pureIncreaseModel: '3_BET_5_PAY',
  initialLupinRushExactAwardTableKnown: false,
  initialTreasureFallback: 350000,
  exactTreasureAcquisitionDuringSetImplemented: false,
  continuationTableUsedDirectly: true,
  oneMillionTreasureContinuationGuaranteed: true,
  extraBonusAtOneMillionImplemented: true,
  extraBonusOddAlignmentStockImplemented: true,
  goldRushEntryBoundaryImplemented: true,
  goldRushRuntimeImplemented: false,
  treasureRushAutomaticEntryImplemented: false
});
