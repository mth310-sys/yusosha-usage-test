export const MACHINE_EVENTS = Object.freeze({
  BET_ACCEPTED: 'machine:bet-accepted',
  LEVER_ON: 'machine:lever-on',
  ROLE_RESOLVED: 'machine:role-resolved',
  REELS_SPIN_START: 'machine:reels-spin-start',
  STOP_BUTTON_ARMED: 'machine:stop-button-armed',
  STOP_BUTTON_PRESSED: 'machine:stop-button-pressed',
  REEL_STOPPED: 'machine:reel-stopped',
  PAYOUT_COMMITTED: 'machine:payout-committed',
  GAME_COMMITTED: 'machine:game-committed',
  LED_CUE: 'presentation:led-cue',
  MECHANISM_CUE: 'presentation:mechanism-cue',
  LCD_CUE: 'presentation:lcd-cue',
  AUDIO_CUE: 'presentation:audio-cue'
});

export const MACHINE_SURFACES = Object.freeze({
  PHYSICAL_REELS: 'PHYSICAL_REELS',
  LIQUID_LCD_REELS: 'LIQUID_LCD_REELS',
  MAIN_LCD: 'MAIN_LCD',
  LEFT_FRAME_LED: 'LEFT_FRAME_LED',
  RIGHT_FRAME_LED: 'RIGHT_FRAME_LED',
  TOP_MECHANISM: 'TOP_MECHANISM',
  STOP_BUTTONS: 'STOP_BUTTONS',
  START_LEVER: 'START_LEVER',
  SPEAKERS: 'SPEAKERS'
});

export function machineEvent(type, detail = {}) {
  if (!Object.values(MACHINE_EVENTS).includes(type)) {
    throw new Error(`Unknown machine event: ${type}`);
  }
  return Object.freeze({ type, detail: Object.freeze({ ...detail }) });
}
