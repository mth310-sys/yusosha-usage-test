import { test, expect } from '@playwright/test';

test('Lupin B4 game log shows verified setting hints when they occur', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    const { GameLogger } = await import('/test_lupin_b4/js/logger.js?v=step6aj-hint-log1');

    const core = new GameCore({ setting:6, seed:0x6e1 });
    core.__lcdSettingHintRng = { next: () => 0 };
    core.bet();
    core.lever();
    core.stopReel(0);
    core.stopReel(1);
    const game = core.stopReel(2).result;

    const logger = new GameLogger();
    logger.push(game);
    return {
      text: logger.toText(),
      lcd: game.settingHint,
      description: game.machineDescriptionSettingHint,
      typewriter: game.typewriterSettingHint
    };
  });

  expect(result.lcd.digits).toBe('526');
  expect(result.description.id).toBe('GOOD_MACHINE');
  expect(result.typewriter.id).toBe('GODDESS_PRESENT');
  expect(result.text).toContain('HINT_LCD 526 / SETTING_2_OR_5_OR_6_CONFIRMED');
  expect(result.text).toContain('HINT_DESC どうやらこの台は良い台みたいだぜ！ / SETTING_4_OR_5_OR_6_CONFIRMED');
  expect(result.text).toContain('HINT_TYPEWRITER 女神がくれたプレゼント / SETTING_4_OR_5_OR_6_CONFIRMED');
});
