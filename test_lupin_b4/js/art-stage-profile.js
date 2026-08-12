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
    IKUKAN:{
      label:'異空間',
      treasureHitDenominator:1.0,
      special:true,
      durationGames:10,
      minimumTreasurePerGame:50000,
      averageTreasurePoints:700000,
      alternatePublishedAverageTreasurePoints:702000,
      averageValueStatus:'CROSS_SOURCE_700K_VS_702K_MINOR_DIFFERENCE_RECORDED',
      perGameAwardDistribution:null,
      perGameAwardDistributionStatus:'SOURCE_IMAGE_TABLE_LOCATED_NUMERIC_CELLS_NOT_SAFELY_TRANSCRIBED',
      perGameAwardDistributionSourceLocation:'P_GABU_IKUKAN_PER_GAME_AWARD_IMAGE_TABLE',
      fiveManShareRelativeToTreasureRush:'HIGHER_THAN_TREASURE_RUSH_PUBLISHED_DESCRIPTION',
      rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'
    }
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
  startStageDistribution:'RECOVERED_AND_MODELED_IN_ART_STAGE_SCENARIO_PROFILE',
  scenarioSelectionDistribution:'RECOVERED_AND_MODELED_BY_SETTING_IN_ART_STAGE_SCENARIO_PROFILE',
  scenarioSelectionConfidence:'HIGH_CROSS_SOURCE_MATCH',
  initialStageDistributionConfidence:'HIGH_CROSS_SOURCE_MATCH',
  normalStageTreasureAmountDistribution:'UNVERIFIED_IMAGE_TABLE_NOT_RECOVERED',
  normalStageTreasureAveragePoints:120000,
  normalStageTreasureAverageSource:'PUBLISHED_ANALYSIS_TEXT',
  sourceLevel:'PUBLISHED_ANALYSIS_CROSS_CHECKED',
  automaticUsePolicy:'SCENARIO_SELECTION_INITIAL_STAGE_STAGE_HIT_RATES_AND_10G_UPGRADE_RULES_MAY_BE_MODELED; DO NOT SYNTHESIZE NORMAL_TREASURE_AMOUNT_DISTRIBUTION IKUKAN_PER_GAME_DISTRIBUTION OR IKUKAN_EXIT_DESTINATION'
});

export function getArtStage(stage){return ART_STAGE_PROFILE.stages[stage]??null;}
export function getInternalArtStage(rank){return ART_STAGE_PROFILE.internalRanks[rank]??null;}
export function rollStageTreasureHit(stage,rng){const row=getArtStage(stage);if(!row)return false;return rng.next()<1/row.treasureHitDenominator;}
export function rollTwoStepStageUpgrade(scenario,rng){const pct=ART_STAGE_PROFILE.twoStepUpgradePctByScenario[scenario];if(pct==null)return null;return rng.next()<pct/100?2:1;}
export function hasVerifiedIkukanAwardDistribution(){const x=ART_STAGE_PROFILE.stages.IKUKAN.perGameAwardDistribution;return Array.isArray(x)&&x.length>0;}
