// Verified setting-confirmation hints from WANTED CHANCE activation games.
// IMPORTANT: these hints apply only to the cycle drawn after a WANTED CHANCE failure.
// Setting-change / LUPIN BONUS-end / ART-end initial cycles are explicitly excluded by published analysis.

export const WANTED_SETTING_HINT_PROFILE = Object.freeze({
  source:'CROSS_SOURCE_PUBLISHED_POST_WC_ACTIVATION_GAME_HINTS',
  cycle:'POST_WC_FAILURE',
  hints:Object.freeze([
    Object.freeze({min:353,max:384,meaning:'SETTING_2_OR_HIGHER_CONFIRMED'}),
    Object.freeze({min:449,max:480,meaning:'SETTING_4_OR_HIGHER_CONFIRMED'})
  ]),
  excludedCycles:Object.freeze(['INITIAL','SETTING_CHANGE','LUPIN_BONUS_END','ART_END'])
});

export function getWantedSettingHintForTarget(targetGame,cycle){
  const game=Number(targetGame);
  if(cycle!==WANTED_SETTING_HINT_PROFILE.cycle||!Number.isInteger(game))return null;
  const row=WANTED_SETTING_HINT_PROFILE.hints.find(h=>game>=h.min&&game<=h.max);
  return row?{...row,targetGame:game,source:WANTED_SETTING_HINT_PROFILE.source}:null;
}
