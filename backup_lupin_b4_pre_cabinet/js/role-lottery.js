const ROLE_DEFS = [
  ['REPLAY','replay',0],
  ['MB','mb',0],
  ['3COIN','coin3',3],
  ['9COIN','coin9',9],
  ['10COIN','coin10',10]
];

function hasValidRoleDenominators(profile) {
  if (!profile?.roles) return false;
  return ROLE_DEFS.every(([,key]) => {
    const denominator = Number(profile.roles[key]);
    return Number.isFinite(denominator) && denominator > 0;
  });
}

export function drawRole(profile, rng) {
  if (!hasValidRoleDenominators(profile)) return null;
  const r = rng.next();
  let cursor = 0;
  for (const [name,key,payout] of ROLE_DEFS) {
    cursor += 1 / Number(profile.roles[key]);
    if (r < cursor) return { name, payout, replay:name === 'REPLAY' };
  }
  return { name:'MISS', payout:0, replay:false };
}

export function expectedRoleRates(profile) {
  if (!hasValidRoleDenominators(profile)) return null;
  const rates = {};
  for (const [name,key] of ROLE_DEFS) rates[name] = Number(profile.roles[key]);
  return rates;
}
