import { applyTreasureAwardToGoldChanceThreshold } from './treasure-threshold.js?v=step6z-threshold1';

export const ORE_NO_NA_WA_PROFILE=Object.freeze({
  denominator:554.6,
  awardPoints:1000000,
  awardMode:'ADDITIVE_TREASURE_AWARD',
  durationGames:1,
  destination:'GOLD_CHANCE_ON_1M_THRESHOLD',
  sourceLevel:'PUBLISHED_ANALYSIS_TEXT',
  sourceNote:'Published analysis describes a one-game Treasure add-on that always awards 100万T; existing Treasure must therefore be preserved as carryover beyond the 100万 display threshold.'
});

export function rollOreNoNaWa(rng){return rng.next()<1/ORE_NO_NA_WA_PROFILE.denominator;}

export function applyOreNoNaWaAward(gt){
  return applyTreasureAwardToGoldChanceThreshold(gt,ORE_NO_NA_WA_PROFILE.awardPoints,{eventPrefix:'ORE_NO_NA_WA'});
}
