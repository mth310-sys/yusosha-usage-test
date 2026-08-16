import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED post-WC setting tables keep final-band availability boundary', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const { WANTED_POST_WC_ZONES, drawWantedPostWcTarget } = await import('/test_lupin_b4/js/wanted-profile.js?v=step6bc-wanted-post-wc-setting-boundary2');

    const drawWith = (setting, values) => {
      const seq=[...values];
      let draws=0;
      const rng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
      const target=drawWantedPostWcTarget(setting,rng);
      return {setting,draws,target};
    };

    const finalBandWeights=Object.fromEntries(
      [1,2,3,4,5,6].map(setting=>{
        const row=WANTED_POST_WC_ZONES[setting].find(zone=>zone.min===449&&zone.max===480);
        return [setting,row?.weight??null];
      })
    );

    return {
      finalBandWeights,
      low:[1,2,3,4,5,6].map(setting=>drawWith(setting,[0.0,0.0])),
      high:[1,2,3,4,5,6].map(setting=>drawWith(setting,[0.999999,0.999999]))
    };
  });

  expect(result.finalBandWeights).toEqual({
    1:0,
    2:0,
    3:0,
    4:0.8,
    5:0.8,
    6:0.8
  });

  for(const row of result.low){
    expect(row.draws).toBe(2);
    expect(row.target.cycle).toBe('POST_WC_FAILURE');
    expect(row.target.distribution).toBe('VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND');
    expect(row.target.hardMaxGame).toBe(480);
    expect(row.target.zone).toMatchObject({min:1,max:32});
    expect(row.target.game).toBe(1);
  }

  for(const row of result.high){
    expect(row.draws).toBe(2);
    expect(row.target.cycle).toBe('POST_WC_FAILURE');
    expect(row.target.distribution).toBe('VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND');
    expect(row.target.hardMaxGame).toBe(480);
  }

  // Verified table boundary: settings 1-3 have zero weight in 449-480G,
  // so the highest selectable positive band remains 417-448G.
  for(const row of result.high.filter(row=>row.setting<=3)){
    expect(row.target.zone).toMatchObject({min:417,max:448});
    expect(row.target.game).toBe(448);
  }

  // Verified table boundary: settings 4-6 retain positive weight in 449-480G,
  // therefore a near-1 weighted roll can select the hard-max band.
  for(const row of result.high.filter(row=>row.setting>=4)){
    expect(row.target.zone).toMatchObject({min:449,max:480});
    expect(row.target.game).toBe(480);
  }
});
