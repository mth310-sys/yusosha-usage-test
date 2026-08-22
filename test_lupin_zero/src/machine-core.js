import { createMachineState, reduceMachine, KernelPhase } from './machine-kernel.js';

export const MachineState = KernelPhase;

export class MachineCore extends EventTarget {
  constructor({ credit = 50, maxBet = 3 } = {}) {
    super();
    this.kernelState = createMachineState({ credit, maxBet });
  }

  snapshot() {
    return Object.freeze({
      credit: this.kernelState.credit,
      bet: this.kernelState.bet,
      state: this.kernelState.phase,
      stopped: [...this.kernelState.stopped],
      spinId: this.kernelState.spinId,
      mode: this.kernelState.mode,
      modeGamesRemaining: this.kernelState.modeGamesRemaining,
      modeEvidenceStatus: this.kernelState.modeEvidenceStatus,
      modeResult: this.kernelState.modeResult,
      modeResultEvidenceStatus: this.kernelState.modeResultEvidenceStatus,
      lastSettledRole: this.kernelState.lastSettledRole,
      lastPayout: this.kernelState.lastPayout,
      mbFollowupGamesRemaining: this.kernelState.mbFollowupGamesRemaining,
      normalGamesSinceWantedReset: this.kernelState.normalGamesSinceWantedReset,
      wantedWindow: this.kernelState.wantedWindow ? { ...this.kernelState.wantedWindow } : null,
      wantedWindowContext: this.kernelState.wantedWindowContext,
      wantedTriggerGame: this.kernelState.wantedTriggerGame,
      wantedTriggerEvidenceStatus: this.kernelState.wantedTriggerEvidenceStatus,
      raiunPoints: this.kernelState.raiunPoints,
      raiunHighGamesRemaining: this.kernelState.raiunHighGamesRemaining,
      raiunHighRank: this.kernelState.raiunHighRank,
      raiunHighLastResult: this.kernelState.raiunHighLastResult ? { ...this.kernelState.raiunHighLastResult } : null
    });
  }

  emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail: { ...detail, snapshot: this.snapshot() } }));
  }

  apply(command) {
    const reduced = reduceMachine(this.kernelState, command);
    if (!reduced.accepted) return false;
    this.kernelState = reduced.state;

    for (const event of reduced.events) {
      if (event.type === 'CHANGE') this.emit('change', { reason: event.reason });
      if (event.type === 'SPIN_START') this.emit('spin-start', { spinId: event.spinId });
      if (event.type === 'REEL_STOP') this.emit('reel-stop', { reelIndex: event.reelIndex, spinId: event.spinId, complete: event.complete });
      if (event.type === 'SPIN_END') this.emit('spin-end', { reelIndex: event.reelIndex, spinId: event.spinId, mode: event.mode });
      if (event.type === 'NORMAL_ROLE_SETTLED') this.emit('normal-role-settled', { role: event.role, creditDelta: event.creditDelta, replayAutoBet: event.replayAutoBet, mbFollowupGames: event.mbFollowupGames, evidenceStatus: event.evidenceStatus });
      if (event.type === 'MB_FOLLOWUP_GAME_SETTLED') this.emit('mb-followup-game-settled', { creditDelta: event.creditDelta, remaining: event.remaining, evidenceStatus: event.evidenceStatus });
      if (event.type === 'WANTED_WINDOW_CONFIGURED') this.emit('wanted-window-configured', { window: event.window, triggerGame: event.triggerGame, context: event.context });
      if (event.type === 'NORMAL_PROGRESSION_ADVANCED') this.emit('normal-progression-advanced', { games: event.games });
      if (event.type === 'RAIUN_POINTS_SET') this.emit('raiun-points-set', { points: event.points, evidenceStatus: event.evidenceStatus });
      if (event.type === 'RAIUN_POINTS_ADDED') this.emit('raiun-points-added', { from: event.from, points: event.points, to: event.to, evidenceStatus: event.evidenceStatus });
      if (event.type === 'RAIUN_COUNTER_RESET') this.emit('raiun-counter-reset', { points: event.points, rank: event.rank, evidenceStatus: event.evidenceStatus });
      if (event.type === 'RAIUN_HIGH_RANK_SET') this.emit('raiun-high-rank-set', { rank: event.rank, evidenceStatus: event.evidenceStatus });
      if (event.type === 'RAIUN_HIGH_ENTER') this.emit('raiun-high-enter', { games: event.games, points: event.points, rank: event.rank });
      if (event.type === 'RAIUN_HIGH_GAME_RESOLVED') this.emit('raiun-high-game-resolved', { rank: event.rank, hit: event.hit, remaining: event.remaining, resolution: event.resolution });
      if (event.type === 'RAIUN_HIGH_EXHAUSTED') this.emit('raiun-high-exhausted', { rank: event.rank, redUpgradeStatus: event.redUpgradeStatus });
      if (event.type === 'MODE_ENTER') this.emit('mode-enter', { mode: event.mode, games: event.games, evidenceStatus: event.evidenceStatus, sourceWindow: event.sourceWindow ?? null });
      if (event.type === 'MODE_EXIT') this.emit('mode-exit', { from: event.from, to: event.to });
      if (event.type === 'MODE_GAME_ADVANCED') this.emit('mode-game-advanced', { mode: event.mode, remaining: event.remaining });
      if (event.type === 'MODE_WINDOW_EXHAUSTED') this.emit('mode-window-exhausted', { mode: event.mode });
      if (event.type === 'CHANCE_ZONE_SUCCESS') this.emit('chance-zone-success', { mode: event.mode, successPresentation: event.successPresentation, pendingDestination: event.pendingDestination, destinationSplitStatus: event.destinationSplitStatus, evidenceStatus: event.evidenceStatus });
    }
    return true;
  }

  betOne() { return this.apply({ type: 'BET_ONE' }); }
  maxBetNow() { return this.apply({ type: 'MAX_BET' }); }
  start() { return this.apply({ type: 'START' }); }
  stop(reelIndex) { return this.apply({ type: 'STOP_REEL', reelIndex }); }

  settleNormalRole(settlement) {
    if (!settlement?.accepted) return false;
    return this.apply({ type: 'SETTLE_NORMAL_ROLE', role: settlement.role, creditDelta: settlement.creditDelta, replayAutoBet: settlement.replayAutoBet, mbFollowupGames: settlement.mbFollowupGames, evidenceStatus: settlement.evidenceStatus });
  }

  settleMbFollowupGame(settlement) {
    if (!settlement?.accepted) return false;
    return this.apply({ type: 'SETTLE_MB_FOLLOWUP_GAME', creditDelta: settlement.creditDelta, evidenceStatus: settlement.evidenceStatus });
  }

  configureWantedWindow(selection) {
    if (!selection?.window) return false;
    return this.apply({ type: 'CONFIGURE_WANTED_WINDOW', window: selection.window, triggerGame: selection.productionTriggerGame, context: selection.context, evidenceStatus: selection.productionTriggerEvidenceStatus });
  }

  advanceNormalProgression() { return this.apply({ type: 'ADVANCE_NORMAL_PROGRESSION' }); }
  setRaiunPoints(points, evidenceStatus = 'UNRESOLVED') { return this.apply({ type: 'SET_RAIUN_POINTS', points, evidenceStatus }); }
  addRaiunPoints(points, evidenceStatus = 'UNRESOLVED') { return this.apply({ type: 'ADD_RAIUN_POINTS', points, evidenceStatus }); }
  resolveRaiunHighGame(resolution) { return this.apply({ type: 'RESOLVE_RAIUN_HIGH_GAME', resolution }); }
  resetRaiunCounter(points, evidenceStatus = 'UNRESOLVED') { return this.apply({ type: 'RESET_RAIUN_COUNTER', points, evidenceStatus }); }
  setRaiunHighRank(rank, evidenceStatus = 'UNRESOLVED') { return this.apply({ type: 'SET_RAIUN_HIGH_RANK', rank, evidenceStatus }); }
  exitWantedChance() { return this.apply({ type: 'EXIT_WANTED_CHANCE' }); }
  enterMode(mode, games, evidenceStatus = 'UNRESOLVED') { return this.apply({ type: 'ENTER_MODE', mode, games, evidenceStatus }); }
  advanceModeGame() { return this.apply({ type: 'ADVANCE_MODE_GAME' }); }
  resolveChanceZoneOddAlignment() { return this.apply({ type: 'CHANCE_ZONE_ODD_ALIGNED' }); }
}
