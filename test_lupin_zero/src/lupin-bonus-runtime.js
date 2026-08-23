import { GameMode } from './game-flow-spec.js';
import { createLupinBonusProfile, resolveLupinBonusOutcome } from './lupin-bonus-resolver.js';
import { createLupinBonusBattleState, advanceLupinBonusBattle } from './lupin-bonus-battle-resolver.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x2016080f);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let hiddenOutcome = null;
let battleState = null;
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
  battleState = null;
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
  battleState = null;

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
  const beforeRemaining = s.modeGamesRemaining ?? 0;
  const remaining = Math.max(0, beforeRemaining - 1);
  core.kernelState = Object.freeze({
    ...core.kernelState,
    credit: s.credit + profile.payoutCoinsPerGame,
    lastSettledRole: 'LUPIN_BONUS_GAME',
    lastPayout: profile.payoutCoinsPerGame,
    modeGamesRemaining: remaining
  });
  core.emit('lupin-bonus-game-settled', { remaining, payoutCoins: profile.payoutCoinsPerGame, evidenceStatus: profile.evidenceStatus });

  if (remaining === profile.finalBattleGames && !battleState) {
    battleState = createLupinBonusBattleState(hiddenOutcome);
    core.emit('lupin-bonus-battle-enter', {
      games: battleState.totalGames,
      opponent: 'ZENIGATA',
      structure: 'ZENIGATA_ATTACK_POINTS_AND_AVOIDANCE',
      evidenceStatus: battleState.evidenceStatus
    });
    if (message) message.textContent = '銭形バトル — 攻撃を回避せよ';
  } else if (beforeRemaining <= profile.finalBattleGames && battleState) {
    battleState = advanceLupinBonusBattle(battleState);
    core.emit('lupin-bonus-battle-step', {
      step: battleState.step,
      remaining: battleState.gamesRemaining,
      phase: battleState.phase,
      presentationCue: battleState.presentationCue,
      avoidanceResolved: battleState.avoidanceResolved,
      revealed: battleState.revealed,
      result: battleState.result,
      destination: battleState.destination,
      evidenceStatus: battleState.evidenceStatus
    });
    if (message && !battleState.revealed) message.textContent = `銭形の攻撃 — 回避せよ ${battleState.step}/5`;
    if (message && battleState.revealed) message.textContent = battleState.result === 'WIN' ? '攻撃回避 — 銭形撃破!' : '回避失敗 — 銭形バトル敗北';
  } else if (remaining > 0 && message) {
    message.textContent = `LUPIN BONUS ${remaining}G`;
  }

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
app.getLupinBonusBattleState = () => battleState;
