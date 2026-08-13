import { test, expect } from '@playwright/test';

test('role lottery rejects invalid denominators instead of forcing a role hit', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const roleLottery = await import('/test_lupin_b4/js/role-lottery.js');
    const settingProfile = await import('/test_lupin_b4/js/setting-profile.js');
    const zeroRng = { next: () => 0 };
    const highRng = { next: () => 0.999999 };
    const valid = settingProfile.getSettingProfile(1);
    const invalidZero = { ...valid, roles:{ ...valid.roles, replay:0 } };
    const invalidNegative = { ...valid, roles:{ ...valid.roles, mb:-1 } };
    const invalidText = { ...valid, roles:{ ...valid.roles, coin3:'UNKNOWN' } };
    const invalidInfinity = { ...valid, roles:{ ...valid.roles, coin9:Infinity } };

    return {
      missingProfile: roleLottery.drawRole(null, zeroRng),
      zero: roleLottery.drawRole(invalidZero, zeroRng),
      negative: roleLottery.drawRole(invalidNegative, zeroRng),
      text: roleLottery.drawRole(invalidText, zeroRng),
      infinity: roleLottery.drawRole(invalidInfinity, zeroRng),
      invalidRates: roleLottery.expectedRoleRates(invalidZero),
      verifiedFirstHit: roleLottery.drawRole(valid, zeroRng),
      verifiedMiss: roleLottery.drawRole(valid, highRng),
      verifiedRates: roleLottery.expectedRoleRates(valid)
    };
  });

  expect(result.missingProfile).toBeNull();
  expect(result.zero).toBeNull();
  expect(result.negative).toBeNull();
  expect(result.text).toBeNull();
  expect(result.infinity).toBeNull();
  expect(result.invalidRates).toBeNull();
  expect(result.verifiedFirstHit).toEqual({ name:'REPLAY', payout:0, replay:true });
  expect(result.verifiedMiss).toEqual({ name:'MISS', payout:0, replay:false });
  expect(result.verifiedRates).toEqual({ REPLAY:7.3, MB:27.31, '3COIN':99.99, '9COIN':25.28, '10COIN':26.27 });
});
