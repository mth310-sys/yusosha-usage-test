// Step 3G: verified NORMAL/WANTED hold catalog.
// Appearance rates are intentionally NOT defined because verified distributions are not available.

export const HOLD_CATALOG = Object.freeze({
  NORMAL: { type:'NORMAL', guarantee:'NONE', reservedEvent:null, source:'BASE' },
  GOLD: { type:'GOLD', guarantee:'LB_OR_GT', reservedEvent:'LB_OR_GT', source:'VERIFIED' },
  TAMACHAN: { type:'TAMACHAN', guarantee:'LB_OR_GT', reservedEvent:'LB_OR_GT', source:'VERIFIED' },
  FUJIKO_TIGER: { type:'FUJIKO_TIGER', guarantee:'LB_OR_GT', reservedEvent:'LB_OR_GT', source:'VERIFIED' },
  SEVEN_ZONE: { type:'SEVEN_ZONE', guarantee:'SEVEN_ZONE', reservedEvent:'SEVEN_ZONE', source:'VERIFIED' },
  DOROBO_ZONE: { type:'DOROBO_ZONE', guarantee:'DOROBO_ZONE', reservedEvent:'DOROBO_ZONE', source:'VERIFIED' },
  FUJIKO_ZONE: { type:'FUJIKO_ZONE', guarantee:'FUJIKO_ZONE', reservedEvent:'FUJIKO_ZONE', source:'VERIFIED' },
  PREMIUM: { type:'PREMIUM', guarantee:'PREMIUM', reservedEvent:'PREMIUM', source:'VERIFIED' }
});

export const DEBUG_HOLD_TYPES = Object.freeze(Object.keys(HOLD_CATALOG).filter(k => k !== 'NORMAL'));

export function getHoldDefinition(type) {
  const row = HOLD_CATALOG[type] ?? HOLD_CATALOG.NORMAL;
  return { ...row };
}
