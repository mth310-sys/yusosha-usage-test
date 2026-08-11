// Step 6S: verified WANTED initial-cycle and post-WC cycle target distributions.
// Public analysis provides 32G target bands and states that each game inside a selected band is equally distributed.
// WANTED CHANCE is guaranteed by 480G at the latest.

export const WANTED_INITIAL_ZONES = Object.freeze([
  { min:1, max:32, weight:6.3 },
  { min:33, max:64, weight:6.3 },
  { min:65, max:96, weight:3.9 },
  { min:97, max:128, weight:25.0 },
  { min:129, max:160, weight:39.1 },
  { min:161, max:192, weight:2.0 },
  { min:193, max:224, weight:2.0 },
  { min:225, max:256, weight:2.0 },
  { min:257, max:288, weight:2.0 },
  { min:289, max:320, weight:2.0 },
  { min:321, max:352, weight:2.0 },
  { min:353, max:384, weight:2.0 },
  { min:385, max:416, weight:2.0 },
  { min:417, max:448, weight:2.0 },
  { min:449, max:480, weight:2.0 }
]);

const POST_WC_ROWS = [
  [1,32,[0.4,0.4,0.4,0.4,0.4,0.4]],
  [33,64,[15.2,15.2,16.0,17.2,19.1,23.8]],
  [65,96,[4.7,5.1,5.9,5.9,6.6,7.8]],
  [97,128,[4.7,5.1,4.3,4.3,4.7,4.7]],
  [129,160,[14.1,14.1,15.6,17.2,18.8,20.7]],
  [161,192,[4.7,5.1,5.5,5.5,5.5,5.9]],
  [193,224,[4.7,5.1,5.5,5.5,5.5,5.9]],
  [225,256,[4.7,5.1,4.7,4.7,4.7,4.3]],
  [257,288,[4.7,5.1,4.7,4.7,4.7,4.3]],
  [289,320,[13.3,12.9,12.9,12.1,11.7,9.4]],
  [321,352,[4.7,4.7,5.1,5.1,3.9,3.1]],
  [353,384,[0,0.8,0.8,0.8,0.8,0.8]],
  [385,416,[4.7,4.7,4.3,3.9,3.5,3.1]],
  [417,448,[19.5,16.8,14.5,12.1,9.4,5.1]],
  [449,480,[0,0,0,0.8,0.8,0.8]]
];

export const WANTED_POST_WC_ZONES = Object.freeze(Object.fromEntries(
  [1,2,3,4,5,6].map(setting=>[setting,Object.freeze(POST_WC_ROWS.map(([min,max,weights])=>Object.freeze({min,max,weight:weights[setting-1]})))])
));

export const WANTED_CHANCE_PROFILE = Object.freeze({
  baseGames:10,
  holdCapacity:8,
  freezeRule:'COUNTDOWN_STOPS_WHILE_CHANGED_HOLD_IS_PENDING_UNTIL_CONSUMED',
  postFailureCycle:'SETTING_SPECIFIC_VERIFIED_TABLE',
  inBandDistribution:'UNIFORM',
  hardMaxGame:480,
  source:'VERIFIED_PUBLIC_ANALYSIS'
});

function drawWeightedZone(rows,rng) {
  const eligible=rows.filter(row=>row.weight>0);
  const total=eligible.reduce((sum,row)=>sum+row.weight,0);
  let value=rng.next()*total;
  for(const row of eligible){value-=row.weight;if(value<0)return {...row};}
  return {...eligible[eligible.length-1]};
}

function targetFromZone(zone,rng,cycle){
  const width=zone.max-zone.min+1;
  const game=zone.min+Math.floor(rng.next()*width);
  return {zone,game:Math.min(480,game),cycle,distribution:'VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND',hardMaxGame:480};
}

export function drawWantedInitialZone(rng){return drawWeightedZone(WANTED_INITIAL_ZONES,rng);}
export function drawWantedInitialTarget(rng){return targetFromZone(drawWeightedZone(WANTED_INITIAL_ZONES,rng),rng,'INITIAL');}
export function drawWantedPostWcTarget(setting,rng){const s=Math.min(6,Math.max(1,Number(setting)||1));return targetFromZone(drawWeightedZone(WANTED_POST_WC_ZONES[s],rng),rng,'POST_WC_FAILURE');}
