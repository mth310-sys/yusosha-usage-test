// Step 6R: verified WANTED initial-cycle target zones + exact in-band target game.
// Public analysis provides 32G target bands and states that each game inside a selected band is equally distributed.
// WANTED CHANCE is guaranteed by 480G at the latest.

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

function drawWeightedZone(rng) {
  const total = WANTED_INITIAL_ZONES.reduce((sum, row) => sum + row.weight, 0);
  let value = rng.next() * total;
  for (const row of WANTED_INITIAL_ZONES) {
    value -= row.weight;
    if (value < 0) return { ...row };
  }
  return { ...WANTED_INITIAL_ZONES[WANTED_INITIAL_ZONES.length - 1] };
}

export function drawWantedInitialZone(rng) {
  return drawWeightedZone(rng);
}

export function drawWantedInitialTarget(rng) {
  const zone = drawWeightedZone(rng);
  const width = zone.max - zone.min + 1;
  const game = zone.min + Math.floor(rng.next() * width);
  return {
    zone,
    game: Math.min(480, game),
    distribution:'VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND',
    hardMaxGame:480
  };
}
