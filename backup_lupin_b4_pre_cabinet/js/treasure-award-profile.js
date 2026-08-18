import { TREASURE_DISTRIBUTION_RECOVERY, isTreasureDistributionReady } from './treasure-distribution-recovery.js?v=step6z-recovery1';

// Step 6Z: verified ART treasure award facts.
export const TREASURE_AWARD_PROFILE = Object.freeze({
  normalTAlignment: Object.freeze({
    minimumPoints: 100000,
    maximumPoints: 1000000,
    averagePointsApprox: 120000,
    averagePointsSourceLevel: 'PUBLISHED_ANALYSIS_TEXT',
    distribution: null,
    distributionStatus: TREASURE_DISTRIBUTION_RECOVERY.normalTAlignment.blocker,
    distributionTableLabel: 'T揃い時の上乗せポイント振り分け',
    distributionTableHost: 'P_GABU',
    recoveryPolicy: 'REQUIRE_DIRECT_TABLE_VALUES_OR_CLEAR_SOURCE_IMAGE_DO_NOT_OCR_OR_INFER',
    automaticDistributionPolicy: 'CENTRAL_RECOVERY_REGISTRY_MUST_BE_READY',
    source: 'VERIFIED_MIN_100K_MAX_1M_AVG_APPROX_120K'
  }),
  presentationFloors: Object.freeze({
    GOLD_T_SYMBOL: Object.freeze({ minimumTreasurePoints:300000, sourceLevel:'1GEKI_PUBLISHED_ANALYSIS' }),
    GOLD_GENERIC_ART_CUE: Object.freeze({ minimumTreasurePoints:500000, alternateBenefitPossible:true, sourceLevel:'1GEKI_PUBLISHED_ANALYSIS' }),
    RAINBOW_ART_CUE: Object.freeze({ minimumTreasurePoints:1000000, alternateBenefitPossible:true, sourceLevel:'1GEKI_PUBLISHED_ANALYSIS' }),
    ATTACK_VISION_ART_CUE: Object.freeze({ minimumTreasurePoints:1000000, continuationBenefitPossible:true, sourceLevel:'1GEKI_PUBLISHED_ANALYSIS' })
  }),
  oreNoNaWaLupinRush: Object.freeze({denominator:554.6,awardPoints:1000000,source:'VERIFIED_1_OVER_554_6_AND_1M_AWARD'})
});

export function getTreasurePresentationFloor(key){return TREASURE_AWARD_PROFILE.presentationFloors[key]??null;}
export function hasVerifiedNormalTAwardDistribution(){return isTreasureDistributionReady('normalTAlignment')&&Array.isArray(TREASURE_AWARD_PROFILE.normalTAlignment.distribution);}
export function canAutoDrawNormalTAward(){return hasVerifiedNormalTAwardDistribution();}
export function rollOreNoNaWaLupinRush(rng){return rng.next()<1/TREASURE_AWARD_PROFILE.oreNoNaWaLupinRush.denominator;}
