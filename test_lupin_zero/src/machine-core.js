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
      mbFollowupGamesRemaining: this.kernelState.mbFollowupGamesRemaining
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
      if (event.type === 'REEL_STOP') {
        this.emit('reel-stop', {
          reelIndex: event.reelIndex,
          spinId: event.spinId,
          complete: event.complete
        });
      }
      if (event.type === 'SPIN_END') {
        this.emit('spin-end', {
          reelIndex: event.reelIndex,
          spinId: event.spinId,
          mode: event.mode
        });
      }
      if (event.type === 'NORMAL_ROLE_SETTLED') {
        this.emit('normal-role-settled', {
          role: event.role,
          creditDelta: event.creditDelta,
          replayAutoBet: event.replayAutoBet,
          mbFollowupGames: event.mbFollowupGames,
          evidenceStatus: event.evidenceStatus
        });
      }
      if (event.type === 'MB_FOLLOWUP_GAME_SETTLED') {
        this.emit('mb-followup-game-settled', {
          creditDelta: event.creditDelta,
          remaining: event.remaining,
          evidenceStatus: event.evidenceStatus
        });
      }
      if (event.type === 'MODE_ENTER') {
        this.emit('mode-enter', {
          mode: event.mode,
          games: event.games,
          evidenceStatus: event.evidenceStatus
        });
      }
      if (event.type === 'MODE_GAME_ADVANCED') {
        this.emit('mode-game-advanced', {
          mode: event.mode,
          remaining: event.remaining
        });
      }
      if (event.type === 'MODE_WINDOW_EXHAUSTED') {
        this.emit('mode-window-exhausted', { mode: event.mode });
      }
      if (event.type === 'CHANCE_ZONE_SUCCESS') {
        this.emit('chance-zone-success', {
          mode: event.mode,
          successPresentation: event.successPresentation,
          pendingDestination: event.pendingDestination,
          destinationSplitStatus: event.destinationSplitStatus,
          evidenceStatus: event.evidenceStatus
        });
      }
    }
    return true;
  }

  betOne() {
    return this.apply({ type: 'BET_ONE' });
  }

  maxBetNow() {
    return this.apply({ type: 'MAX_BET' });
  }

  start() {
    return this.apply({ type: 'START' });
  }

  stop(reelIndex) {
    return this.apply({ type: 'STOP_REEL', reelIndex });
  }

  settleNormalRole(settlement) {
    if (!settlement?.accepted) return false;
    return this.apply({
      type: 'SETTLE_NORMAL_ROLE',
      role: settlement.role,
      creditDelta: settlement.creditDelta,
      replayAutoBet: settlement.replayAutoBet,
      mbFollowupGames: settlement.mbFollowupGames,
      evidenceStatus: settlement.evidenceStatus
    });
  }

  settleMbFollowupGame(settlement) {
    if (!settlement?.accepted) return false;
    return this.apply({
      type: 'SETTLE_MB_FOLLOWUP_GAME',
      creditDelta: settlement.creditDelta,
      evidenceStatus: settlement.evidenceStatus
    });
  }

  enterMode(mode, games, evidenceStatus = 'UNRESOLVED') {
    return this.apply({ type: 'ENTER_MODE', mode, games, evidenceStatus });
  }

  advanceModeGame() {
    return this.apply({ type: 'ADVANCE_MODE_GAME' });
  }

  resolveChanceZoneOddAlignment() {
    return this.apply({ type: 'CHANCE_ZONE_ODD_ALIGNED' });
  }
}
