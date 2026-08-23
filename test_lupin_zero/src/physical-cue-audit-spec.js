import { PRESENTATION_ORCHESTRATOR_POLICY } from './presentation-orchestrator.js';
import { MACHINE_SURFACE_POLICY } from './machine-surface-state.js';
import { LUPIN_PRISM_MECHANISM_SPEC } from './mechanism-spec.js';
import { TREASURE_BATTLE_CABINET_CUE_POLICY } from './treasure-battle-cabinet-cue-runtime.js';

export const PHYSICAL_CUE_AUDIT_SPEC = Object.freeze({
  evidenceStatus: 'AUDIT_BOUNDARY',
  productionAutomaticPhysicalCueAllowed: false,
  authorizedPhysicalCueEntryPoints: Object.freeze([
    Object.freeze({
      module: 'presentation-orchestrator.js',
      cues: Object.freeze(['RESEARCH_REVEAL', 'RESEARCH_RESET']),
      mode: 'MANUAL_RESEARCH_ONLY',
      automatic: false
    })
  ]),
  forbiddenAutomaticSources: Object.freeze([
    'mode-surface-runtime.js',
    'treasure-battle-cabinet-cue-runtime.js',
    'chance-eye production routing',
    'mode enter/exit presentation'
  ]),
  policies: Object.freeze({
    orchestratorAutomaticTriggerImplemented: PRESENTATION_ORCHESTRATOR_POLICY.automaticTriggerImplemented,
    machineSurfaceAutomaticUnverifiedCuesEnabled: MACHINE_SURFACE_POLICY.automaticUnverifiedCuesEnabled,
    prismAutomaticTriggerImplemented: LUPIN_PRISM_MECHANISM_SPEC.policy.automaticTriggerImplemented,
    treasureBattleAutomaticLedCue: TREASURE_BATTLE_CABINET_CUE_POLICY.automaticLedCue,
    treasureBattleAutomaticPrismCue: TREASURE_BATTLE_CABINET_CUE_POLICY.automaticPrismCue,
    treasureBattleAutomaticAudioCue: TREASURE_BATTLE_CABINET_CUE_POLICY.automaticAudioCue
  })
});

export function physicalCueAuditPasses(spec = PHYSICAL_CUE_AUDIT_SPEC) {
  return spec.productionAutomaticPhysicalCueAllowed === false
    && spec.policies.orchestratorAutomaticTriggerImplemented === false
    && spec.policies.machineSurfaceAutomaticUnverifiedCuesEnabled === false
    && spec.policies.prismAutomaticTriggerImplemented === false
    && spec.policies.treasureBattleAutomaticLedCue == null
    && spec.policies.treasureBattleAutomaticPrismCue == null
    && spec.policies.treasureBattleAutomaticAudioCue == null;
}
