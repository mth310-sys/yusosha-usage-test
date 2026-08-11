import { RNG } from './rng.js';
import { getSettingProfile } from './setting-profile.js';
import { drawRole, expectedRoleRates } from './role-lottery.js';
import { RAIUN_POINT_MODEL, drawInitialRaiunPoints, rollRaiunPointAdd, drawRaiunPointAdd } from './raiun-point-model.js?v=step5c';

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

export function runRaiunCycleSimulation({cycles=100000, seed=0x24681357} = {}) {
  const rng = new RNG(seed);
  let totalInitial = 0;
  let totalGames = 0;
  let totalAdds = 0;
  let totalAddedPoints = 0;
  let minGames = Infinity;
  let maxGames = 0;

  for (let cycle=0; cycle<cycles; cycle++) {
    let points = drawInitialRaiunPoints(rng);
    totalInitial += points;
    let games = 0;

    while (points < 100) {
      games += 1;
      if (rollRaiunPointAdd(rng)) {
        const add = drawRaiunPointAdd(rng);
        points = Math.min(100, points + add);
        totalAdds += 1;
        totalAddedPoints += add;
      }
    }

    totalGames += games;
    if (games < minGames) minGames = games;
    if (games > maxGames) maxGames = games;
  }

  const avgInitial = totalInitial / cycles;
  const avgGames = totalGames / cycles;
  const observedAddDenominator = totalAdds ? totalGames / totalAdds : Infinity;
  const avgPointsPerAdd = totalAdds ? totalAddedPoints / totalAdds : 0;
  const targetGames = RAIUN_POINT_MODEL.raw.publishedAverageGamesTo100;

  return {
    cycles,
    avgInitial,
    avgGames,
    observedAddDenominator,
    avgPointsPerAdd,
    minGames,
    maxGames,
    targetGames,
    modelSource:RAIUN_POINT_MODEL.source,
    effectiveAddDenominator:RAIUN_POINT_MODEL.calibrated.effectiveAddDenominator,
    raw:RAIUN_POINT_MODEL.raw
  };
}

export function formatRaiunCycleReport(report) {
  const delta = report.avgGames - report.targetGames;
  const deltaPct = delta / report.targetGames * 100;
  return [
    'RAIUN CYCLE CALIBRATION SIM',
    `CYCLES ${report.cycles.toLocaleString()}`,
    `MODEL ${report.modelSource}`,
    '',
    `AVG INITIAL PT   ${report.avgInitial.toFixed(3)}   RAW target ${report.raw.averageInitialPoints}`,
    `ADD RATE         1/${report.observedAddDenominator.toFixed(3)}   CAL target 1/${report.effectiveAddDenominator.toFixed(2)}`,
    `AVG PT / ADD     ${report.avgPointsPerAdd.toFixed(3)}   RAW target ${report.raw.averagePointsPerAdd}`,
    `AVG G TO 100PT   ${report.avgGames.toFixed(3)}   published target ~${report.targetGames}G`,
    `DELTA            ${delta >= 0 ? '+' : ''}${delta.toFixed(3)}G (${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(2)}%)`,
    `RANGE            ${report.minGames}G - ${report.maxGames}G`,
    '',
    `RAW ADD RATE     ${report.raw.publishedAddRateRange}`,
    'NOTE: RAW published aggregates are preserved; gameplay uses the isolated CALIBRATED effective rate.'
  ].join('\n');
}
