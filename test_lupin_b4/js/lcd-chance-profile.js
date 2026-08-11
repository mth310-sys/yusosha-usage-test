// Step 6T: verified LCD chance-eye appearance rates.
// These are LCD 3-digit chance patterns, independent of the physical reel role model.
// NORMAL: blue/even same-color, red/odd same-color, 7-included.
// WANTED CHANCE: appearance rates are heavily increased.

export const LCD_CHANCE_PROFILE = Object.freeze({
  NORMAL: Object.freeze({
    WEAK_BLUE: Object.freeze({ denominator:53.6, holdType:'CHANCE_BLUE', expectationPct:3.6 }),
    MIDDLE_RED: Object.freeze({ denominator:149.2, holdType:'CHANCE_RED', expectationPct:10.8 }),
    STRONG_7: Object.freeze({ denominator:3857, holdType:'CHANCE_7', expectationPct:51.1 })
  }),
  WANTED_CHANCE: Object.freeze({
    WEAK_BLUE: Object.freeze({ denominator:13.9, holdType:'CHANCE_BLUE', expectationPct:5.1 }),
    MIDDLE_RED: Object.freeze({ denominator:7.3, holdType:'CHANCE_RED', expectationPct:13.9 }),
    STRONG_7: Object.freeze({ denominator:45.7, holdType:'CHANCE_7', expectationPct:46.1 })
  }),
  source:'VERIFIED_LCD_CHANCE_APPEARANCE_TABLE',
  holdDestinationPolicy:'VISUAL_STEPUP_DESTINATION_DISTRIBUTION_UNVERIFIED'
});

const ORDER=['WEAK_BLUE','MIDDLE_RED','STRONG_7'];

export function rollLcdChance(mode,rng){
  const table=LCD_CHANCE_PROFILE[mode];
  if(!table)return null;
  const r=rng.next();
  let cursor=0;
  for(const key of ORDER){
    const row=table[key];
    cursor+=1/row.denominator;
    if(r<cursor)return { key, ...row, mode, source:LCD_CHANCE_PROFILE.source };
  }
  return null;
}
