import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../test_lupin_zero/src/normal-mini-presentation-runtime.js', import.meta.url), 'utf8');

assert.match(source, /exactRealMachineExpectationValuesInvented:\s*false/);
assert.match(source, /presentationLevels:\s*Object\.freeze\(\['QUIET', 'MEDIUM', 'STRONG', 'CONTRADICTION'\]\)/);
assert.match(source, /pattern === 'LUPIN_ESCAPE' && resultClass === 'RARE'/);
assert.match(source, /resultClass === 'RARE' \|\| resultClass === 'CHANCE'/);
assert.match(source, /resultClass === 'PAY'/);
assert.match(source, /return 'QUIET'/);
assert.match(source, /selectionSource:\s*'SPIN_ID_ONLY'/);
assert.match(source, /resultSource:\s*'RESOLVED_EVENT_ONLY'/);
assert.match(source, /affectsGameLogic:\s*false/);
assert.match(source, /違和感 → CHANCE!/);

console.log('lupin-zero normal mini presentation balance boundary ok');
