import { VERIFIED_SPEC } from './verified-spec.js';

export const ChanceZoneType = Object.freeze({
  ODOROBO_ZONE: 'ODOROBO_ZONE',
  FUJIKO_ZONE: 'FUJIKO_ZONE'
});

function validateSetting(setting) {
  if (!Number.isInteger(setting) || setting < 1 || setting > 6) {
    throw new RangeError('setting must be an integer from 1 to 6');
  }
}

export function resolveChanceZoneDuration(randomSource, setting = 1, zone = ChanceZoneType.ODOROBO_ZONE) {
  validateSetting(setting);
  if (!Object.values(ChanceZoneType).includes(zone)) throw new Error(`Unknown chance-zone type: ${zone}`);
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }

  const profile = VERIFIED_SPEC.chanceZones.durationBySetting[setting];
  const draw = randomSource.nextFloat();
  const games = draw < profile.tenGames / 100 ? 10 : 20;

  return Object.freeze({
    zone,
    setting,
    games,
    draw,
    publishedPercent: Object.freeze({ tenGames: profile.tenGames, twentyGames: profile.twentyGames }),
    evidenceStatus: VERIFIED_SPEC.evidence.chanceZoneDurationBySetting
  });
}

export const CHANCE_ZONE_DURATION_POLICY = Object.freeze({
  durationValues: Object.freeze([10, 20]),
  publishedSettingDistributionUsedDirectly: true,
  exactPostWindowFailureRouteImplemented: false,
  note: 'Published 10G/20G selection is implemented. Exhaustion handling remains a separate boundary until post-window behavior is modeled.'
});
