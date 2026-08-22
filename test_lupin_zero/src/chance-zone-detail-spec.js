export const CHANCE_ZONE_DETAIL_SPEC = Object.freeze({
  sharedDurationSelectionBySetting: Object.freeze({
    1: Object.freeze({ tenGamesPercent: 62.50, twentyGamesPercent: 37.50 }),
    2: Object.freeze({ tenGamesPercent: 62.50, twentyGamesPercent: 37.50 }),
    3: Object.freeze({ tenGamesPercent: 60.94, twentyGamesPercent: 39.06 }),
    4: Object.freeze({ tenGamesPercent: 50.00, twentyGamesPercent: 50.00 }),
    5: Object.freeze({ tenGamesPercent: 50.00, twentyGamesPercent: 50.00 }),
    6: Object.freeze({ tenGamesPercent: 47.66, twentyGamesPercent: 52.34 })
  }),
  stageScenarioSelectionBySetting: Object.freeze({
    1: Object.freeze({ A: 71.88, B: 23.44, C: 3.13, D: 1.56 }),
    2: Object.freeze({ A: 79.69, B: 15.63, C: 3.13, D: 1.56 }),
    3: Object.freeze({ A: 69.92, B: 25.39, C: 3.13, D: 1.56 }),
    4: Object.freeze({ A: 64.45, B: 29.30, C: 3.13, D: 3.13 }),
    5: Object.freeze({ A: 53.52, B: 37.11, C: 6.25, D: 3.13 }),
    6: Object.freeze({ A: 51.56, B: 39.06, C: 6.25, D: 3.13 })
  }),
  zones: Object.freeze({
    ODOROBO_ZONE: Object.freeze({ games: Object.freeze([10, 20]), successPresentation: 'ODD_LCD_SYMBOL_ALIGNED', expectationPercent: Object.freeze({ min: 39.6, max: 43.2 }) }),
    FUJIKO_ZONE: Object.freeze({ games: Object.freeze([10, 20]), successPresentation: 'ODD_LCD_SYMBOL_ALIGNED', expectationPercent: Object.freeze({ min: 58.8, max: 63.2 }) })
  }),
  stageScenarioDetail: Object.freeze({
    status: 'UNRESOLVED',
    note: 'Published analysis provides A-D scenario selection percentages but explicitly marks the detailed scenario behavior as under investigation.'
  }),
  evidence: Object.freeze({
    durationSelection: 'PUBLISHED_ANALYSIS',
    stageScenarioSelection: 'PUBLISHED_ANALYSIS',
    stageScenarioDetail: 'UNRESOLVED'
  }),
  policy: Object.freeze({
    inferStageScenarioBehavior: false,
    roundPublishedPercentagesForRuntime: false,
    derivePerGameSuccessProbabilityFromZoneExpectation: false
  })
});

export function getChanceZoneDurationSelection(setting) {
  return CHANCE_ZONE_DETAIL_SPEC.sharedDurationSelectionBySetting[setting] ?? null;
}

export function getChanceZoneScenarioSelection(setting) {
  return CHANCE_ZONE_DETAIL_SPEC.stageScenarioSelectionBySetting[setting] ?? null;
}
