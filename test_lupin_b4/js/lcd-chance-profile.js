// Step 6U: verified LCD chance-eye appearance, hit expectation, and hit-destination tables.
// LCD 3-digit chance patterns are independent of the physical reel role model.

const DEST_NORMAL = {
  WEAK_BLUE: { LB_OR_GT:68.4, FUJIKO_ZONE:14.0, DOROBO_ZONE:17.4 },
  MIDDLE_RED:{ LB_OR_GT:82.1, FUJIKO_ZONE:10.2, DOROBO_ZONE:7.8 },
  STRONG_7:  { LB_OR_GT:85.1, FUJIKO_ZONE:7.9, DOROBO_ZONE:7.0 }
};
const DEST_WC = {
  WEAK_BLUE: { LB_OR_GT:54.1, FUJIKO_ZONE:24.3, DOROBO_ZONE:21.6 },
  MIDDLE_RED:{ LB_OR_GT:76.6, FUJIKO_ZONE:11.1, DOROBO_ZONE:12.4 },
  STRONG_7:  { LB_OR_GT:89.0, FUJIKO_ZONE:6.4, DOROBO_ZONE:4.5 }
};

export const LCD_CHANCE_PROFILE = Object.freeze({
  NORMAL: Object.freeze({
    WEAK_BLUE: Object.freeze({ denominator:53.6, holdType:'CHANCE_BLUE', expectationPct:3.6, destinations:DEST_NORMAL.WEAK_BLUE }),
    MIDDLE_RED: Object.freeze({ denominator:149.2, holdType:'CHANCE_RED', expectationPct:10.8, destinations:DEST_NORMAL.MIDDLE_RED }),
    STRONG_7: Object.freeze({ denominator:3857, holdType:'CHANCE_7', expectationPct:51.1, destinations:DEST_NORMAL.STRONG_7 })
  }),
  WANTED_CHANCE: Object.freeze({
    WEAK_BLUE: Object.freeze({ denominator:13.9, holdType:'CHANCE_BLUE', expectationPct:5.1, destinations:DEST_WC.WEAK_BLUE }),
    MIDDLE_RED: Object.freeze({ denominator:7.3, holdType:'CHANCE_RED', expectationPct:13.9, destinations:DEST_WC.MIDDLE_RED }),
    STRONG_7: Object.freeze({ denominator:45.7, holdType:'CHANCE_7', expectationPct:46.1, destinations:DEST_WC.STRONG_7 })
  }),
  source:'VERIFIED_LCD_CHANCE_APPEARANCE_EXPECTATION_DESTINATION_TABLE',
  holdVisualStepupPolicy:'VISUAL_STEPUP_DISTRIBUTION_UNVERIFIED'
});

const ORDER=['WEAK_BLUE','MIDDLE_RED','STRONG_7'];

export function rollLcdChance(mode,rng){
  const table=LCD_CHANCE_PROFILE[mode];
  if(!table)return null;
  const r=rng.next();let cursor=0;
  for(const key of ORDER){const row=table[key];cursor+=1/row.denominator;if(r<cursor)return { key, ...row, mode, source:LCD_CHANCE_PROFILE.source };}
  return null;
}

export function rollLcdChanceOutcome(hit,rng){
  if(!hit)return null;
  const won=rng.next() < hit.expectationPct/100;
  if(!won)return { won:false, destination:null, source:'VERIFIED_CHANCE_EXPECTATION' };
  const entries=Object.entries(hit.destinations);const total=entries.reduce((s,[,v])=>s+v,0);const r=rng.next()*total;let cursor=0;
  for(const [destination,weight] of entries){cursor+=weight;if(r<cursor)return { won:true,destination,source:'VERIFIED_HIT_DESTINATION_TABLE' };}
  return { won:true,destination:entries.at(-1)[0],source:'VERIFIED_HIT_DESTINATION_TABLE' };
}
