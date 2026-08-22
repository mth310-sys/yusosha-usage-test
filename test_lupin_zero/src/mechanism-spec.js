export const LUPIN_PRISM_MECHANISM_SPEC = Object.freeze({
  target: 'OLYMPIA_2016_LUPIN_KESARETA_B4',
  evidenceStatus: 'PARTIAL_REAL_MACHINE_OBSERVATION',
  observedGeometry: Object.freeze({
    form: 'VERTICAL_TRIANGULAR_PRISM_LIKE',
    circularElementBehindOrInside: true,
    revealStateObserved: true,
    exactFaceDimensions: null,
    exactPivotAxis: null,
    exactTravelAngleDegrees: null,
    exactMotionDurationMs: null
  }),
  states: Object.freeze({
    CLOSED: 'CLOSED',
    REVEAL: 'REVEAL'
  }),
  policy: Object.freeze({
    automaticTriggerImplemented: false,
    exactAngleIsVerified: false,
    exactTimingIsVerified: false,
    manualDebugActivationAllowed: true,
    note: 'The mechanism is implemented as an evidence-safe visual prototype. The observed circular element is preserved; exact engineering geometry and trigger timing remain unresolved.'
  })
});
