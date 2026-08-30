import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const runtimePath = path.join(root, 'test_lupin_zero/src/gold-rush-game-presentation-runtime.js');
const goldRushPath = path.join(root, 'test_lupin_zero/src/gold-rush-runtime.js');
const indexPath = path.join(root, 'test_lupin_zero/index.html');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const goldRush = fs.readFileSync(goldRushPath, 'utf8');
const index = fs.readFileSync(indexPath, 'utf8');

test('GOLD RUSH keeps a five-phase presentation-only flow', () => {
  for (const phase of ['START_CUE', 'STOP_1', 'STOP_2', 'STOP_3', 'RESULT_REVEAL']) {
    expect(runtime).toContain(phase);
  }
  expect(runtime).toContain("evidenceStatus: 'PRESENTATION_ONLY'");
  expect(runtime).toContain('affectsGameLogic: false');
  expect(runtime).toContain('changesContinuationRate: false');
  expect(runtime).toContain('changesStockAward: false');
  expect(runtime).toContain('automaticBreakthroughRankSelection: false');
});

test('GOLD RUSH presentation drives phases only from resolved runtime events', () => {
  expect(runtime).toContain("core.addEventListener('spin-start'");
  expect(runtime).toContain("core.addEventListener('reel-stop'");
  expect(runtime).toContain("core.addEventListener('gold-rush-red-alignment-presentation'");
  expect(runtime).toContain("event.detail.snapshot.mode === GameMode.GOLD_RUSH");
});

test('GOLD RUSH preserves game logic and breakthrough awards', () => {
  expect(goldRush).toContain('resolveGoldRushGame(random)');
  expect(goldRush).toContain("const presentationRank = breakthrough?.type ?? 'NORMAL_RED_ALIGNMENT'");
  expect(goldRush).toContain('const stockAdded = Math.max(1, breakthrough?.minimumGtStockAward ?? 1)');
  expect(goldRush).toContain("core.emit('gold-rush-red-alignment-presentation'");
});

test('GOLD RUSH staged presentation loads after logic and before result surface', () => {
  const logic = index.indexOf('./src/gold-rush-runtime.js');
  const staged = index.indexOf('./src/gold-rush-game-presentation-runtime.js');
  const result = index.indexOf('./src/gold-rush-red-alignment-presentation-runtime.js');
  expect(logic).toBeGreaterThan(-1);
  expect(staged).toBeGreaterThan(logic);
  expect(result).toBeGreaterThan(staged);
});
