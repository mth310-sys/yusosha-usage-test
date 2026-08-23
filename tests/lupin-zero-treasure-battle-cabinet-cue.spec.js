import { test, expect } from '@playwright/test';

async function seedBattle(page) {
  return page.evaluate(async () => {
    const app = window.__LUPIN_ZERO__;
    const core = app.core;
    const { createGoldenTimeSetProfile } = await import('/test_lupin_zero/src/golden-time-resolver.js');
    core.kernelState = Object.freeze({
      ...core.kernelState,
      credit: 100,
      bet: 0,
      phase: 'IDLE',
      stopped: Object.freeze([true, true, true]),
      mode: 'GOLDEN_TIME',
      modeGamesRemaining: 0,
      modeResult: 'PENDING_GT_CONTINUATION',
      modeResultEvidenceStatus: 'PUBLISHED_ANALYSIS',
      goldenTimeTreasure: 350000,
      goldenTimeSetNumber: 1,
      goldenTimeStockCount: 0
    });
    const resolution = Object.freeze({
      eligible: true,
      treasure: 350000,
      continuationPercent: 73.6,
      draw: 0,
      continued: true,
      evidenceStatus: 'PUBLISHED_ANALYSIS'
    });
    core.resolveGoldenTimeContinuation(resolution, createGoldenTimeSetProfile());
    return {
      cue: app.getTreasureBattleCabinetCueState(),
      policy: app.treasureBattleCabinetCuePolicy,
      prism: document.querySelector('#prismMechanism')?.dataset.state ?? null,
      leftLed: document.querySelector('.machine')?.dataset.leftLed ?? null,
      rightLed: document.querySelector('.machine')?.dataset.rightLed ?? null
    };
  });
}

test('Treasure Battle tracks semantic cabinet phases without synthesizing physical cues', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const before = await page.evaluate(() => ({
    prism: document.querySelector('#prismMechanism')?.dataset.state ?? null,
    leftLed: document.querySelector('.machine')?.dataset.leftLed ?? null,
    rightLed: document.querySelector('.machine')?.dataset.rightLed ?? null
  }));
  const seeded = await seedBattle(page);

  expect(seeded.policy.existingLedSurfaceReusable).toBe(true);
  expect(seeded.policy.existingPrismMechanismReusable).toBe(true);
  expect(seeded.policy.automaticLedCue).toBeNull();
  expect(seeded.policy.automaticPrismCue).toBeNull();
  expect(seeded.policy.physicalCueEvidenceStatus).toBe('UNRESOLVED');
  expect(seeded.policy.applyUnverifiedPhysicalCue).toBe(false);
  expect(seeded.cue.active).toBe(true);
  expect(seeded.cue.game).toBe(1);
  expect(seeded.cue.phase).toBe('FIRST_ATTACK');
  expect(seeded.cue.physicalCueApplied).toBe(false);
  expect(seeded.prism).toBe(before.prism);
  expect(seeded.leftLed).toBe(before.leftLed);
  expect(seeded.rightLed).toBe(before.rightLed);
});

test('four Treasure Battle spins do not move prism or LEDs without verified cue evidence', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const seeded = await seedBattle(page);
  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const core = app.core;
    for (let game = 0; game < 4; game++) {
      core.maxBetNow();
      core.start();
      core.stop(0);
      core.stop(1);
      core.stop(2);
    }
    return {
      cue: app.getTreasureBattleCabinetCueState(),
      prism: document.querySelector('#prismMechanism')?.dataset.state ?? null,
      leftLed: document.querySelector('.machine')?.dataset.leftLed ?? null,
      rightLed: document.querySelector('.machine')?.dataset.rightLed ?? null
    };
  });

  expect(result.cue.active).toBe(false);
  expect(result.cue.physicalCueApplied).toBe(false);
  expect(result.prism).toBe(seeded.prism);
  expect(result.leftLed).toBe(seeded.leftLed);
  expect(result.rightLed).toBe(seeded.rightLed);
});

test('production page loads cabinet cue audit after battle runtime and LCD', async ({ page }) => {
  const html = await (await page.request.get('/test_lupin_zero/')).text();
  const battle = html.indexOf('./src/treasure-battle-runtime.js');
  const lcd = html.indexOf('./src/treasure-battle-lcd-runtime.js');
  const cabinet = html.indexOf('./src/treasure-battle-cabinet-cue-runtime.js');
  expect(battle).toBeGreaterThan(-1);
  expect(lcd).toBeGreaterThan(battle);
  expect(cabinet).toBeGreaterThan(lcd);
});
