// Step 4B: verified CZ duration + scenario tables for DOROBO_ZONE / FUJIKO_ZONE.
// Source: published analysis. Values are percentages.

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
