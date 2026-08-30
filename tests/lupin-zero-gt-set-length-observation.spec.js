import { test, expect } from '@playwright/test';

const OBSERVATION_MODULE_URL = '/test_lupin_zero/src/gt-set-length-observation-spec.js';
const RESOLVER_MODULE_URL = '/test_lupin_zero/src/golden-time-resolver.js';

test('published cumulative ART counter constrains GT timing without inventing internal boundaries', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async ({ observationUrl, resolverUrl }) => {
    const observation = await import(observationUrl);
    const resolver = await import(resolverUrl);
    return {
      spec: observation.GT_SET_LENGTH_OBSERVATION_SPEC,
      summary: observation.summarizeGtSetLengthObservations(),
      profile: resolver.createGoldenTimeSetProfile(),
      policy: resolver.GOLDEN_TIME_PRODUCTION_POLICY
    };
  }, { observationUrl: OBSERVATION_MODULE_URL, resolverUrl: RESOLVER_MODULE_URL });

  expect(result.spec.publishedNominalSetGames).toBe(40);
  expect(result.spec.publishedNominalSetGamesMeaning).toBe('APPROXIMATE');
  expect(result.spec.observationUnit).toBe('PUBLISHED_CUMULATIVE_ART_COUNTER_INTERVAL_BETWEEN_SET_ANNOTATIONS');
  expect(result.spec.counterResetsAtArtEnd).toBe(true);
  expect(result.spec.counterResetsAtContinuedSetBoundary).toBe(false);
  expect(result.spec.counterResetSemanticsEvidenceStatus).toBe('PUBLISHED_SOURCE_EXPLICIT_NOTE');
  expect(result.spec.exactMachineSetLengthObservation).toBe(false);
  expect(result.spec.setAnnotationInternalBoundarySemanticsResolved).toBe(false);
  expect(result.spec.fixedFortyGameRuntimeModelAllowed).toBe(false);
  expect(result.spec.fixedThirtyPlusTenRuntimeModelAllowed).toBe(false);
  expect(result.spec.inferVariableInternalSetLengthFromCounterIntervalsAllowed).toBe(false);
  expect(result.spec.exactContinuationBattleEntryGame).toBeNull();
  expect(result.spec.lupinRushGames).toBe(4);
  expect(result.spec.lupinRushCountedInsideSetAnnotationInterval).toBeNull();
  expect(result.spec.treasureBattleCountedInsideSetAnnotationInterval).toBeNull();
  expect(result.spec.productionEffect).toBe('CONSTRAINT_ONLY_DO_NOT_SYNTHESIZE_UNKNOWN_BATTLE_TIMING_OR_VARIABLE_SET_LENGTH');

  expect(result.summary.count).toBeGreaterThanOrEqual(10);
  expect(result.summary.hasNonFortyInterval).toBe(true);
  expect(result.summary.min).toBeLessThan(40);
  expect(result.summary.max).toBeGreaterThan(40);
  expect(result.summary.counterResetsAtArtEnd).toBe(true);
  expect(result.summary.counterResetsAtContinuedSetBoundary).toBe(false);
  expect(result.summary.exactMachineSetLengthObservation).toBe(false);
  expect(result.summary.setAnnotationInternalBoundarySemanticsResolved).toBe(false);
  expect(result.summary.inferVariableInternalSetLengthFromCounterIntervalsAllowed).toBe(false);
  expect(result.summary.exactContinuationBattleEntryGame).toBeNull();

  expect(result.profile.games).toBe(40);
  expect(result.profile.gamesMeaning).toBe('APPROXIMATE_PUBLISHED_NOMINAL');
  expect(result.profile.fixedSetLengthAllowed).toBe(false);
  expect(result.profile.continuationBattleEntryGame).toBeNull();

  expect(result.policy.publishedSetGamesApprox).toBe(40);
  expect(result.policy.publishedSetGamesMeaning).toBe('APPROXIMATE');
  expect(result.policy.fixedFortyGameRuntimeModelAllowed).toBe(false);
  expect(result.policy.fixedThirtyPlusTenRuntimeModelAllowed).toBe(false);
  expect(result.policy.continuationBattleExactEntryGame).toBeNull();
  expect(result.policy.continuationBattleTimingEvidenceStatus).toBe('UNRESOLVED');
});
