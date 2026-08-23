import { test, expect } from '@playwright/test';

test('mode-linked cabinet presentation keeps unverified physical cues disabled', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const policy = await page.evaluate(() => window.__LUPIN_ZERO__.modeSurfacePresentationPolicy);
  expect(policy.evidenceStatus).toBe('PRESENTATION_ONLY');
  expect(policy.affectsGameLogic).toBe(false);
  expect(policy.physicalTriggerVerified).toBe(false);
  expect(policy.automaticPhysicalLedCueImplemented).toBe(false);
  expect(policy.automaticPrismCueImplemented).toBe(false);
  expect(policy.lcdSurfaceStylingImplemented).toBe(true);
});

test('surface ambience scales by mode without inventing LED or prism movement', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { GameMode } = await import('/test_lupin_zero/src/game-flow-spec.js');
    const app = window.__LUPIN_ZERO__;
    const prismBefore = document.querySelector('#prismMechanism')?.dataset.state ?? null;
    const leftBefore = document.querySelector('.machine')?.dataset.leftLed ?? null;
    const rightBefore = document.querySelector('.machine')?.dataset.rightLed ?? null;
    const cases = [
      { mode: GameMode.NORMAL, raiunHighGamesRemaining: 0 },
      { mode: GameMode.WANTED_CHANCE },
      { mode: GameMode.RAIUN_MODE },
      { mode: GameMode.FUJIKO_ZONE },
      { mode: GameMode.LUPIN_BONUS },
      { mode: GameMode.GOLDEN_TIME },
      { mode: GameMode.TREASURE_RUSH },
      { mode: GameMode.EXTRA_BONUS }
    ];
    const surfaces = cases.map((state) => app.applyModeSurfacePresentation({ ...app.core.snapshot(), ...state }));
    return {
      surfaces,
      prismBefore,
      prismAfter: document.querySelector('#prismMechanism')?.dataset.state ?? null,
      leftBefore,
      leftAfter: document.querySelector('.machine')?.dataset.leftLed ?? null,
      rightBefore,
      rightAfter: document.querySelector('.machine')?.dataset.rightLed ?? null
    };
  });

  expect(result.surfaces.map((x) => x.level)).toEqual(['low','medium','medium','high','high','high','max','max']);
  for (const surface of result.surfaces) {
    expect(surface.prism).toBeNull();
    expect(surface.leftLed).toBeNull();
    expect(surface.rightLed).toBeNull();
    expect(surface.physicalCueApplied).toBe(false);
  }
  expect(result.prismAfter).toBe(result.prismBefore);
  expect(result.leftAfter).toBe(result.leftBefore);
  expect(result.rightAfter).toBe(result.rightBefore);
});
