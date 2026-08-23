import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const runtimePath = path.join(root, 'test_lupin_zero/src/extra-bonus-game-presentation-runtime.js');
const resolverPath = path.join(root, 'test_lupin_zero/src/extra-bonus-resolver.js');
const indexPath = path.join(root, 'test_lupin_zero/index.html');

const runtime = fs.readFileSync(runtimePath, 'utf8');
const resolver = fs.readFileSync(resolverPath, 'utf8');
const index = fs.readFileSync(indexPath, 'utf8');

test('EXTRA BONUS presentation is staged and presentation-only', () => {
  assert.match(runtime, /evidenceStatus: 'PRESENTATION_ONLY'/);
  assert.match(runtime, /affectsGameLogic: false/);
  assert.match(runtime, /changesOddAlignmentLottery: false/);
  assert.match(runtime, /changesGoldRushLottery: false/);
  assert.match(runtime, /changesStockAward: false/);
  for (const stage of ['START_CUE', 'STOP_1', 'STOP_2', 'STOP_3', 'RESULT_REVEAL']) {
    assert.match(runtime, new RegExp(stage));
  }
});

test('EXTRA BONUS reveal keeps published outcomes distinct', () => {
  assert.match(runtime, /GOLD_7_ALIGNED/);
  assert.match(runtime, /ODD_ALIGNED/);
  assert.match(runtime, /GT STOCK \+1/);
  assert.match(runtime, /GOLD RUSH/);
});

test('published EXTRA BONUS probabilities remain authoritative', () => {
  assert.match(resolver, /oddAlignmentDenominator: 202\.6/);
  assert.match(resolver, /goldRushDenominator: 4924\.3/);
  assert.match(resolver, /oddAlignmentConsequence: 'GOLDEN_TIME_SET_STOCK_PLUS_1'/);
  assert.match(resolver, /goldRushDestination: 'GOLD_RUSH'/);
});

test('presentation runtime is loaded before GOLD RUSH runtime', () => {
  const presentationIndex = index.indexOf('./src/extra-bonus-game-presentation-runtime.js');
  const goldRushIndex = index.indexOf('./src/gold-rush-runtime.js');
  assert.ok(presentationIndex >= 0);
  assert.ok(goldRushIndex >= 0);
  assert.ok(presentationIndex < goldRushIndex);
});
