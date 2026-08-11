import { SOURCE_STATUS } from './config.js';

const VERIFIED_COMMON = Object.freeze({ replay: 7.30, mb: 27.31, coin3: 99.99 });

export const SETTING_PROFILES = Object.freeze({
  1:{ setting:1, roles:{...VERIFIED_COMMON, coin9:25.28, coin10:26.27}, source:SOURCE_STATUS.VERIFIED },
  2:{ setting:2, roles:{...VERIFIED_COMMON, coin9:25.46, coin10:25.18}, source:SOURCE_STATUS.VERIFIED },
  3:{ setting:3, roles:{...VERIFIED_COMMON, coin9:25.62, coin10:24.28}, source:SOURCE_STATUS.VERIFIED },
  4:{ setting:4, roles:{...VERIFIED_COMMON, coin9:25.78, coin10:23.45}, source:SOURCE_STATUS.VERIFIED },
  5:{ setting:5, roles:{...VERIFIED_COMMON, coin9:25.94, coin10:22.67}, source:SOURCE_STATUS.VERIFIED },
  6:{ setting:6, roles:{...VERIFIED_COMMON, coin9:26.11, coin10:21.94}, source:SOURCE_STATUS.VERIFIED }
});

export function getSettingProfile(setting) {
  return SETTING_PROFILES[Number(setting)] ?? SETTING_PROFILES[1];
}
