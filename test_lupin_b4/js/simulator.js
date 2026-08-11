import { RNG } from './rng.js';
import { getSettingProfile } from './setting-profile.js';
import { drawRole, expectedRoleRates } from './role-lottery.js';
import { RAIUN_POINT_MODEL, drawInitialRaiunPoints, rollRaiunPointAdd, drawRaiunPointAdd } from './raiun-point-model.js?v=step5e';
import { RAIUN_PROFILE, rollRaiunArtCalibrated } from './raiun-profile.js?v=step5e';

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
  const rows = Object.entries(counts).map(([role,count]) => ({role,count,observed:count?games/count:Infinity,target:targets[role]??null}));
  return { setting:Number(setting), games, counts, payout, rows };
}

export function formatSimulationReport(report) {
  const lines = ['LUPIN B4 FAST SIM',`SETTING ${report.setting}`,`GAMES ${report.games.toLocaleString()}`,''];
  for (const row of report.rows) {
    const obs = Number.isFinite(row.observed) ? `1/${row.observed.toFixed(2)}` : '-';
    const target = row.target ? ` target 1/${row.target.toFixed(2)}` : '';
    lines.push(`${row.role.padEnd(7)} ${String(row.count).padStart(7)}  ${obs}${target}`);
  }
  return lines.join('\n');
}

export function runRaiunCycleSimulation({cycles=100000, seed=0x24681357} = {}) {
  const rng = new RNG(seed);
  let totalInitial=0,totalGames=0,totalAdds=0,totalAddedPoints=0,minGames=Infinity,maxGames=0;
  for (let cycle=0; cycle<cycles; cycle++) {
    let points=drawInitialRaiunPoints(rng); totalInitial+=points; let games=0;
    while (points < 100) {
      games+=1;
      if (rollRaiunPointAdd(rng)) { const add=drawRaiunPointAdd(rng); points=Math.min(100,points+add); totalAdds+=1; totalAddedPoints+=add; }
    }
    totalGames+=games; if(games<minGames)minGames=games; if(games>maxGames)maxGames=games;
  }
  const avgInitial=totalInitial/cycles,avgGames=totalGames/cycles,observedAddDenominator=totalAdds?totalGames/totalAdds:Infinity,avgPointsPerAdd=totalAdds?totalAddedPoints/totalAdds:0,targetGames=RAIUN_POINT_MODEL.raw.publishedAverageGamesTo100;
  return {cycles,avgInitial,avgGames,observedAddDenominator,avgPointsPerAdd,minGames,maxGames,targetGames,modelSource:RAIUN_POINT_MODEL.source,calibrationStatus:RAIUN_POINT_MODEL.calibrationStatus,effectiveAddDenominator:RAIUN_POINT_MODEL.calibrated.effectiveAddDenominator,raw:RAIUN_POINT_MODEL.raw};
}

export function formatRaiunCycleReport(report) {
  const delta=report.avgGames-report.targetGames,deltaPct=delta/report.targetGames*100;
  return ['RAIUN CYCLE CALIBRATION SIM',`CYCLES ${report.cycles.toLocaleString()}`,`MODEL ${report.modelSource}`,`STATUS ${report.calibrationStatus}`,'',`AVG INITIAL PT   ${report.avgInitial.toFixed(3)}   RAW target ${report.raw.averageInitialPoints}`,`ADD RATE         1/${report.observedAddDenominator.toFixed(3)}   CAL target 1/${report.effectiveAddDenominator.toFixed(2)}`,`AVG PT / ADD     ${report.avgPointsPerAdd.toFixed(3)}   RAW target ${report.raw.averagePointsPerAdd}`,`AVG G TO 100PT   ${report.avgGames.toFixed(3)}   published target ~${report.targetGames}G`,`DELTA            ${delta>=0?'+':''}${delta.toFixed(3)}G (${deltaPct>=0?'+':''}${deltaPct.toFixed(2)}%)`,`RANGE            ${report.minGames}G - ${report.maxGames}G`,'',`RAW ADD RATE     ${report.raw.publishedAddRateRange}`,'NOTE: RAW published aggregates are preserved; gameplay uses the isolated locked CALIBRATED effective rate.'].join('\n');
}

export function runRaiunArtSimulation({sessions=100000, seed=0x579BDF13} = {}) {
  const rng = new RNG(seed);
  let hits=0,totalGames=0;
  const hitGameCounts = Array(RAIUN_PROFILE.mode.normalGames).fill(0);
  for (let s=0; s<sessions; s++) {
    let hit=false;
    for (let g=1; g<=RAIUN_PROFILE.mode.normalGames; g++) {
      totalGames+=1;
      if (rollRaiunArtCalibrated(rng)) {
        hits+=1; hit=true; hitGameCounts[g-1]+=1; break;
      }
    }
    if (!hit) continue;
  }
  return {sessions,hits,misses:sessions-hits,observedExpectation:hits/sessions*100,targetExpectation:RAIUN_PROFILE.mode.artExpectation,perGameDenominator:RAIUN_PROFILE.mode.calibratedPerGameDenominator,modelSource:RAIUN_PROFILE.mode.artModelSource,avgGamesPlayed:totalGames/sessions,hitGameCounts};
}

export function formatRaiunArtReport(report) {
  const delta=report.observedExpectation-report.targetExpectation;
  return ['RAIUN 20G ART CALIBRATION SIM',`SESSIONS ${report.sessions.toLocaleString()}`,`MODEL ${report.modelSource}`,'',`PER-GAME RATE     1/${report.perGameDenominator.toFixed(2)}  CALIBRATED`,`ART HIT           ${report.hits.toLocaleString()}`,`ART MISS          ${report.misses.toLocaleString()}`,`OBSERVED ART      ${report.observedExpectation.toFixed(3)}%`,`TARGET ART        ${report.targetExpectation.toFixed(3)}%`,`DELTA             ${delta>=0?'+':''}${delta.toFixed(3)}pt`,`AVG G PLAYED      ${report.avgGamesPlayed.toFixed(3)}`,'','NOTE: 1G rate is not a published analysis value; it is derived from the verified 20G / ~23% aggregate expectation.'].join('\n');
}
