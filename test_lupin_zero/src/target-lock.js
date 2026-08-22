export const LUPIN_ZERO_TARGET = Object.freeze({
  manufacturer: 'OLYMPIA',
  title: 'パチスロ ルパン三世～消されたルパン～',
  model: 'ルパン三世消されたルパン/B4',
  releaseYear: 2016,
  identityKey: 'OLYMPIA_2016_LUPIN_KESARETA_B4',
  excludedMachineNames: Object.freeze([
    '閃光のルパン'
  ]),
  sourceGate: Object.freeze({
    requireTargetIdentityBeforeAdoption: true,
    rejectCrossMachineProbabilityImport: true,
    rejectCrossMachinePresentationImport: true,
    rejectCrossMachineMechanismImport: true
  })
});

export function isTargetIdentity({ manufacturer, title, model, releaseYear } = {}) {
  return manufacturer === LUPIN_ZERO_TARGET.manufacturer
    && title === LUPIN_ZERO_TARGET.title
    && model === LUPIN_ZERO_TARGET.model
    && releaseYear === LUPIN_ZERO_TARGET.releaseYear;
}
