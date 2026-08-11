// Step 6Z correction: GOLDEN TIME stage data with source confidence.
// Published pages confirm the stage order/behavior, while the numeric normal-stage
// treasure-hit denominators below are published as practical-play observations (実戦値),
// not manufacturer/analysis-table probabilities. Keep them for debug/reference only.
export const ART_STAGE_PROFILE = Object.freeze({
  order:['JAPAN','SWISS','CARIBBEAN','UNDERGROUND','IKUKAN'],
  stages:{
    JAPAN:{label:'日本', treasureHitDenominator:16.9, special:false, rateConfidence:'EMPIRICAL_PUBLISHED_PLAY_DATA'},
    SWISS:{label:'スイス', treasureHitDenominator:12.6, special:false, rateConfidence:'EMPIRICAL_PUBLISHED_PLAY_DATA'},
    CARIBBEAN:{label:'カリブ海', treasureHitDenominator:7.5, special:false, rateConfidence:'EMPIRICAL_PUBLISHED_PLAY_DATA'},
    UNDERGROUND:{label:'地底都市', treasureHitDenominator:3.0, special:false, rateConfidence:'EMPIRICAL_PUBLISHED_PLAY_DATA'},
    IKUKAN:{label:'異空間', treasureHitDenominator:1.0, special:true, durationGames:10, minimumTreasurePerGame:50000, rateConfidence:'PUBLISHED_ANALYSIS_BEHAVIOR'}
  },
  inSetDowngrade:false,
  inSetDowngradeConfidence:'PUBLISHED_DESCRIPTION',
  transitionTimingObserved:'10G_INTERVALS_EXPERIMENTAL',
  ikukanEntryTimingObserved:'30G_POSSIBLE_EXPERIMENTAL',
  startStageDistribution:'UNVERIFIED',
  transitionDistribution:'UNVERIFIED',
  normalStageTreasureAmountDistribution:'UNVERIFIED',
  automaticUsePolicy:'NORMAL_STAGE_EMPIRICAL_RATES_RETAINED_FOR_EXISTING_TEST_MODEL_BUT_NOT_TREATED_AS_EXACT_ANALYSIS_VALUES'
});

export function getArtStage(stage){return ART_STAGE_PROFILE.stages[stage]??null;}
export function rollStageTreasureHit(stage,rng){const row=getArtStage(stage);if(!row)return false;return rng.next()<1/row.treasureHitDenominator;}
