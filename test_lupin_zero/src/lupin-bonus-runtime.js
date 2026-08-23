import { GameMode } from './game-flow-spec.js';
import { createLupinBonusProfile, resolveLupinBonusOutcome } from './lupin-bonus-resolver.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x2016080f);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let hiddenOutcome = null;
let bonusGameStarted = false;

function renderLupinBonus() {
  const s = core.snapshot();
  if (s.mode !== GameMode.LUPIN_BONUS) return;
  if (phaseBadge) phaseBadge.textContent = 'LUPIN BONUS';
  if (stateValue) {
    const remain = s.modeGamesRemaining ?? 0;
    stateValue.textContent = remain <= 5 ? `銭形バトル ${remain}G` : `LUPIN BONUS ${remain}G`;
  }
}

function enterLupinBonus(source = 'UNKNOWN') {
  const profile = createLupinBonusProfile();
  hiddenOutcome = resolveLupinBonusOutcome(random);
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.LUPIN_BONUS,
    modeGamesRemaining: profile.totalGames,
    modeEvidenceStatus: profile.evidenceStatus,
    modeResult: null,
    modeResultEvidenceStatus: null,
    goldenTimeTreasure: 0
  });
  core.emit('lupin-bonus-enter', { source, games: profile.totalGames, artExpectationPercent: profile.artExpectationPercent, evidenceStatus: profile.evidenceStatus });
  core.emit('mode-enter', { mode: GameMode.LUPIN_BONUS, games: profile.totalGames, evidenceStatus: profile.evidenceStatus });
  if (message) message.textContent = 'LUPIN BONUS';
  renderLupinBonus();
  return true;
}

function finishLupinBonus() {
  const profile = createLupinBonusProfile();
  const outcome = hiddenOutcome ?? resolveLupinBonusOutcome(random);
  hiddenOutcome = null;

  if (outcome.artHit) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      modeGamesRemaining: 0,
      modeResult: 'PENDING_GOLDEN_TIME',
      modeResultEvidenceStatus: outcome.evidenceStatus
    });
    core.emit('lupin-bonus-success', { destination: GameMode.GOLDEN_TIME, outcome, evidenceStatus: outcome.evidenceStatus });
    if (message) message.textContent = '銭形撃破 — GOLDEN TIME';
    if (typeof app.enterGoldenTime === 'function') app.enterGoldenTime();
    return true;
  }

  const revenge = typeof app.tryEnterBonusEndRevengeChance === 'function'
    ? app.tryEnterBonusEndRevengeChance()
    : Object.freeze({ entered: false, entry: null, outcome: null });

  core.emit('lupin-bonus-failed', {
    outcome,
    revengeChanceEntered: revenge.entered,
    revengeChanceEntryDenominator: profile.failureRevengeEntryDenominator,
    revengeChanceHitExpectationPercent: profile.failureRevengeHitExpectationPercent,
    evidenceStatus: outcome.evidenceStatus
  });

  if (revenge.entered) {
    if (message) message.textContent = 'REVENGE CHANCE';
    return true;
  }

  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.NORMAL,
    modeGamesRemaining: null,
    modeResult: null,
    modeResultEvidenceStatus: null
  });
  core.emit('mode-exit', { from: GameMode.LUPIN_BONUS, to: GameMode.NORMAL });
  if (message) message.textContent = 'LUPIN BONUS END';
  return true;
}

core.addEventListener('revenge-chance-success', () => {
  const s = core.snapshot();
  if (s.mode === GameMode.REVENGE_CHANCE && s.modeResult === 'PENDING_LUPIN_BONUS') enterLupinBonus('REVENGE_CHANCE');
});

core.addEventListener('spin-start', (event) => {
  bonusGameStarted = event.detail.snapshot.mode === GameMode.LUPIN_BONUS && !event.detail.snapshot.modeResult;
  if (bonusGameStarted) renderLupinBonus();
});

core.addEventListener('spin-end', (event) => {
  if (!bonusGameStarted || event.detail.snapshot.mode !== GameMode.LUPIN_BONUS) return;
  const profile = createLupinBonusProfile();
  const s = core.snapshot();
  const remaining = Math.max(0, (s.modeGamesRemaining ?? 0) - 1);
  core.kernelState = Object.freeze({
    ...core.kernelState,
    credit: s.credit + profile.payoutCoinsPerGame,
    lastSettledRole: 'LUPIN_BONUS_GAME',
    lastPayout: profile.payoutCoinsPerGame,
    modeGamesRemaining: remaining
  });
  core.emit('lupin-bonus-game-settled', { remaining, payoutCoins: profile.payoutCoinsPerGame, evidenceStatus: profile.evidenceStatus });
  if (remaining === profile.finalBattleGames && message) message.textContent = '銭形バトル';
  else if (remaining > 0 && message) message.textContent = `LUPIN BONUS ${remaining}G`;
  if (remaining === 0) finishLupinBonus();
  bonusGameStarted = false;
  renderLupinBonus();
});

core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === GameMode.LUPIN_BONUS) renderLupinBonus();
});

app.lupinBonusRandom = random;
app.enterLupinBonus = enterLupinBonus;
app.createLupinBonusProfile = createLupinBonusProfile;
