export const RESEARCH_SYMBOLS = Object.freeze(['7', 'BAR', 'L', 'R', '★', '◆', '●']);

export const RESEARCH_REEL_PROFILE = Object.freeze({
  mode: 'RESEARCH_ONLY',
  source: 'PLACEHOLDER',
  realMachineStrip: 'UNVERIFIED',
  probabilityModel: 'DISCONNECTED'
});

export class ResearchReelEngine {
  constructor(symbols = RESEARCH_SYMBOLS) {
    this.symbols = [...symbols];
    this.positions = [0, 1, 2];
    this.spinId = 0;
  }

  start(spinId) {
    this.spinId = Number.isInteger(spinId) ? spinId : 0;
    return this.snapshot();
  }

  stop(reelIndex) {
    if (!Number.isInteger(reelIndex) || reelIndex < 0 || reelIndex > 2) return null;
    const position = (this.spinId + reelIndex * 2 + 1) % this.symbols.length;
    this.positions[reelIndex] = position;
    return Object.freeze({
      reelIndex,
      position,
      symbol: this.symbols[position],
      source: RESEARCH_REEL_PROFILE.source
    });
  }

  snapshot() {
    return Object.freeze({
      spinId: this.spinId,
      positions: [...this.positions],
      symbols: this.positions.map((position) => this.symbols[position]),
      profile: RESEARCH_REEL_PROFILE
    });
  }
}
