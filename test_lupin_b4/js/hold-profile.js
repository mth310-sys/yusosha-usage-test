// Step 6U: verified NORMAL/WANTED hold catalog + LCD chance hit destinations.
// Visual hold step-up distributions remain unverified; gameplay destinations below come from verified chance-eye tables.
const chance=(type,guarantee,source,reservedEvent=null)=>({type,guarantee,reservedEvent,source,stepup:'UNVERIFIED'});
export const HOLD_CATALOG=Object.freeze({
 NORMAL:{type:'NORMAL',guarantee:'NONE',reservedEvent:null,source:'BASE'},
 CHANCE_BLUE:chance('CHANCE_BLUE','CHANCE_EYE_WEAK','VERIFIED_LCD_WEAK_BLUE'),
 CHANCE_RED:chance('CHANCE_RED','CHANCE_EYE_MIDDLE','VERIFIED_LCD_MIDDLE_RED'),
 CHANCE_7:chance('CHANCE_7','CHANCE_EYE_STRONG','VERIFIED_LCD_STRONG_7'),
 CHANCE_BLUE__LB_OR_GT:chance('CHANCE_BLUE','LCD_HIT_VERIFIED','VERIFIED_LCD_WEAK_BLUE_HIT','LB_OR_GT'),
 CHANCE_BLUE__FUJIKO_ZONE:chance('CHANCE_BLUE','LCD_HIT_VERIFIED','VERIFIED_LCD_WEAK_BLUE_HIT','FUJIKO_ZONE'),
 CHANCE_BLUE__DOROBO_ZONE:chance('CHANCE_BLUE','LCD_HIT_VERIFIED','VERIFIED_LCD_WEAK_BLUE_HIT','DOROBO_ZONE'),
 CHANCE_RED__LB_OR_GT:chance('CHANCE_RED','LCD_HIT_VERIFIED','VERIFIED_LCD_MIDDLE_RED_HIT','LB_OR_GT'),
 CHANCE_RED__FUJIKO_ZONE:chance('CHANCE_RED','LCD_HIT_VERIFIED','VERIFIED_LCD_MIDDLE_RED_HIT','FUJIKO_ZONE'),
 CHANCE_RED__DOROBO_ZONE:chance('CHANCE_RED','LCD_HIT_VERIFIED','VERIFIED_LCD_MIDDLE_RED_HIT','DOROBO_ZONE'),
 CHANCE_7__LB_OR_GT:chance('CHANCE_7','LCD_HIT_VERIFIED','VERIFIED_LCD_STRONG_7_HIT','LB_OR_GT'),
 CHANCE_7__FUJIKO_ZONE:chance('CHANCE_7','LCD_HIT_VERIFIED','VERIFIED_LCD_STRONG_7_HIT','FUJIKO_ZONE'),
 CHANCE_7__DOROBO_ZONE:chance('CHANCE_7','LCD_HIT_VERIFIED','VERIFIED_LCD_STRONG_7_HIT','DOROBO_ZONE'),
 GOLD:{type:'GOLD',guarantee:'LB_OR_GT',reservedEvent:'LB_OR_GT',source:'VERIFIED'},TAMACHAN:{type:'TAMACHAN',guarantee:'LB_OR_GT',reservedEvent:'LB_OR_GT',source:'VERIFIED'},FUJIKO_TIGER:{type:'FUJIKO_TIGER',guarantee:'LB_OR_GT',reservedEvent:'LB_OR_GT',source:'VERIFIED'},SEVEN_ZONE:{type:'SEVEN_ZONE',guarantee:'SEVEN_ZONE',reservedEvent:'SEVEN_ZONE',source:'VERIFIED'},DOROBO_ZONE:{type:'DOROBO_ZONE',guarantee:'DOROBO_ZONE',reservedEvent:'DOROBO_ZONE',source:'VERIFIED'},FUJIKO_ZONE:{type:'FUJIKO_ZONE',guarantee:'FUJIKO_ZONE',reservedEvent:'FUJIKO_ZONE',source:'VERIFIED'},
 PREMIUM:{type:'PREMIUM',guarantee:'PREMIUM_CONFIRMED',reservedEvent:'PREMIUM',source:'VERIFIED_PREMIUM_HOLD_ONLY',destination:'UNVERIFIED',policy:'DO_NOT_ASSUME_LB_OR_GT_OR_GT_BENEFIT'}
});
export const DEBUG_HOLD_TYPES=Object.freeze(['GOLD','TAMACHAN','FUJIKO_TIGER','SEVEN_ZONE','DOROBO_ZONE','FUJIKO_ZONE','PREMIUM']);
export function getHoldDefinition(type){const def=HOLD_CATALOG[type];return def?{...def}:null;}
