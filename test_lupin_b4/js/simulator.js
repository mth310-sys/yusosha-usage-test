import { RNG } from './rng.js';
import { getSettingProfile } from './setting-profile.js';
import { drawRole, expectedRoleRates } from './role-lottery.js';

export function runFastSimulation({setting=1, games=100000, seed=0x13572468} = {}) {
  const profile = getSettingProfile(setting);
  const rng = new RNG(seed);
  const counts = { REPLAY:0, MB:0, '3COIN':0, '9COIN':0, '10COIN':0, MISS:0 };
  let payout = 0;
  for (let i=0; i<games; i++) {
    const role = drawRole(profile, rng);
    counts[role.name] = (counts[role.name] || 0) + 1;
    payout += role.payout;
  }
  const targets = expectedRoleRates(profile);
  const rows = Object.entries(counts).map(([role,count]) => ({
    role,
    count,
    observed: count ? games / count : Infinity,
    target: targets[role] ?? null
  }));
  return { setting:Number(setting), games, counts, payout, rows };
}

export function formatSimulationReport(report) {
  const lines = [
    'LUPIN B4 FAST SIM',
    `SETTING ${report.setting}`,
    `GAMES ${report.games.toLocaleString()}`,
    ''
  ];
  for (const row of report.rows) {
    const obs = Number.isFinite(row.observed) ? `1/${row.observed.toFixed(2)}` : '-';
    const target = row.target ? ` target 1/${row.target.toFixed(2)}` : '';
    lines.push(`${row.role.padEnd(7)} ${String(row.count).padStart(7)}  ${obs}${target}`);
  }
  return lines.join('\n');
}
