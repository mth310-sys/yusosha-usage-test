// Step 4A: verified CZ duration table for DOROBO_ZONE / FUJIKO_ZONE.
// Source: published analysis. Values are percentages.

export const CZ_LENGTH_TABLE = Object.freeze({
  1:{10:62.50,20:37.50},
  2:{10:62.50,20:37.50},
  3:{10:60.94,20:39.06},
  4:{10:50.00,20:50.00},
  5:{10:50.00,20:50.00},
  6:{10:47.66,20:52.34}
});

export function drawCzLength(setting, rng) {
  const row = CZ_LENGTH_TABLE[Number(setting)] ?? CZ_LENGTH_TABLE[1];
  return rng.next() < row[10] / 100 ? 10 : 20;
}
