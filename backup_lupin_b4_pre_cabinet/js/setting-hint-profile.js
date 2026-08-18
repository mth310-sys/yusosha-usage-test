// Verified normal-state setting hints for Lupin B4.
// Published denominators are cross-source consistent for LCD numerals, machine-description windows, and the typewriter setting hint.
const LCD_SETTING_HINT_ORDER=Object.freeze(['526','634','456']);
const MACHINE_DESCRIPTION_HINT_ORDER=Object.freeze(['GOOD_MACHINE','INCREDIBLE_FIND']);

export const LCD_SETTING_HINT_PROFILE = Object.freeze({
  source:'CROSS_SOURCE_PUBLISHED_LCD_SETTING_HINT_RATES',
  hints:Object.freeze({
    '526':Object.freeze({meaning:'SETTING_2_OR_5_OR_6_CONFIRMED',denominatorBySetting:Object.freeze({1:null,2:41597,3:null,4:null,5:34052,6:28262})}),
    '634':Object.freeze({meaning:'SETTING_3_OR_4_OR_6_CONFIRMED',denominatorBySetting:Object.freeze({1:null,2:null,3:43032,4:31957,5:null,6:28262})}),
    '456':Object.freeze({meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',denominatorBySetting:Object.freeze({1:null,2:null,3:null,4:42610,5:45402,6:47103})})
  })
});

export const MACHINE_DESCRIPTION_HINT_PROFILE = Object.freeze({
  source:'CROSS_SOURCE_PUBLISHED_MACHINE_DESCRIPTION_SETTING_HINT_RATES',
  hints:Object.freeze({
    GOOD_MACHINE:Object.freeze({
      text:'どうやらこの台は良い台みたいだぜ！',
      meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',
      denominatorBySetting:Object.freeze({1:null,2:null,3:null,4:14294.1,5:15242.1,6:16001.0})
    }),
    INCREDIBLE_FIND:Object.freeze({
      text:'どうやらとんでもないものを掴んでしまったみたいだぜ！',
      meaning:'SETTING_6_CONFIRMED',
      denominatorBySetting:Object.freeze({1:null,2:null,3:null,4:null,5:null,6:12000.8})
    })
  })
});

export const TYPEWRITER_SETTING_HINT_PROFILE = Object.freeze({
  source:'CROSS_SOURCE_PUBLISHED_TYPEWRITER_SETTING_HINT_RATES',
  id:'GODDESS_PRESENT',
  text:'女神がくれたプレゼント',
  meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',
  denominatorBySetting:Object.freeze({1:null,2:null,3:null,4:382442,5:402459,6:389997})
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

export function getMachineDescriptionSettingHintEntries(setting){
  const n=Number(setting);
  if(!Number.isInteger(n)||n<1||n>6)return [];
  return MACHINE_DESCRIPTION_HINT_ORDER
    .map(id=>{
      const meta=MACHINE_DESCRIPTION_HINT_PROFILE.hints[id];
      return {id,text:meta.text,meaning:meta.meaning,denominator:meta.denominatorBySetting[n]};
    })
    .filter(entry=>Number.isFinite(entry.denominator)&&entry.denominator>0);
}

export function drawMachineDescriptionSettingHint(setting,rng){
  const entries=getMachineDescriptionSettingHintEntries(setting);
  if(!entries.length||!rng?.next)return null;
  let x=rng.next();
  for(const entry of entries){
    const p=1/entry.denominator;
    if(x<p)return {...entry,source:MACHINE_DESCRIPTION_HINT_PROFILE.source};
    x-=p;
  }
  return null;
}

export function getTypewriterSettingHint(setting){
  const n=Number(setting);
  if(!Number.isInteger(n)||n<1||n>6)return null;
  const denominator=TYPEWRITER_SETTING_HINT_PROFILE.denominatorBySetting[n];
  if(!Number.isFinite(denominator)||denominator<=0)return null;
  return {
    id:TYPEWRITER_SETTING_HINT_PROFILE.id,
    text:TYPEWRITER_SETTING_HINT_PROFILE.text,
    meaning:TYPEWRITER_SETTING_HINT_PROFILE.meaning,
    denominator
  };
}

export function drawTypewriterSettingHint(setting,rng){
  const entry=getTypewriterSettingHint(setting);
  if(!entry||!rng?.next)return null;
  return rng.next()<(1/entry.denominator)
    ? {...entry,source:TYPEWRITER_SETTING_HINT_PROFILE.source}
    : null;
}
