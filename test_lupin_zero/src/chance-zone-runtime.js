import { GameMode } from './game-flow-spec.js';
import { SeededRandomSource } from './random-source.js';
import { resolveChanceZoneStage, resolveChanceZoneOutcome, CHANCE_ZONE_DETAIL_POLICY } from './chance-zone-detail-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');
const core = app.core;
const setting = app.machineSetting ?? 1;
const stageRandom = new SeededRandomSource(0x20160816);
const outcomeRandom = new SeededRandomSource(0x20160817);
const message = document.querySelector('#message');
let current = null;

function isCz(mode) {
  return mode === GameMode.ODOROBO_ZONE || mode === GameMode.FUJIKO_ZONE;
}

function configure(snapshot = core.snapshot()) {
  if (!isCz(snapshot.mode)) return null;
  const stage = resolveChanceZoneStage(stageRandom, setting);
  const outcome = resolveChanceZoneOutcome(outcomeRandom, snapshot.mode, setting);
  current = Object.freeze({ mode: snapshot.mode, stage, outcome, initialGames: snapshot.modeGamesRemaining });
  app.chanceZoneDetailState = current;
  core.emit('chance-zone-configured', {
    mode: current.mode,
    stage: stage.stage,
    expectationPercent: outcome.expectationPercent,
    games: current.initialGames,
    evidenceStatus: stage.evidenceStatus
  });
  if (message) message.textContent = `${current.mode === GameMode.FUJIKO_ZONE ? '不二子ゾーン' : '大泥棒ゾーン'} STAGE ${stage.stage}`;
  return current;
}

function settleAtWindowEnd(mode) {
  if (!current || current.mode !== mode || !isCz(mode)) return false;
  const outcome = current.outcome;
  const stage = current.stage;
  current = null;
  app.chanceZoneDetailState = null;

  if (outcome.hit) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      modeGamesRemaining: 0,
      modeResult: 'PENDING_BONUS_OR_ART',
      modeResultEvidenceStatus: outcome.evidenceStatus
    });
    core.emit('chance-zone-success', {
      mode,
      successPresentation: outcome.successPresentation,
      pendingDestination: 'PENDING_BONUS_OR_ART',
      destinationSplitStatus: 'RESOLVED_BY_NEXT_INITIAL_HIT_RESERVATION',
      stage: stage.stage,
      expectationPercent: outcome.expectationPercent,
      evidenceStatus: outcome.evidenceStatus
    });
    if (message) message.textContent = '奇数揃い — SUCCESS';
    return true;
  }

  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.NORMAL,
    modeGamesRemaining: null,
    modeEvidenceStatus: 'VERIFIED_LINK',
    modeResult: null,
    modeResultEvidenceStatus: null
  });
  core.emit('chance-zone-failed', {
    from: mode,
    stage: stage.stage,
    expectationPercent: outcome.expectationPercent,
    evidenceStatus: outcome.evidenceStatus
  });
  core.emit('mode-exit', { from: mode, to: GameMode.NORMAL });
  if (message) message.textContent = 'CHANCE ZONE END';
  return true;
}

core.addEventListener('mode-enter', (event) => {
  if (isCz(event.detail.mode)) configure(event.detail.snapshot);
});

core.addEventListener('mode-window-exhausted', (event) => {
  if (isCz(event.detail.mode)) settleAtWindowEnd(event.detail.mode);
});

core.addEventListener('chance-zone-success', () => {
  current = null;
  app.chanceZoneDetailState = null;
});

app.chanceZoneStageRandom = stageRandom;
app.chanceZoneOutcomeRandom = outcomeRandom;
app.chanceZoneDetailPolicy = CHANCE_ZONE_DETAIL_POLICY;
app.configureChanceZoneDetail = configure;
