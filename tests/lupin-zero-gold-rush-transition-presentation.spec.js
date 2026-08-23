import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtimePath = new URL('../test_lupin_zero/src/gold-rush-transition-presentation-runtime.js', import.meta.url);
const goldRushRuntimePath = new URL('../test_lupin_zero/src/gold-rush-runtime.js', import.meta.url);
const indexPath = new URL('../test_lupin_zero/index.html', import.meta.url);

const runtime = fs.readFileSync(runtimePath, 'utf8');
const goldRushRuntime = fs.readFileSync(goldRushRuntimePath, 'utf8');
const index = fs.readFileSync(indexPath, 'utf8');

test('GOLD RUSH transition presentation exposes the three production routes', () => {
  for (const route of ['CONTINUE_GOLD_RUSH', 'RETURN_EXTRA_BONUS', 'GT_CONTINUATION_BATTLE']) {
    assert.match(runtime, new RegExp(route));
    assert.match(goldRushRuntime, new RegExp(`route: '${route}'`));
  }
});

test('transition presentation is presentation-only and does not own route or stock logic', () => {
  assert.match(runtime, /evidenceStatus: 'PRESENTATION_ONLY'/);
  assert.match(runtime, /affectsGameLogic: false/);
  assert.match(runtime, /changesModeRoute: false/);
  assert.match(runtime, /changesStockAward: false/);
  assert.doesNotMatch(runtime, /kernelState\s*=/);
  assert.doesNotMatch(runtime, /goldenTimeStockCount\s*:/);
});

test('GOLD RUSH runtime emits transition cues before existing route handling', () => {
  const continueEmit = goldRushRuntime.indexOf("route: 'CONTINUE_GOLD_RUSH'");
  const extraEmit = goldRushRuntime.indexOf("route: 'RETURN_EXTRA_BONUS'");
  const battleEmit = goldRushRuntime.indexOf("route: 'GT_CONTINUATION_BATTLE'");
  assert.ok(continueEmit >= 0);
  assert.ok(extraEmit >= 0);
  assert.ok(battleEmit >= 0);
  assert.match(goldRushRuntime, /mode: GameMode\.EXTRA_BONUS/);
  assert.match(goldRushRuntime, /mode: GameMode\.GOLDEN_TIME/);
  assert.match(goldRushRuntime, /modeResult: 'PENDING_GT_CONTINUATION'/);
});

test('transition runtime is loaded after GOLD RUSH game/result presentation runtimes', () => {
  const core = index.indexOf('./src/gold-rush-runtime.js');
  const game = index.indexOf('./src/gold-rush-game-presentation-runtime.js');
  const result = index.indexOf('./src/gold-rush-red-alignment-presentation-runtime.js');
  const transition = index.indexOf('./src/gold-rush-transition-presentation-runtime.js');
  assert.ok(core >= 0 && game > core && result > game && transition > result);
});
