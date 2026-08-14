import { test, expect } from '@playwright/test';

test('Lupin B4 MB forces the next two games to 10COIN, then returns to normal lottery', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    const core = new GameCore({ setting:1, seed:0x6ad });

    // Force only the MB trigger game. Continuation games must be produced by the runtime patch.
    core.bet();
    core.lever();
    core.pendingRole={name:'MB',payout:0,replay:false};
    core.lastRole=core.pendingRole;
    core.reels.start(core.pendingRole);
    core.stopReel(0); core.stopReel(1); const mb=core.stopReel(2).result;

    const play = () => {
      core.bet();
      const lever=core.lever();
      core.stopReel(0); core.stopReel(1); const done=core.stopReel(2).result;
      return {lever,done};
    };

    const first=play();
    const second=play();

    // For the third game, replace rng.next with a deterministic MISS draw.
    core.rng.next=()=>0.999999;
    const third=play();

    return {
      mbRole:mb.role,
      mbState:mb.mb,
      firstRole:first.done.role,
      firstPayout:first.done.payout,
      firstReels:first.done.reelResult,
      firstMb:first.done.mb,
      secondRole:second.done.role,
      secondPayout:second.done.payout,
      secondReels:second.done.reelResult,
      secondMb:second.done.mb,
      thirdRole:third.done.role,
      thirdMb:third.done.mb,
      snapshotMb:core.snapshot().mb
    };
  });

  expect(result.mbRole).toBe('MB');
  expect(result.mbState).toMatchObject({state:'ACTIVE',remainingGames:2});

  expect(result.firstRole).toBe('10COIN');
  expect(result.firstPayout).toBe(10);
  expect(result.firstReels).toEqual(['BAR','COIN','COIN']);
  expect(result.firstMb).toMatchObject({state:'ACTIVE',remainingGames:1});

  expect(result.secondRole).toBe('10COIN');
  expect(result.secondPayout).toBe(10);
  expect(result.secondReels).toEqual(['BAR','COIN','COIN']);
  expect(result.secondMb).toMatchObject({state:'COMPLETE',remainingGames:0});

  expect(result.thirdRole).toBe('MISS');
  expect(result.thirdMb).toMatchObject({state:'IDLE',remainingGames:0});
  expect(result.snapshotMb).toMatchObject({state:'IDLE',remainingGames:0});
});
