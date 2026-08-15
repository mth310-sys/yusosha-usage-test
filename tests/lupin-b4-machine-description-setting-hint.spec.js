import { test, expect } from '@playwright/test';

test('Lupin B4 machine-description setting hints use verified rates and normal-only runtime', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/setting-hint-profile.js?v=step6ah-hint2');
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const fake = value => ({ next: () => value });
    const direct = {
      s1: profile.drawMachineDescriptionSettingHint(1, fake(0)),
      s4hit: profile.drawMachineDescriptionSettingHint(4, fake(0)),
      s4miss: profile.drawMachineDescriptionSettingHint(4, fake((1 / 14294.1) + 1e-8)),
      s5hit: profile.drawMachineDescriptionSettingHint(5, fake(0)),
      s6good: profile.drawMachineDescriptionSettingHint(6, fake(0)),
      s6incredible: profile.drawMachineDescriptionSettingHint(6, fake((1 / 16001.0) + 1e-8)),
      s6miss: profile.drawMachineDescriptionSettingHint(6, fake((1 / 16001.0) + (1 / 12000.8) + 1e-8))
    };

    const values=[0.5,0];
    const normalCore = new GameCore({ setting:4, seed:0x6c1 });
    normalCore.__lcdSettingHintRng = { next: () => values.shift() ?? 0.5 };
    normalCore.bet();
    normalCore.lever();
    normalCore.stopReel(0);
    normalCore.stopReel(1);
    const normalGame = normalCore.stopReel(2).result;

    const bonusValues=[0.5,0];
    const bonusCore = new GameCore({ setting:4, seed:0x6c2 });
    bonusCore.__lcdSettingHintRng = { next: () => bonusValues.shift() ?? 0 };
    bonusCore.lupinBonus.start('DEBUG_MACHINE_DESCRIPTION_HINT_EXCLUSION');
    bonusCore.bet();
    bonusCore.lever();
    bonusCore.stopReel(0);
    bonusCore.stopReel(1);
    const bonusGame = bonusCore.stopReel(2).result;

    return {
      entries4: profile.getMachineDescriptionSettingHintEntries(4),
      entries6: profile.getMachineDescriptionSettingHintEntries(6),
      direct,
      normalHint: normalGame.machineDescriptionSettingHint,
      bonusHint: bonusGame.machineDescriptionSettingHint,
      snapshot: normalCore.snapshot().machineDescriptionSettingHint
    };
  });

  expect(result.entries4).toEqual([
    {
      id:'GOOD_MACHINE',
      text:'どうやらこの台は良い台みたいだぜ！',
      meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',
      denominator:14294.1
    }
  ]);
  expect(result.entries6).toEqual([
    {
      id:'GOOD_MACHINE',
      text:'どうやらこの台は良い台みたいだぜ！',
      meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',
      denominator:16001
    },
    {
      id:'INCREDIBLE_FIND',
      text:'どうやらとんでもないものを掴んでしまったみたいだぜ！',
      meaning:'SETTING_6_CONFIRMED',
      denominator:12000.8
    }
  ]);

  expect(result.direct.s1).toBeNull();
  expect(result.direct.s4hit.id).toBe('GOOD_MACHINE');
  expect(result.direct.s4miss).toBeNull();
  expect(result.direct.s5hit.id).toBe('GOOD_MACHINE');
  expect(result.direct.s6good.id).toBe('GOOD_MACHINE');
  expect(result.direct.s6incredible.id).toBe('INCREDIBLE_FIND');
  expect(result.direct.s6miss).toBeNull();

  expect(result.normalHint).toMatchObject({
    id:'GOOD_MACHINE',
    meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',
    denominator:14294.1,
    source:'CROSS_SOURCE_PUBLISHED_MACHINE_DESCRIPTION_SETTING_HINT_RATES'
  });
  expect(result.bonusHint).toBeNull();
  expect(result.snapshot.last.id).toBe('GOOD_MACHINE');
});
