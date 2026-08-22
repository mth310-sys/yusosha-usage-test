import { test, expect } from '@playwright/test';

test('reuse registry accepts safe Yusosha assets and rejects unsafe production reuse', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const {
      evaluateReuseCandidate,
      ReuseEvidenceStatus,
      HIGH_VALUE_REUSE_SOURCES
    } = await import('/test_lupin_zero/src/reuse-registry.js');

    const safeVisual = evaluateReuseCandidate({
      sourcePath: 'test_lupin_visual_lab/led-v7.css',
      generic: true,
      evidenceStatus: ReuseEvidenceStatus.PRESENTATION_ONLY,
      responsibility: 'PRESENTATION',
      productionBehavior: false,
      zeroYen: true,
      adaptationCost: 'LOW'
    });

    const unresolvedRule = evaluateReuseCandidate({
      sourcePath: 'old-machine-rule.js',
      targetIdentityKey: 'OLYMPIA_2016_LUPIN_KESARETA_B4',
      evidenceStatus: ReuseEvidenceStatus.UNRESOLVED,
      responsibility: 'RULES',
      productionBehavior: true,
      zeroYen: true,
      adaptationCost: 'LOW'
    });

    const otherMachine = evaluateReuseCandidate({
      sourcePath: 'other-lupin.js',
      targetIdentityKey: 'OTHER_LUPIN_MACHINE',
      evidenceStatus: ReuseEvidenceStatus.VERIFIED,
      responsibility: 'RULES',
      productionBehavior: true,
      zeroYen: true,
      adaptationCost: 'LOW'
    });

    const mixed = evaluateReuseCandidate({
      sourcePath: 'legacy-monolith.js',
      generic: true,
      evidenceStatus: ReuseEvidenceStatus.VERIFIED,
      responsibility: 'MIXED_RULES_AND_RENDERING',
      productionBehavior: true,
      zeroYen: true,
      adaptationCost: 'LOW'
    });

    return { safeVisual, unresolvedRule, otherMachine, mixed, HIGH_VALUE_REUSE_SOURCES };
  });

  expect(result.safeVisual.reusable).toBe(true);
  expect(result.safeVisual.mode).toBe('ADAPT_PRESENTATION');
  expect(result.unresolvedRule.reusable).toBe(false);
  expect(result.unresolvedRule.gates.evidence).toBe(false);
  expect(result.otherMachine.reusable).toBe(false);
  expect(result.otherMachine.gates.target).toBe(false);
  expect(result.mixed.reusable).toBe(false);
  expect(result.mixed.gates.responsibility).toBe(false);
  expect(result.HIGH_VALUE_REUSE_SOURCES.length).toBeGreaterThanOrEqual(5);
});
