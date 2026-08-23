import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getPhysicalStopPlan } from '../test_lupin_zero/src/physical-role-session.js';

const a = getPhysicalStopPlan({ role: 'RUPIN_REPLAY_A' });
const b = getPhysicalStopPlan({ role: 'RUPIN_REPLAY_B' });
const c = getPhysicalStopPlan({ role: 'RUPIN_REPLAY_C' });
const d = getPhysicalStopPlan({ role: 'PREMIUM' });

assert.equal(a.reversePushCutIn, true);
assert.deepEqual(a.targetReelsWithLupinSymbol, [0]);
assert.equal(a.longFreezeOnLupinAlignment, false);
assert.deepEqual(b.targetReelsWithLupinSymbol, [1, 2]);
assert.equal(b.longFreezeOnLupinAlignment, false);
assert.deepEqual(c.targetReelsWithLupinSymbol, [0, 2]);
assert.equal(c.longFreezeOnLupinAlignment, false);
assert.deepEqual(d.targetReelsWithLupinSymbol, [0, 1, 2]);
assert.equal(d.longFreezeOnLupinAlignment, true);
assert.equal(d.exactLupinStopRowKnown, false);
assert.equal(d.middleLineSymbols, null);

const runtime = fs.readFileSync(new URL('../test_lupin_zero/src/rupin-replay-presentation-runtime.js', import.meta.url), 'utf8');
assert.match(runtime, /presentationOnly:\s*true/);
assert.match(runtime, /reversePushOrderGuidanceOnly:\s*true/);
assert.match(runtime, /pushOrderForced:\s*false/);
assert.match(runtime, /exactStopRowInvented:\s*false/);
assert.match(runtime, /longFreezeOnlyForRupinReplayD:\s*true/);
assert.match(runtime, /\[2, 1, 0\]/);

const index = fs.readFileSync(new URL('../test_lupin_zero/index.html', import.meta.url), 'utf8');
assert.ok(index.indexOf('rupin-replay-presentation-runtime.js') > index.indexOf('reel-symbol-presentation-runtime.js'));
assert.ok(index.indexOf('rupin-replay-presentation-runtime.js') < index.indexOf('legend-gate-runtime.js'));

console.log('lupin-zero-rupin-replay-presentation.spec: ok');
