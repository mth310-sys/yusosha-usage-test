import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const runtime = await fs.readFile(new URL('../test_lupin_zero/src/seven-tenpai-failure-runtime.js', import.meta.url), 'utf8');
const nextHit = await fs.readFile(new URL('../test_lupin_zero/src/next-initial-hit-runtime.js', import.meta.url), 'utf8');
const index = await fs.readFile(new URL('../test_lupin_zero/index.html', import.meta.url), 'utf8');

assert.match(runtime, /SEVEN_TENPAI_CONTINUOUS_PRESENTATION_FAILURE/);
assert.match(runtime, /NEXT_INITIAL_HIT_GOLDEN_TIME_CONFIRMED/);
assert.match(runtime, /naturalOccurrenceRateResolved: false/);
assert.match(runtime, /oneShotReservation: true/);
assert.match(runtime, /forceNextGoldenTime/);
assert.match(nextHit, /forcedNextDestination = GameMode\.GOLDEN_TIME/);
assert.match(nextHit, /forcedNextDestination = null/);
assert.match(nextHit, /next-initial-hit-forced/);
assert.match(index, /next-initial-hit-runtime\.js[\s\S]*seven-tenpai-failure-runtime\.js[\s\S]*chance-eye-initial-hit-runtime\.js/);
console.log('lupin-zero-seven-tenpai-failure.spec: ok');
