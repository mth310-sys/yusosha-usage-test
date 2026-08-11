// Step 6D: verified GOLDEN TIME stage data.
// Start-stage / transition scenario probabilities and normal-stage award amounts are not verified here.
export const ART_STAGE_PROFILE = Object.freeze({
  order:['JAPAN','SWISS','CARIBBEAN','UNDERGROUND','IKUKAN'],
  stages:{
    JAPAN:{label:'日本', treasureHitDenominator:16.9, special:false},
    SWISS:{label:'スイス', treasureHitDenominator:12.6, special:false},
    CARIBBEAN:{label:'カリブ海', treasureHitDenominator:7.5, special:false},
    UNDERGROUND:{label:'地底都市', treasureHitDenominator:3.0, special:false},
    IKUKAN:{label:'異空間', treasureHitDenominator:1.0, special:true, durationGames:10, minimumTreasurePerGame:50000}
  },
  inSetDowngrade:false,
  transitionTimingObserved:'10G_INTERVALS_EXPERIMENTAL',
  ikukanEntryTimingObserved:'30G_POSSIBLE_EXPERIMENTAL',
  startStageDistribution:'UNVERIFIED',
  transitionDistribution:'UNVERIFIED',
  normalStageTreasureAmountDistribution:'UNVERIFIED'
});

export function getArtStage(stage){return ART_STAGE_PROFILE.stages[stage]??null;}
export function rollStageTreasureHit(stage,rng){const row=getArtStage(stage);if(!row)return false;return rng.next()<1/row.treasureHitDenominator;}
