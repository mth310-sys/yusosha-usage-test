// Step 6C: verified LUPIN RUSH aggregate values.
// Published analysis confirms 4G duration, four RUSH presentations, their average awards,
// and an initial-hit overall average of 34.2万 Treasure.
// Exact RUSH selection rates and per-game award distributions are not verified here.
export const LUPIN_RUSH_PROFILE = Object.freeze({
  games: 4,
  initialOverallAverageTreasure: 342000,
  selectionDistribution: 'UNVERIFIED',
  perGameAwardDistribution: 'UNVERIFIED',
  types: Object.freeze({
    WALSER: Object.freeze({label:'WALSER RUSH', averageTreasure:240000}),
    SILHOUETTE: Object.freeze({label:'SILHOUETTE RUSH', averageTreasure:400000}),
    REVOLVER_VISION: Object.freeze({label:'REVOLVER VISION RUSH', averageTreasure:640000}),
    ATTACK_VISION: Object.freeze({label:'ATTACK VISION', averageTreasure:1000000})
  })
});

export function getLupinRushType(type){
  return LUPIN_RUSH_PROFILE.types[type] ?? null;
}
