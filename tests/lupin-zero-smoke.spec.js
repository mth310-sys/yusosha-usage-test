import { test, expect } from '@playwright/test';

async function bootZero(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#phaseBadge')).toHaveText('RESEARCH CORE');
  await expect(page.locator('#creditValue')).toHaveText('50');
  await expect(page.locator('#betValue')).toHaveText('0');
  await expect(page.locator('#stateValue')).toHaveText('IDLE');
  expect(errors).toEqual([]);
}

test('LUPIN ZERO boots and exposes the research core', async ({ page }) => {
  await bootZero(page);

  const exposed = await page.evaluate(() => Boolean(
    window.__LUPIN_ZERO__?.core &&
    window.__LUPIN_ZERO__?.game &&
    window.__LUPIN_ZERO__?.researchReels
  ));
  expect(exposed).toBe(true);
});

test('LUPIN ZERO completes one deterministic control-flow game', async ({ page }) => {
  await bootZero(page);

  await expect(page.locator('#maxBetBtn')).toBeEnabled();
  await page.locator('#maxBetBtn').click();
  await expect(page.locator('#creditValue')).toHaveText('47');
  await expect(page.locator('#betValue')).toHaveText('3');
  await expect(page.locator('#stateValue')).toHaveText('READY');

  await expect(page.locator('#startBtn')).toBeEnabled();
  await page.locator('#startBtn').click();
  await expect(page.locator('#stateValue')).toHaveText('SPINNING');

  for (const reel of ['0', '1', '2']) {
    const stop = page.locator(`.stop[data-reel="${reel}"]`);
    await expect(stop).toBeEnabled();
    await stop.click();
  }

  await expect(page.locator('#stateValue')).toHaveText('IDLE');
  await expect(page.locator('#betValue')).toHaveText('0');
  await expect(page.locator('#creditValue')).toHaveText('47');
  await expect(page.locator('#message')).toContainText('研究用1ゲーム完了');
});

test('LUPIN ZERO keeps real-machine probability logic disconnected', async ({ page }) => {
  await bootZero(page);

  const profile = await page.evaluate(() => window.__LUPIN_ZERO__.researchReels.snapshot().profile);
  expect(profile).toEqual({
    mode: 'RESEARCH_ONLY',
    source: 'PLACEHOLDER',
    realMachineStrip: 'UNVERIFIED',
    probabilityModel: 'DISCONNECTED'
  });
});

test('LUPIN ZERO research reel stops are deterministic without claiming real strips', async ({ page }) => {
  await bootZero(page);

  const result = await page.evaluate(async () => {
    const { ResearchReelEngine } = await import('/test_lupin_zero/src/research-reel-engine.js');
    const first = new ResearchReelEngine();
    const second = new ResearchReelEngine();
    first.start(7);
    second.start(7);
    return {
      first: [first.stop(0), first.stop(1), first.stop(2)],
      second: [second.stop(0), second.stop(1), second.stop(2)]
    };
  });

  expect(result.first).toEqual(result.second);
  expect(result.first.every((stop) => stop.source === 'PLACEHOLDER')).toBe(true);
});

test('VerifiedSpec keeps published base role denominators exact and reel strips unresolved', async ({ page }) => {
  await bootZero(page);

  const result = await page.evaluate(async () => {
    const spec = await import('/test_lupin_zero/src/verified-spec.js');
    return {
      replay: spec.getNormalRoleDenominator('REPLAY', 1),
      threeCoin: spec.getNormalRoleDenominator('THREE_COIN', 6),
      mb: spec.getNormalRoleDenominator('MB', 3),
      nineCoin: [1,2,3,4,5,6].map((setting) => spec.getNormalRoleDenominator('NINE_COIN', setting)),
      tenCoin: [1,2,3,4,5,6].map((setting) => spec.getNormalRoleDenominator('TEN_COIN', setting)),
      premium: [1,2,3,4,5,6].map((setting) => spec.getNormalRoleDenominator('PREMIUM', setting)),
      legend: [1,2,3,4,5,6].map((setting) => spec.getNormalRoleDenominator('LEGEND', setting)),
      invalid: spec.getNormalRoleDenominator('UNKNOWN', 1),
      evidence: spec.VERIFIED_SPEC.evidence,
      policy: spec.VERIFIED_SPEC.policy,
      play: spec.VERIFIED_SPEC.play,
      mbSpec: spec.VERIFIED_SPEC.mb
    };
  });

  expect(result.replay).toBe(7.30);
  expect(result.threeCoin).toBe(99.99);
  expect(result.mb).toBe(27.31);
  expect(result.nineCoin).toEqual([25.28,25.46,25.62,25.78,25.94,26.11]);
  expect(result.tenCoin).toEqual([26.27,25.18,24.28,23.45,22.67,21.94]);
  expect(result.premium).toEqual([65536,65536,65536,65536,32768,21845.33]);
  expect(result.legend).toEqual([65536,65536,65536,65536,32768,32768]);
  expect(result.invalid).toBeNull();
  expect(result.play).toEqual({
    normalFreeStopAllowed: true,
    normalPushOrderPenalty: false,
    rareRoleFamilies: ['青チャンス目', '赤チャンス目', '金チャンス目'],
    gamesPer50Coins: { min: 46.1, max: 48.7 }
  });
  expect(result.evidence.fullPhysicalReelStrips).toBe('UNRESOLVED');
  expect(result.evidence.rareRolePhysicalStopPatterns).toBe('UNRESOLVED');
  expect(result.policy.fullPhysicalReelStrips).toBe('DO_NOT_INVENT');
  expect(result.policy.rareRolePhysicalStopPatterns).toBe('DO_NOT_INVENT');
  expect(result.policy.unlistedProbabilities).toBe('DO_NOT_INTERPOLATE');
  expect(result.mbSpec).toEqual({
    stopLine: 'MIDDLE',
    stopSymbols: ['次元', '五エ門', 'ルパン'],
    followupGames: 2,
    payoutEachGame: 10
  });
});

test('VerifiedSpec locks published mode durations without inventing missing routes', async ({ page }) => {
  await bootZero(page);

  const result = await page.evaluate(async () => {
    const { VERIFIED_SPEC } = await import('/test_lupin_zero/src/verified-spec.js');
    const flow = await import('/test_lupin_zero/src/game-flow-spec.js');
    return {
      modes: VERIFIED_SPEC.modeProfiles,
      wantedFlow: flow.GAME_FLOW_SPEC.knownButUnresolved.find((entry) => entry.mode === flow.GameMode.WANTED_CHANCE),
      policy: flow.GAME_FLOW_SPEC.policy
    };
  });

  expect(result.modes.wantedChance).toEqual({
    baseGames: 10,
    holdSlots: 8,
    decrementPausesForChangedHold: true,
    wantedCounterMaxGames: 480
  });
  expect(result.modes.raiunHigh).toEqual({
    entryCounterPoints: 100,
    games: 7,
    successCondition: 'BLUE_SYMBOL_ALIGNED'
  });
  expect(result.modes.raiunMode).toEqual({
    games: 20,
    artExpectedRatePercent: 23,
    artTrigger: 'SEVEN_SYMBOL_ALIGNED',
    pureIncreaseCoinsPerGame: 2
  });
  expect(result.modes.lupinBonus).toEqual({
    gamesApprox: 35,
    artExpectedRatePercentApprox: 50,
    pureIncreaseCoinsPerGame: 2,
    finalBattleGames: 5,
    artTrigger: 'ZENIGATA_BATTLE_WIN'
  });
  expect(result.modes.goldenTime).toEqual({
    setGamesApprox: 40,
    pureIncreaseCoinsPerGame: 2,
    continuationExpectationPercent: { min: 80.4, max: 83.3 },
    expectedSets: { min: 5.1, max: 6 }
  });
  expect(result.wantedFlow.automaticEntryRoute).toBeNull();
  expect(result.wantedFlow.automaticEntryProbability).toBeNull();
  expect(result.policy.inferMissingLinks).toBe(false);
  expect(result.policy.inferAutomaticEntryProbability).toBe(false);
});
