import { TREASURE_DISTRIBUTION_RECOVERY, isTreasureDistributionReady } from './treasure-distribution-recovery.js?v=step6z-recovery1';

// Step 6Z: GOLDEN TIME internal stage system, cross-checked against published analysis.
export const ART_STAGE_PROFILE = Object.freeze({
  visibleOrder:['JAPAN','SWISS','CARIBBEAN','UNDERGROUND','IKUKAN'],
  internalOrder:['JAPAN_A','JAPAN_B','SWISS_A','SWISS_B','CARIBBEAN_A','CARIBBEAN_B','UNDERGROUND_A','UNDERGROUND_B','IKUKAN'],
  stages:{
    JAPAN:{label:'日本',treasureHitDenominator:16.9,special:false,rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'},
    SWISS:{label:'スイス',treasureHitDenominator:12.6,special:false,rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'},
    CARIBBEAN:{label:'カリブ海',treasureHitDenominator:7.5,special:false,rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'},
    UNDERGROUND:{label:'地底都市',treasureHitDenominator:3.0,special:false,rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'},
    IKUKAN:{
      label:'異空間',treasureHitDenominator:1.0,special:true,durationGames:10,minimumTreasurePerGame:50000,
      averageTreasurePoints:700000,alternatePublishedAverageTreasurePoints:702000,
      averageValueStatus:'CROSS_SOURCE_700K_VS_702K_MINOR_DIFFERENCE_RECORDED',
      perGameAwardDistribution:null,
      perGameAwardDistributionStatus:TREASURE_DISTRIBUTION_RECOVERY.ikukanPerGame.blocker,
      perGameAwardDistributionSourceLocation:'P_GABU_IKUKAN_PER_GAME_AWARD_IMAGE_TABLE',
      automaticAwardGate:'CENTRAL_RECOVERY_REGISTRY_MUST_BE_READY',
      fiveManShareRelativeToTreasureRush:'HIGHER_THAN_TREASURE_RUSH_PUBLISHED_DESCRIPTION',
      rateConfidence:'PUBLISHED_ANALYSIS_CROSS_CHECKED'
    }
  },
  internalRanks:Object.freeze({JAPAN_A:{visible:'JAPAN'},JAPAN_B:{visible:'JAPAN'},SWISS_A:{visible:'SWISS'},SWISS_B:{visible:'SWISS'},CARIBBEAN_A:{visible:'CARIBBEAN'},CARIBBEAN_B:{visible:'CARIBBEAN'},UNDERGROUND_A:{visible:'UNDERGROUND'},UNDERGROUND_B:{visible:'UNDERGROUND'},IKUKAN:{visible:'IKUKAN'}}),
  inSetDowngrade:false,transitionEveryGames:10,transitionDirection:'UP_ONLY',transitionSteps:[1,2],
  twoStepUpgradePctByScenario:Object.freeze({A:25.0,B:37.5,C:50.0,D:75.0}),ikukanCanEnterAtGame30:true,
  startStageDistribution:'RECOVERED_AND_MODELED_IN_ART_STAGE_SCENARIO_PROFILE',scenarioSelectionDistribution:'RECOVERED_AND_MODELED_BY_SETTING_IN_ART_STAGE_SCENARIO_PROFILE',
  scenarioSelectionConfidence:'HIGH_CROSS_SOURCE_MATCH',initialStageDistributionConfidence:'HIGH_CROSS_SOURCE_MATCH',
  normalStageTreasureAmountDistribution:'UNVERIFIED_IMAGE_TABLE_NOT_RECOVERED',normalStageTreasureAveragePoints:120000,normalStageTreasureAverageSource:'PUBLISHED_ANALYSIS_TEXT',
  sourceLevel:'PUBLISHED_ANALYSIS_CROSS_CHECKED',
  automaticUsePolicy:'SCENARIO_SELECTION_INITIAL_STAGE_STAGE_HIT_RATES_AND_10G_UPGRADE_RULES_MAY_BE_MODELED; NORMAL_T_AND_IKUKAN_AWARD_DRAWS_REQUIRE_CENTRAL_RECOVERY_REGISTRY_READY; DO_NOT_SYNTHESIZE IKUKAN_EXIT_DESTINATION'
});

export function getArtStage(stage){return ART_STAGE_PROFILE.stages[stage]??null;}
export function getInternalArtStage(rank){return ART_STAGE_PROFILE.internalRanks[rank]??null;}
export function rollStageTreasureHit(stage,rng){const row=getArtStage(stage);if(!row)return false;return rng.next()<1/row.treasureHitDenominator;}
export function rollTwoStepStageUpgrade(scenario,rng){const pct=ART_STAGE_PROFILE.twoStepUpgradePctByScenario[scenario];if(pct==null)return null;return rng.next()<pct/100?2:1;}
export function hasVerifiedIkukanAwardDistribution(){const x=ART_STAGE_PROFILE.stages.IKUKAN.perGameAwardDistribution;return isTreasureDistributionReady('ikukanPerGame')&&Array.isArray(x)&&x.length>0;}
export function canAutoDrawIkukanAward(){return hasVerifiedIkukanAwardDistribution();}
