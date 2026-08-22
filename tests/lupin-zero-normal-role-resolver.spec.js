import { test, expect } from '@playwright/test';

test('normal role resolver samples known published roles and preserves unresolved residual', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { SequenceRandomSource } = await import('/test_lupin_zero/src/random-source.js');
    const {
      getKnownProbabilityMass,
      getUnresolvedProbabilityMass,
      resolveNormalRole,
      NORMAL_ROLE_RESOLVER_POLICY
    } = await import('/test_lupin_zero/src/normal-role-resolver.js');
    const { NormalGameKernel, NORMAL_GAME_KERNEL_POLICY } = await import('/test_lupin_zero/src/normal-game-kernel.js');

    const knownMass = getKnownProbabilityMass(1);
    const unresolvedMass = getUnresolvedProbabilityMass(1);

    const premium = resolveNormalRole(new SequenceRandomSource([0]), 1);
    const unresolved = resolveNormalRole(new SequenceRandomSource([0.999999]), 1);

    const kernel = new NormalGameKernel({ credit: 50, maxBet: 3, setting: 1 });
    kernel.betMax();
    kernel.leverOn();
    const resolution = kernel.resolveRoleFromRandom(new SequenceRandomSource([0]));

    return {
      knownMass,
      unresolvedMass,
      premium,
      unresolved,
      resolution,
      snapshot: kernel.snapshot(),
      resolverPolicy: NORMAL_ROLE_RESOLVER_POLICY,
      kernelPolicy: NORMAL_GAME_KERNEL_POLICY
    };
  });

  expect(result.knownMass).toBeGreaterThan(0);
  expect(result.knownMass).toBeLessThan(1);
  expect(result.unresolvedMass).toBeCloseTo(1 - result.knownMass, 12);
  expect(result.premium.kind).toBe('KNOWN_ROLE');
  expect(result.premium.role).toBe('PREMIUM');
  expect(result.unresolved.kind).toBe('UNRESOLVED_OTHER');
  expect(result.resolverPolicy.residualMayBeTreatedAsMiss).toBe(false);
  expect(result.resolverPolicy.residualMayBeGivenInventedPayout).toBe(false);
  expect(result.resolution.accepted).toBe(true);
  expect(result.snapshot.phase).toBe('SPINNING');
  expect(result.snapshot.resolvedRole).toBe('PREMIUM');
  expect(result.kernelPolicy.internalKnownRoleLotteryImplemented).toBe(true);
  expect(result.kernelPolicy.completeRoleLotteryImplemented).toBe(false);
});
