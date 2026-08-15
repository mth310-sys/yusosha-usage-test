import { test, expect } from '@playwright/test';

test('Lupin B4 typewriter setting hint uses verified rates and normal-only runtime', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/setting-hint-profile.js?v=step6ai-hint3');
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const fake = value => ({ next: () => value });
    const direct = {
      s1: profile.drawTypewriterSettingHint(1, fake(0)),
      s2: profile.drawTypewriterSettingHint(2, fake(0)),
      s3: profile.drawTypewriterSettingHint(3, fake(0)),
      s4hit: profile.drawTypewriterSettingHint(4, fake(0)),
      s4miss: profile.drawTypewriterSettingHint(4, fake((1 / 382442) + 1e-8)),
      s5hit: profile.drawTypewriterSettingHint(5, fake(0)),
      s5miss: profile.drawTypewriterSettingHint(5, fake((1 / 402459) + 1e-8)),
      s6hit: profile.drawTypewriterSettingHint(6, fake(0)),
      s6miss: profile.drawTypewriterSettingHint(6, fake((1 / 389997) + 1e-8))
    };

    const normalValues=[0.5,0.5,0];
    const normalCore = new GameCore({ setting:4, seed:0x6d1 });
    normalCore.__lcdSettingHintRng = { next: () => normalValues.shift() ?? 0.5 };
    normalCore.bet();
    normalCore.lever();
    normalCore.stopReel(0);
    normalCore.stopReel(1);
    const normalGame = normalCore.stopReel(2).result;

    const bonusValues=[0.5,0.5,0];
    const bonusCore = new GameCore({ setting:4, seed:0x6d2 });
    bonusCore.__lcdSettingHintRng = { next: () => bonusValues.shift() ?? 0 };
    bonusCore.lupinBonus.start('DEBUG_TYPEWRITER_HINT_EXCLUSION');
    bonusCore.bet();
    bonusCore.lever();
    bonusCore.stopReel(0);
    bonusCore.stopReel(1);
    const bonusGame = bonusCore.stopReel(2).result;

    return {
      entry4: profile.getTypewriterSettingHint(4),
      entry5: profile.getTypewriterSettingHint(5),
      entry6: profile.getTypewriterSettingHint(6),
      direct,
      normalHint: normalGame.typewriterSettingHint,
      bonusHint: bonusGame.typewriterSettingHint,
      snapshot: normalCore.snapshot().typewriterSettingHint
    };
  });

  expect(result.entry4).toEqual({
    id:'GODDESS_PRESENT',
    text:'女神がくれたプレゼント',
    meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',
    denominator:382442
  });
  expect(result.entry5.denominator).toBe(402459);
  expect(result.entry6.denominator).toBe(389997);

  expect(result.direct.s1).toBeNull();
  expect(result.direct.s2).toBeNull();
  expect(result.direct.s3).toBeNull();
  expect(result.direct.s4hit.id).toBe('GODDESS_PRESENT');
  expect(result.direct.s4miss).toBeNull();
  expect(result.direct.s5hit.id).toBe('GODDESS_PRESENT');
  expect(result.direct.s5miss).toBeNull();
  expect(result.direct.s6hit.id).toBe('GODDESS_PRESENT');
  expect(result.direct.s6miss).toBeNull();

  expect(result.normalHint).toMatchObject({
    id:'GODDESS_PRESENT',
    meaning:'SETTING_4_OR_5_OR_6_CONFIRMED',
    denominator:382442,
    source:'CROSS_SOURCE_PUBLISHED_TYPEWRITER_SETTING_HINT_RATES'
  });
  expect(result.bonusHint).toBeNull();
  expect(result.snapshot.last.id).toBe('GODDESS_PRESENT');
});
