import { test, expect } from '@playwright/test';
import {
  REVENGE_SUCCESS_MECHANISM_SPEC,
  resolveRevengeSuccessMechanism
} from '../test_lupin_zero/src/revenge-success-mechanism-spec.js';

test('Revenge success is held on mechanism boundary instead of inventing LB/GT split', () => {
  expect(REVENGE_SUCCESS_MECHANISM_SPEC.pendingState).toBe('PENDING_REVENGE_SUCCESS_MECHANISM');
  expect(REVENGE_SUCCESS_MECHANISM_SPEC.automaticMechanismSelection).toBeNull();
  expect(REVENGE_SUCCESS_MECHANISM_SPEC.mechanismSplit).toBeNull();
  expect(REVENGE_SUCCESS_MECHANISM_SPEC.typewriterImpliesDirectGoldenTime).toBeNull();
  expect(REVENGE_SUCCESS_MECHANISM_SPEC.typewriterRouteEvidenceStatus).toBe('UNRESOLVED');
});

test('four-character collection resolves to LUPIN BONUS while direct GT remains a separate known mechanism', () => {
  const collection = resolveRevengeSuccessMechanism('COLLECT_FOUR_CHARACTERS');
  expect(collection.resolved).toBe(true);
  expect(collection.destination).toBe('LUPIN_BONUS');
  expect(collection.destinationCandidates).toEqual(['LUPIN_BONUS']);

  const directGt = resolveRevengeSuccessMechanism('DIRECT_GOLDEN_TIME');
  expect(directGt.resolved).toBe(true);
  expect(directGt.destination).toBe('GOLDEN_TIME');
  expect(directGt.destinationCandidates).toEqual(['GOLDEN_TIME']);
});

test('unknown success mechanism remains unresolved and exposes both published destinations', () => {
  const unresolved = resolveRevengeSuccessMechanism(null);
  expect(unresolved.resolved).toBe(false);
  expect(unresolved.destination).toBeNull();
  expect(unresolved.destinationCandidates).toEqual(['LUPIN_BONUS', 'GOLDEN_TIME']);
  expect(unresolved.evidenceStatus).toBe('UNRESOLVED');
});
