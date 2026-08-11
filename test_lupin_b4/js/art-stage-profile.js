// Step 6Z: GOLDEN TIME internal stage system, cross-checked against published analysis.
// Normal visible stages each have internal A/B ranks. Treasure-hit rates are common
// between A/B of the same visible stage. Every 10G the internal stage rises by 1 or 2
// ranks according to a scenario; IKUKAN is the special 10G top stage.
export const ART_STAGE_PROFILE = Object.freeze({
  visibleOrder:['JAPAN','SWISS','CARIBBEAN','UNDERGROUND','IKUKAN'],
  internalOrder:['JAPAN_A','JAPAN_B','SWISS_A','SWISS_B','CARIBBEAN_A','CARIBBEAN_B','UNDERGROUND_A','UNDERGROUND_B','IKUKAN'],
  stages:{
    JAPAN:{label:'日本', treasureHitDenominator:16.9, special:false, rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'},
    SWISS:{label:'スイス', treasureHitDenominator:12.6, special:false, rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'},
    CARIBBEAN:{label:'カリブ海', treasureHitDenominator:7.5, special:false, rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'},
    UNDERGROUND:{label:'地底都市', treasureHitDenominator:3.0, special:false, rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'},
    IKUKAN:{label:'異空間', treasureHitDenominator:1.0, special:true, durationGames:10, minimumTreasurePerGame:50000, averageTreasurePoints:702000, rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'}
  },
  internalRanks:Object.freeze({
    JAPAN_A:{visible:'JAPAN'}, JAPAN_B:{visible:'JAPAN'},
    SWISS_A:{visible:'SWISS'}, SWISS_B:{visible:'SWISS'},
    CARIBBEAN_A:{visible:'CARIBBEAN'}, CARIBBEAN_B:{visible:'CARIBBEAN'},
    UNDERGROUND_A:{visible:'UNDERGROUND'}, UNDERGROUND_B:{visible:'UNDERGROUND'},
    IKUKAN:{visible:'IKUKAN'}
  }),
  inSetDowngrade:false,
  transitionEveryGames:10,
  transitionDirection:'UP_ONLY',
  transitionSteps:[1,2],
  twoStepUpgradePctByScenario:Object.freeze({A:25.0,B:37.5,C:50.0,D:75.0}),
  ikukanCanEnterAtGame30:true,
  startStageDistribution:'PARTIALLY_PUBLISHED_BUT_NOT_YET_MODELED',
  scenarioSelectionDistribution:'PARTIALLY_PUBLISHED_BUT_NOT_YET_MODELED',
  normalStageTreasureAmountDistribution:'UNVERIFIED',
  sourceLevel:'PUBLISHED_ANALYSIS_CROSS_CHECKED',
  automaticUsePolicy:'STAGE_HIT_RATES_AND_10G_UPGRADE_RULE_MAY_BE_MODELED; DO_NOT_SYNTHESIZE UNRESOLVED START/SCENARIO DISTRIBUTIONS'
});

export function getArtStage(stage){return ART_STAGE_PROFILE.stages[stage]??null;}
export function getInternalArtStage(rank){return ART_STAGE_PROFILE.internalRanks[rank]??null;}
export function rollStageTreasureHit(stage,rng){const row=getArtStage(stage);if(!row)return false;return rng.next()<1/row.treasureHitDenominator;}
export function rollTwoStepStageUpgrade(scenario,rng){const pct=ART_STAGE_PROFILE.twoStepUpgradePctByScenario[scenario];if(pct==null)return null;return rng.next()<pct/100?2:1;}
