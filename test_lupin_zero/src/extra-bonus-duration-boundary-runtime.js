import { createExtraBonusProfile, EXTRA_BONUS_SPEC } from './extra-bonus-resolver.js';
import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const originalEnterExtraBonus = core.enterExtraBonus.bind(core);

export const EXTRA_BONUS_DURATION_RUNTIME_POLICY = Object.freeze({
  trigger: 'TREASURE_REACHES_1000000',
  minimumAddedGames: EXTRA_BONUS_SPEC.minimumAddedGames,
  averageAddedGames: EXTRA_BONUS_SPEC.averageAddedGames,
  exactAddedGameDistribution: null,
  automaticDurationRollAllowed: false,
  unresolvedProductionBehavior: 'HOLD_AT_BOUNDARY',
  manualVerifiedDurationRoute: true
});

function holdUnresolvedDuration(profile) {
  const snapshot = core.snapshot();
  if (snapshot.mode !== GameMode.GOLDEN_TIME || snapshot.goldenTimeTreasure < 1000000) return false;
  core.kernelState = Object.freeze({
    ...core.kernelState,
    modeResult: 'PENDING_EXTRA_BONUS_DURATION',
    modeResultEvidenceStatus: 'UNRESOLVED'
  });
  core.emit('extra-bonus-duration-unresolved', {
    absorbedGoldenTimeGames: profile?.absorbedGoldenTimeGames ?? snapshot.modeGamesRemaining ?? 0,
    minimumAddedGames: EXTRA_BONUS_SPEC.minimumAddedGames,
    minimumGames: profile?.minimumGames ?? null,
    averageAddedGames: EXTRA_BONUS_SPEC.averageAddedGames,
    addedGameDistribution: null,
    automaticDurationRollAllowed: false,
    evidenceStatus: 'UNRESOLVED'
  });

  const stateValue = document.querySelector('#stateValue');
  const phaseBadge = document.querySelector('#phaseBadge');
  const message = document.querySelector('#message');
  if (stateValue) stateValue.textContent = 'EXTRA BONUS / G数未解決';
  if (phaseBadge) phaseBadge.textContent = 'EXTRA BONUS';
  if (message) message.textContent = `100万T — EXTRA BONUS（最低+${EXTRA_BONUS_SPEC.minimumAddedGames}G / 振分未解決）`;
  document.querySelectorAll('#betBtn,#maxBetBtn,#startBtn,.stop').forEach((button) => { button.disabled = true; });
  return true;
}

core.enterExtraBonus = (profile) => {
  if (profile?.durationResolved === true && Number.isInteger(profile.games) && profile.games > 0) {
    return originalEnterExtraBonus(profile);
  }
  holdUnresolvedDuration(profile);
  return false;
};

function enterExtraBonusWithVerifiedAddedGames(addedGames) {
  const snapshot = core.snapshot();
  if (snapshot.mode !== GameMode.GOLDEN_TIME || snapshot.goldenTimeTreasure < 1000000) return null;
  const profile = createExtraBonusProfile(snapshot.modeGamesRemaining ?? 0, addedGames);
  if (!profile.durationResolved) return null;
  return originalEnterExtraBonus(profile) ? profile : null;
}

app.enterExtraBonusWithVerifiedAddedGames = enterExtraBonusWithVerifiedAddedGames;
app.extraBonusDurationPolicy = EXTRA_BONUS_DURATION_RUNTIME_POLICY;
