import { MACHINE_EVENTS, machineEvent } from './machine-event-contract.js';
import { MachineSurfaceState } from './machine-surface-state.js';

export const PRESENTATION_CUES = Object.freeze({
  RESEARCH_REVEAL: 'RESEARCH_REVEAL',
  RESEARCH_RESET: 'RESEARCH_RESET'
});

export class PresentationOrchestrator {
  constructor({ machineRoot, mechanism, lcdCue = () => {}, surfaceState = new MachineSurfaceState() } = {}) {
    if (!(machineRoot instanceof Element)) throw new TypeError('machineRoot Element is required');
    if (!mechanism || typeof mechanism.apply !== 'function') throw new TypeError('mechanism controller is required');
    this.machineRoot = machineRoot;
    this.mechanism = mechanism;
    this.lcdCue = lcdCue;
    this.surfaceState = surfaceState;
    this.trace = [];
  }

  applyEvent(event) {
    this.trace.push(event);
    const surface = this.surfaceState.apply(event);

    if (event.type === MACHINE_EVENTS.MECHANISM_CUE) {
      this.mechanism.apply(event.detail.cue);
    }
    if (event.type === MACHINE_EVENTS.LED_CUE) {
      if (event.detail.side === 'LEFT') this.machineRoot.dataset.leftLed = String(event.detail.cue).toLowerCase();
      if (event.detail.side === 'RIGHT') this.machineRoot.dataset.rightLed = String(event.detail.cue).toLowerCase();
    }
    if (event.type === MACHINE_EVENTS.LCD_CUE) {
      this.lcdCue(event.detail.cue, event.detail);
    }

    return surface;
  }

  runCue(cue) {
    if (cue === PRESENTATION_CUES.RESEARCH_REVEAL) {
      return Object.freeze([
        this.applyEvent(machineEvent(MACHINE_EVENTS.LED_CUE, { side: 'LEFT', cue: 'REVEAL' })),
        this.applyEvent(machineEvent(MACHINE_EVENTS.LED_CUE, { side: 'RIGHT', cue: 'REVEAL' })),
        this.applyEvent(machineEvent(MACHINE_EVENTS.MECHANISM_CUE, { cue: 'REVEAL' })),
        this.applyEvent(machineEvent(MACHINE_EVENTS.LCD_CUE, { cue: 'RESEARCH_REVEAL' }))
      ]);
    }
    if (cue === PRESENTATION_CUES.RESEARCH_RESET) {
      return Object.freeze([
        this.applyEvent(machineEvent(MACHINE_EVENTS.LED_CUE, { side: 'LEFT', cue: 'IDLE' })),
        this.applyEvent(machineEvent(MACHINE_EVENTS.LED_CUE, { side: 'RIGHT', cue: 'IDLE' })),
        this.applyEvent(machineEvent(MACHINE_EVENTS.MECHANISM_CUE, { cue: 'CLOSED' })),
        this.applyEvent(machineEvent(MACHINE_EVENTS.LCD_CUE, { cue: 'RESEARCH_RESET' }))
      ]);
    }
    throw new Error(`Unknown presentation cue: ${cue}`);
  }

  snapshot() {
    return Object.freeze({
      surface: this.surfaceState.snapshot(),
      mechanism: this.mechanism.snapshot(),
      traceLength: this.trace.length
    });
  }
}

export const PRESENTATION_ORCHESTRATOR_POLICY = Object.freeze({
  researchCueIsVerifiedAutomaticBehavior: false,
  automaticTriggerImplemented: false,
  note: 'Research cue coordinates verified/observed surfaces without claiming the real-machine automatic trigger relationship.'
});
