import { test, expect } from '@playwright/test';
import {
  PHYSICAL_CUE_AUDIT_SPEC,
  physicalCueAuditPasses
} from '../test_lupin_zero/src/physical-cue-audit-spec.js';

test('only manual research cues are authorized to drive physical LED or prism surfaces', () => {
  expect(physicalCueAuditPasses()).toBe(true);
  expect(PHYSICAL_CUE_AUDIT_SPEC.productionAutomaticPhysicalCueAllowed).toBe(false);
  expect(PHYSICAL_CUE_AUDIT_SPEC.authorizedPhysicalCueEntryPoints).toEqual([
    {
      module: 'presentation-orchestrator.js',
      cues: ['RESEARCH_REVEAL', 'RESEARCH_RESET'],
      mode: 'MANUAL_RESEARCH_ONLY',
      automatic: false
    }
  ]);
});

test('all currently unresolved automatic physical cue policies remain disabled', () => {
  const p = PHYSICAL_CUE_AUDIT_SPEC.policies;
  expect(p.orchestratorAutomaticTriggerImplemented).toBe(false);
  expect(p.machineSurfaceAutomaticUnverifiedCuesEnabled).toBe(false);
  expect(p.prismAutomaticTriggerImplemented).toBe(false);
  expect(p.treasureBattleAutomaticLedCue).toBeNull();
  expect(p.treasureBattleAutomaticPrismCue).toBeNull();
  expect(p.treasureBattleAutomaticAudioCue).toBeNull();
});
