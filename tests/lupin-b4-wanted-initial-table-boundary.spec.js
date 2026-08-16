import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED initial target table keeps published weights and 1-480 boundaries', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const { WANTED_INITIAL_ZONES, drawWantedInitialTarget } = await import('/test_lupin_b4/js/wanted-profile.js?v=step6bf-wanted-initial-table-boundary2');

    const drawWith = (values) => {
      const seq=[...values];
      let draws=0;
      const rng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
      const target=drawWantedInitialTarget(rng);
      return {draws,target};
    };

    return {
      zones:WANTED_INITIAL_ZONES.map(zone=>({...zone})),
      publishedWeightTotal:Number(WANTED_INITIAL_ZONES.reduce((sum,row)=>sum+row.weight,0).toFixed(1)),
      eligibleBandCount:WANTED_INITIAL_ZONES.filter(row=>row.weight>0).length,
      zeroWeightBands:WANTED_INITIAL_ZONES.filter(row=>row.weight===0).map(row=>`${row.min}-${row.max}`),
      low:drawWith([0.0,0.0]),
      high:drawWith([0.999999,0.999999])
    };
  });

  expect(result.zones).toEqual([
    {min:1,max:32,weight:6.3},
    {min:33,max:64,weight:6.3},
    {min:65,max:96,weight:3.9},
    {min:97,max:128,weight:25.0},
    {min:129,max:160,weight:39.1},
    {min:161,max:192,weight:2.0},
    {min:193,max:224,weight:2.0},
    {min:225,max:256,weight:2.0},
    {min:257,max:288,weight:2.0},
    {min:289,max:320,weight:2.0},
    {min:321,max:352,weight:2.0},
    {min:353,max:384,weight:2.0},
    {min:385,max:416,weight:2.0},
    {min:417,max:448,weight:2.0},
    {min:449,max:480,weight:2.0}
  ]);
  expect(result.publishedWeightTotal).toBe(100.6);
  expect(result.eligibleBandCount).toBe(15);
  expect(result.zeroWeightBands).toEqual([]);

  expect(result.low.draws).toBe(2);
  expect(result.low.target).toMatchObject({
    zone:{min:1,max:32,weight:6.3},
    game:1,
    cycle:'INITIAL',
    distribution:'VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND',
    hardMaxGame:480
  });

  expect(result.high.draws).toBe(2);
  expect(result.high.target).toMatchObject({
    zone:{min:449,max:480,weight:2.0},
    game:480,
    cycle:'INITIAL',
    distribution:'VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND',
    hardMaxGame:480
  });
});
