import { MACHINE_EVENTS } from './machine-event-contract.js';

export class MachineSurfaceState {
  constructor() {
    this.reelsSpinning = false;
    this.stopButtonsArmed = false;
    this.stopButtonsPressed = [false, false, false];
    this.startLeverActive = false;
    this.leftFrameLed = 'IDLE';
    this.rightFrameLed = 'IDLE';
    this.topMechanism = 'CLOSED';
    this.mainLcdCue = null;
    this.audioCue = null;
  }

  snapshot() {
    return Object.freeze({
      reelsSpinning: this.reelsSpinning,
      stopButtonsArmed: this.stopButtonsArmed,
      stopButtonsPressed: [...this.stopButtonsPressed],
      startLeverActive: this.startLeverActive,
      leftFrameLed: this.leftFrameLed,
      rightFrameLed: this.rightFrameLed,
      topMechanism: this.topMechanism,
      mainLcdCue: this.mainLcdCue,
      audioCue: this.audioCue
    });
  }

  apply(event) {
    switch (event?.type) {
      case MACHINE_EVENTS.LEVER_ON:
        this.startLeverActive = true;
        this.stopButtonsPressed = [false, false, false];
        break;
      case MACHINE_EVENTS.REELS_SPIN_START:
        this.reelsSpinning = true;
        break;
      case MACHINE_EVENTS.STOP_BUTTON_ARMED:
        this.stopButtonsArmed = true;
        break;
      case MACHINE_EVENTS.STOP_BUTTON_PRESSED:
        this.stopButtonsPressed[event.detail.index] = true;
        break;
      case MACHINE_EVENTS.GAME_COMMITTED:
        this.reelsSpinning = false;
        this.stopButtonsArmed = false;
        this.startLeverActive = false;
        break;
      case MACHINE_EVENTS.LED_CUE:
        if (event.detail.side === 'LEFT') this.leftFrameLed = event.detail.cue;
        if (event.detail.side === 'RIGHT') this.rightFrameLed = event.detail.cue;
        break;
      case MACHINE_EVENTS.MECHANISM_CUE:
        this.topMechanism = event.detail.cue;
        break;
      case MACHINE_EVENTS.LCD_CUE:
        this.mainLcdCue = event.detail.cue;
        break;
      case MACHINE_EVENTS.AUDIO_CUE:
        this.audioCue = event.detail.cue;
        break;
      default:
        break;
    }
    return this.snapshot();
  }
}

export const MACHINE_SURFACE_POLICY = Object.freeze({
  defaultLedPatternIsVerifiedMachineBehavior: false,
  defaultMechanismMotionIsVerifiedMachineBehavior: false,
  automaticUnverifiedCuesEnabled: false,
  note: 'Surface state exists so verified real-machine cues can be connected later without coupling presentation to lottery logic.'
});
