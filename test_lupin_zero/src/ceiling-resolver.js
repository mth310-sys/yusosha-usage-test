import { CEILING_SPEC, getCeilingSelection } from './ceiling-spec.js';

export function selectCeilingGame(randomSource, setting = 1) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
  const table = getCeilingSelection(setting);
  if (!table) return null;
  const draw = randomSource.nextFloat() * 100;
  const selectedGame = draw < table[499] ? 499 : 999;
  return Object.freeze({
    setting,
    draw,
    selectedGame,
    distribution: Object.freeze({ ...table }),
    evidenceStatus: CEILING_SPEC.evidence.ceilingSelectionBySetting
  });
}

export function resolveCeilingArrival({ gamesSinceReset, selectedGame, currentMode }) {
  if (!Number.isInteger(gamesSinceReset) || gamesSinceReset < 0) throw new RangeError('gamesSinceReset must be a non-negative integer');
  if (![499, 999].includes(selectedGame)) throw new RangeError('selectedGame must be 499 or 999');
  if (gamesSinceReset < selectedGame) return Object.freeze({ reached: false, gamesSinceReset, selectedGame });
  const inRaiunMode = currentMode === 'RAIUN_MODE';
  return Object.freeze({
    reached: true,
    gamesSinceReset,
    selectedGame,
    route: inRaiunMode ? 'SHIN_RAIUN_MODE' : 'LUPIN_BONUS',
    goldenTimeGuaranteed: inRaiunMode,
    evidenceStatus: inRaiunMode ? CEILING_SPEC.evidence.raiunCeilingOverride : CEILING_SPEC.evidence.normalCeilingDestination
  });
}
