// Step 6T: verified NORMAL/WANTED hold catalog.
// Special destination holds are preserved from earlier steps.
// LCD chance-eye holds are now generated automatically from verified appearance rates,
// but their later visual step-up/destination distribution remains unverified.
// IMPORTANT: PREMIUM hold is verified only as "premium confirmed". Its exact gameplay benefit/destination
// has not been verified, so it must NOT be auto-routed to LUPIN BONUS or GOLDEN TIME.

export const HOLD_CATALOG = Object.freeze({
  NORMAL: { type:'NORMAL', guarantee:'NONE', reservedEvent:null, source:'BASE' },
  CHANCE_BLUE: { type:'CHANCE_BLUE', guarantee:'CHANCE_EYE_WEAK', reservedEvent:null, source:'VERIFIED_LCD_WEAK_BLUE', stepup:'UNVERIFIED' },
  CHANCE_RED: { type:'CHANCE_RED', guarantee:'CHANCE_EYE_MIDDLE', reservedEvent:null, source:'VERIFIED_LCD_MIDDLE_RED', stepup:'UNVERIFIED' },
  CHANCE_7: { type:'CHANCE_7', guarantee:'CHANCE_EYE_STRONG', reservedEvent:null, source:'VERIFIED_LCD_STRONG_7', stepup:'UNVERIFIED' },
  GOLD: { type:'GOLD', guarantee:'LB_OR_GT', reservedEvent:'LB_OR_GT', source:'VERIFIED' },
  TAMACHAN: { type:'TAMACHAN', guarantee:'LB_OR_GT', reservedEvent:'LB_OR_GT', source:'VERIFIED' },
  FUJIKO_TIGER: { type:'FUJIKO_TIGER', guarantee:'LB_OR_GT', reservedEvent:'LB_OR_GT', source:'VERIFIED' },
  SEVEN_ZONE: { type:'SEVEN_ZONE', guarantee:'SEVEN_ZONE', reservedEvent:'SEVEN_ZONE', source:'VERIFIED' },
  DOROBO_ZONE: { type:'DOROBO_ZONE', guarantee:'DOROBO_ZONE', reservedEvent:'DOROBO_ZONE', source:'VERIFIED' },
  FUJIKO_ZONE: { type:'FUJIKO_ZONE', guarantee:'FUJIKO_ZONE', reservedEvent:'FUJIKO_ZONE', source:'VERIFIED' },
  PREMIUM: {
    type:'PREMIUM',
    guarantee:'PREMIUM_CONFIRMED',
    reservedEvent:'PREMIUM',
    source:'VERIFIED_PREMIUM_HOLD_ONLY',
    destination:'UNVERIFIED',
    policy:'DO_NOT_ASSUME_LB_OR_GT_OR_GT_BENEFIT'
  }
});

export const DEBUG_HOLD_TYPES = Object.freeze(Object.keys(HOLD_CATALOG).filter(k => !['NORMAL','CHANCE_BLUE','CHANCE_RED','CHANCE_7'].includes(k)));

export function getHoldDefinition(type) {
  const row = HOLD_CATALOG[type] ?? HOLD_CATALOG.NORMAL;
  return { ...row };
}
