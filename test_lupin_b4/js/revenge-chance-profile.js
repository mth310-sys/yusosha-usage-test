// Step 6M: Revenge Chance verified structure.
// Verified: 10G, may occur after Treasure Battle loss or LUPIN BONUS failure,
// success routes to LUPIN BONUS or ART. Character-symbol collection can restore.
// Entry rate, per-game success rate and LB/ART split are not verified.
export const REVENGE_CHANCE_PROFILE = Object.freeze({
  games:10,
  entrySources:['TREASURE_BATTLE_LOSE','LUPIN_BONUS_FAIL'],
  successDestinations:['LUPIN_BONUS','GOLDEN_TIME'],
  verifiedMechanics:['COLLECT_FOUR_CHARACTERS','TYPEWRITER_REVENGE_PATTERNS'],
  entryRate:null,
  perGameSuccessRate:null,
  successDestinationSplit:null,
  source:'VERIFIED_STRUCTURE_PARTIAL_NO_RATE_INVENTION'
});
