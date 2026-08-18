// Step 6L: verified Treasure Battle presentation structure.
// Outcome probability remains driven by the verified treasure continuation table.
// Opponent / chance-up appearance distributions are not verified and are NOT auto-drawn.
export const TREASURE_BATTLE_PROFILE = Object.freeze({
  totalGames: 4,
  opponents: Object.freeze([
    { key:'ZENIGATA', label:'執念の銭形', publishedExpectationPct:71.98 },
    { key:'ZENIGATA_ROBO', label:'銭形ロボ', publishedExpectationPct:76.03 },
    { key:'LUPIN_GANG_ROBO', label:'ルパン一味 / 一味討伐用ロボ', publishedExpectationPct:81.80 },
    { key:'MASS_PRODUCED', label:'量産型銭形ロボ', publishedExpectationPct:91.86 },
    { key:'FUJIKO', label:'峰不二子', publishedExpectationPct:null, premium:true }
  ]),
  phases: Object.freeze({
    1: Object.freeze({ key:'FIRST_ATTACK', note:'ルパン先制なら勝利確定。先制発生率は未確認。' }),
    2: Object.freeze({ key:'CHANCE_DISPLAY', note:'CHANCE表示で期待度アップ。発生率は未確認。' }),
    3: Object.freeze({ key:'CUT_IN', note:'ルパンカットイン 青＜緑＜赤。色振り分けは未確認。' }),
    4: Object.freeze({ key:'STAND_UP', note:'立ち上がり背景 青＜緑＜赤。ここで勝敗を開示。' })
  }),
  opponentDistribution: null,
  chanceUpDistribution: null,
  source:'VERIFIED_4G_PRESENTATION_STRUCTURE_PARTIAL'
});

export function getBattlePhase(game){
  return TREASURE_BATTLE_PROFILE.phases[Number(game)] ?? null;
}
