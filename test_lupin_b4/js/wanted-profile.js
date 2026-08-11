// Step 3C: verified WANTED initial-cycle target zones.
// Source: 1geki WANTED counter analysis (2016-08-14).
// Public data gives 32G target bands, not an exact game inside each band.

export const WANTED_INITIAL_ZONES = Object.freeze([
  { min:1, max:32, weight:6.3 },
  { min:33, max:64, weight:6.3 },
  { min:65, max:96, weight:3.9 },
  { min:97, max:128, weight:25.0 },
  { min:129, max:160, weight:39.1 },
  { min:161, max:192, weight:2.0 },
  { min:193, max:224, weight:2.0 },
  { min:225, max:256, weight:2.0 },
  { min:257, max:288, weight:2.0 },
  { min:289, max:320, weight:2.0 },
  { min:321, max:352, weight:2.0 },
  { min:353, max:384, weight:2.0 },
  { min:385, max:416, weight:2.0 },
  { min:417, max:448, weight:2.0 },
  { min:449, max:480, weight:2.0 }
]);

export function drawWantedInitialZone(rng) {
  const total = WANTED_INITIAL_ZONES.reduce((sum, row) => sum + row.weight, 0);
  let value = rng.next() * total;
  for (const row of WANTED_INITIAL_ZONES) {
    value -= row.weight;
    if (value < 0) return { ...row };
  }
  return { ...WANTED_INITIAL_ZONES[WANTED_INITIAL_ZONES.length - 1] };
}
