// Verified normal-state LCD setting-hint numerals for Lupin B4.
// Published denominators are cross-source consistent for 526 / 634 / 456.
const LCD_SETTING_HINT_ORDER=Object.freeze(['526','634','456']);

export const LCD_SETTING_HINT_PROFILE = Object.freeze({
  source:'CROSS_SOURCE_PUBLISHED_LCD_SETTING_HINT_RATES',
  hints:Object.freeze({
    '526':Object.freeze({meaning:'SETTING_2_OR_5_OR_6_CONFIRMED',denominatorBySetting:Object.freeze({1:null,2:41597,3:null,4:null,5:34052,6:28262})}),
    '634':Object.freeze({meaning:'SETTING_3_OR_4_OR_6_CONFIRMED',denominatorBySetting:Object.freeze({1:null,2:null,3:43032,4:31957,5:null,6:28262})}),
    '456':Object.freeze({meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',denominatorBySetting:Object.freeze({1:null,2:null,3:null,4:42610,5:45402,6:47103})})
  })
});

export function getLcdSettingHintEntries(setting){
  const n=Number(setting);
  if(!Number.isInteger(n)||n<1||n>6)return [];
  return LCD_SETTING_HINT_ORDER
    .map(digits=>{
      const meta=LCD_SETTING_HINT_PROFILE.hints[digits];
      return {digits,meaning:meta.meaning,denominator:meta.denominatorBySetting[n]};
    })
    .filter(entry=>Number.isFinite(entry.denominator)&&entry.denominator>0);
}

export function drawLcdSettingHint(setting,rng){
  const entries=getLcdSettingHintEntries(setting);
  if(!entries.length||!rng?.next)return null;
  let x=rng.next();
  for(const entry of entries){
    const p=1/entry.denominator;
    if(x<p)return {...entry,source:LCD_SETTING_HINT_PROFILE.source};
    x-=p;
  }
  return null;
}
