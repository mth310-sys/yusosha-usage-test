// Phase 0: only previously verified public-analysis values are fixed here.
// Missing roles remain UNKNOWN rather than being invented.
export const SETTING_PROFILES = Object.freeze({
  1: Object.freeze({ replay: 7.30, mb: 27.31, threeCoin: 99.99, nineCoin: 25.28, tenCoin: 26.27 }),
  6: Object.freeze({ replay: 7.30, mb: 27.31, threeCoin: 99.99, nineCoin: 26.11, tenCoin: 21.94 })
});

export function getSettingProfile(setting) {
  return SETTING_PROFILES[setting] ?? SETTING_PROFILES[1];
}
