// Step 6Z: cross-checked GOLDEN TIME internal 9-stage scenario model.
// 1geki, Slopachi Quest and Pachislo-data publish matching scenario-by-setting,
// initial internal-stage and 10G 1UP/2UP tables. The 8 normal internal stages map to
// four visible stages; IKUKAN is the ninth special stage. What happens after the 10G
// IKUKAN window is intentionally not synthesized here.

export const ART_STAGE_SCENARIO_PROFILE = Object.freeze({
  internalOrder:['JAPAN_A','JAPAN_B','SWISS_A','SWISS_B','CARIBBEAN_A','CARIBBEAN_B','UNDERGROUND_A','UNDERGROUND_B','IKUKAN'],
  scenarioBySetting:{
    1:{A:71.9,B:23.4,C:3.1,D:1.6},
    2:{A:79.7,B:15.6,C:3.1,D:1.6},
    3:{A:69.9,B:25.4,C:3.1,D:1.6},
    4:{A:64.5,B:29.3,C:3.1,D:3.1},
    5:{A:53.5,B:37.1,C:6.3,D:3.1},
    6:{A:51.6,B:39.1,C:6.3,D:3.1}
  },
  initialInternalStagePct:{
    A:[62.5,12.5,12.5,6.3,1.6,1.6,1.6,1.6],
    B:[46.9,18.8,18.8,9.4,1.6,1.6,1.6,1.6],
    C:[29.7,18.8,18.8,18.8,9.4,1.6,1.6,1.6],
    D:[12.5,18.8,18.8,18.8,18.8,9.4,1.6,1.6]
  },
  twoStepUpgradePct:{A:25.0,B:37.5,C:50.0,D:75.0},
  upgradeIntervalGames:10,
  upgradeAlwaysOccurs:true,
  normalInternalStageCount:8,
  specialStage:'IKUKAN',
  source:'CROSS_SOURCE_MATCHING_PUBLISHED_ANALYSIS_TABLES',
  sourceConfidence:'HIGH'
});

function weightedKey(table,rng){
  const entries=Object.entries(table); const total=entries.reduce((s,[,w])=>s+w,0); let x=rng.next()*total;
  for(const [k,w] of entries){x-=w;if(x<0)return k;} return entries.at(-1)[0];
}

function weightedIndex(weights,rng){
  const total=weights.reduce((a,b)=>a+b,0); let x=rng.next()*total;
  for(let i=0;i<weights.length;i++){x-=weights[i];if(x<0)return i;} return weights.length-1;
}

export function drawArtStageScenario(setting,rng){
  return weightedKey(ART_STAGE_SCENARIO_PROFILE.scenarioBySetting[Number(setting)]??ART_STAGE_SCENARIO_PROFILE.scenarioBySetting[1],rng);
}

export function drawInitialInternalStage(scenario,rng){
  const weights=ART_STAGE_SCENARIO_PROFILE.initialInternalStagePct[scenario];
  const index=weightedIndex(weights,rng);
  return {index,key:ART_STAGE_SCENARIO_PROFILE.internalOrder[index]};
}

export function drawStageUpgradeSteps(scenario,rng){
  const p2=ART_STAGE_SCENARIO_PROFILE.twoStepUpgradePct[scenario]??25;
  return rng.next()<p2/100?2:1;
}

export function visibleStageFromInternal(key){
  if(key==='IKUKAN')return 'IKUKAN';
  if(key.startsWith('JAPAN_'))return 'JAPAN';
  if(key.startsWith('SWISS_'))return 'SWISS';
  if(key.startsWith('CARIBBEAN_'))return 'CARIBBEAN';
  if(key.startsWith('UNDERGROUND_'))return 'UNDERGROUND';
  return null;
}
