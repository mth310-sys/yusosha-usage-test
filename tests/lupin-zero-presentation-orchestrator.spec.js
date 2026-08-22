import { test, expect } from '@playwright/test';

test('research presentation cue synchronizes led mechanism lcd without automatic trigger claim', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const before = await page.evaluate(() => ({
    left: document.querySelector('.machine')?.dataset.leftLed ?? null,
    right: document.querySelector('.machine')?.dataset.rightLed ?? null,
    mechanism: document.querySelector('#prismMechanism')?.dataset.state ?? null,
    lcd: document.querySelector('.lcd-shell')?.dataset.cue ?? null,
    policy: window.__LUPIN_ZERO__.presentation.snapshot()
  }));

  expect(before.mechanism).toBe('closed');

  await page.locator('#phaseBadge').click();

  const reveal = await page.evaluate(() => ({
    left: document.querySelector('.machine')?.dataset.leftLed,
    right: document.querySelector('.machine')?.dataset.rightLed,
    mechanism: document.querySelector('#prismMechanism')?.dataset.state,
    lcd: document.querySelector('.lcd-shell')?.dataset.cue,
    snapshot: window.__LUPIN_ZERO__.presentation.snapshot()
  }));

  expect(reveal.left).toBe('reveal');
  expect(reveal.right).toBe('reveal');
  expect(reveal.mechanism).toBe('reveal');
  expect(reveal.lcd).toBe('research_reveal');
  expect(reveal.snapshot.surface.leftFrameLed).toBe('REVEAL');
  expect(reveal.snapshot.surface.rightFrameLed).toBe('REVEAL');
  expect(reveal.snapshot.surface.topMechanism).toBe('REVEAL');
  expect(reveal.snapshot.surface.mainLcdCue).toBe('RESEARCH_REVEAL');
  expect(reveal.snapshot.traceLength).toBe(4);

  await page.locator('#phaseBadge').click();

  const reset = await page.evaluate(() => ({
    left: document.querySelector('.machine')?.dataset.leftLed,
    right: document.querySelector('.machine')?.dataset.rightLed,
    mechanism: document.querySelector('#prismMechanism')?.dataset.state,
    lcd: document.querySelector('.lcd-shell')?.dataset.cue,
    snapshot: window.__LUPIN_ZERO__.presentation.snapshot()
  }));

  expect(reset.left).toBe('idle');
  expect(reset.right).toBe('idle');
  expect(reset.mechanism).toBe('closed');
  expect(reset.lcd).toBe('research_reset');
  expect(reset.snapshot.traceLength).toBe(8);
});
