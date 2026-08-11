const ROLE_DEFS = [
  ['REPLAY','replay',0],
  ['MB','mb',0],
  ['3COIN','coin3',3],
  ['9COIN','coin9',9],
  ['10COIN','coin10',10]
];

export function drawRole(profile, rng) {
  const r = rng.next();
  let cursor = 0;
  for (const [name,key,payout] of ROLE_DEFS) {
    cursor += 1 / profile.roles[key];
    if (r < cursor) return { name, payout, replay:name === 'REPLAY' };
  }
  return { name:'MISS', payout:0, replay:false };
}

export function expectedRoleRates(profile) {
  const rates = {};
  for (const [name,key] of ROLE_DEFS) rates[name] = profile.roles[key];
  return rates;
}
