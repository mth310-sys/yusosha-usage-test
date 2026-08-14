// Verified normal-stage selection after a premonition stage ends.
// HAZUSE publishes one table for settings 1-3 and another for settings 4-6.
export const NORMAL_STAGE_PROFILE = Object.freeze({
  settings1to3:Object.freeze({LUPIN:33.3,JIGEN:33.3,GOEMON:33.3}),
  settings4to6:Object.freeze({LUPIN:41.7,JIGEN:25.0,GOEMON:33.3}),
  trigger:'PREMONITION_STAGE_END',
  source:'SOURCE_ONLY_HAZUSE_PUBLISHED_NORMAL_STAGE_SELECTION'
});

function tableForSetting(setting){
  const n=Number(setting);
  if(!Number.isInteger(n)||n<1||n>6)return null;
  return n<=3?NORMAL_STAGE_PROFILE.settings1to3:NORMAL_STAGE_PROFILE.settings4to6;
}

export function drawNormalStageAfterPremonition(setting,rng){
  const table=tableForSetting(setting);
  if(!table)return null;
  const entries=Object.entries(table);
  const total=entries.reduce((sum,[,weight])=>sum+weight,0);
  let value=rng.next()*total;
  for(const [stage,weight] of entries){
    value-=weight;
    if(value<0)return stage;
  }
  return entries.at(-1)[0];
}
