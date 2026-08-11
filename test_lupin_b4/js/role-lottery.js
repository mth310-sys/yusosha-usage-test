import { random01 } from './rng.js';
import { getSettingProfile } from './setting-profile.js';

const ROLE_DEFS = [
  ['REPLAY', 'replay', 0],
  ['MB', 'mb', 0],
  ['3COIN', 'threeCoin', 3],
  ['9COIN', 'nineCoin', 9],
  ['10COIN', 'tenCoin', 10]
];

export function drawRole(setting) {
  const profile = getSettingProfile(setting);
  const roll = random01();
  let cursor = 0;

  for (const [name, key, payout] of ROLE_DEFS) {
    cursor += 1 / profile[key];
    if (roll < cursor) return { name, payout };
  }

  return { name: 'OTHER/UNKNOWN', payout: 0 };
}
