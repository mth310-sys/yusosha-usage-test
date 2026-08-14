// Step 4B/6AA: verified CZ duration + stage scenario + aggregate success tables
// for DOROBO_ZONE / FUJIKO_ZONE. Values are published analysis percentages.
// Aggregate success is intentionally resolved only at the CZ end boundary; the
// real per-game hit mechanism and LB/GT destination split remain unresolved.

export const CZ_LENGTH_TABLE = Object.freeze({
  1:{10:62.50,20:37.50},
  2:{10:62.50,20:37.50},
  3:{10:60.94,20:39.06},
  4:{10:50.00,20:50.00},
  5:{10:50.00,20:50.00},
  6:{10:47.66,20:52.34}
});

export const CZ_SCENARIO_TABLE = Object.freeze({
  1:{A:71.88,B:23.44,C:3.13,D:1.56},
  2:{A:79.69,B:15.63,C:3.13,D:1.56},
  3:{A:69.92,B:25.39,C:3.13,D:1.56},
  4:{A:64.45,B:29.30,C:3.13,D:3.13},
  5:{A:53.52,B:37.11,C:6.25,D:3.13},
  6:{A:51.56,B:39.06,C:6.25,D:3.13}
});

export const CZ_AGGREGATE_SUCCESS_TABLE = Object.freeze({
  DOROBO_ZONE:Object.freeze({1:39.9,2:39.6,3:40.2,4:42.6,5:42.5,6:43.2}),
  FUJIKO_ZONE:Object.freeze({1:58.8,2:58.9,3:59.2,4:62.7,5:62.1,6:63.2})
});

export function drawCzLength(setting, rng) {
  const row = CZ_LENGTH_TABLE[Number(setting)];
  if (!row) return null;
  return rng.next() < row[10] / 100 ? 10 : 20;
}

export function drawCzScenario(setting, rng) {
  const row = CZ_SCENARIO_TABLE[Number(setting)];
  if (!row) return null;
  const entries = Object.entries(row);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let value = rng.next() * total;
  for (const [scenario, weight] of entries) {
    value -= weight;
    if (value < 0) return scenario;
  }
  return 'D';
}

export function getCzAggregateSuccessPct(type,setting){
  const row=CZ_AGGREGATE_SUCCESS_TABLE[type];
  if(!row)return null;
  const value=row[Number(setting)];
  return typeof value==='number'&&Number.isFinite(value)?value:null;
}

export function rollCzAggregateSuccess(type,setting,rng){
  const pct=getCzAggregateSuccessPct(type,setting);
  if(pct==null)return null;
  return rng.next() < pct/100;
}
