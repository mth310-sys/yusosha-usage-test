import { test, expect } from '@playwright/test';
import {
  ART_PRESENTATION_GUARANTEE_SPEC,
  ART_PRESENTATION_GUARANTEE_POLICY,
  resolveGoldTSymbolMinimum
} from '../test_lupin_zero/src/art-presentation-guarantee-resolver.js';

test('gold T symbol guarantees at least 300000 treasure', () => {
  expect(resolveGoldTSymbolMinimum(0)).toMatchObject({ treasureTo: 300000, added: 300000, minimumTreasure: 300000 });
  expect(resolveGoldTSymbolMinimum(250000)).toMatchObject({ treasureTo: 300000, added: 50000 });
  expect(resolveGoldTSymbolMinimum(450000)).toMatchObject({ treasureTo: 450000, added: 0 });
});

test('published ART color-pattern guarantees are stored without inventing OR-branch selection', () => {
  expect(ART_PRESENTATION_GUARANTEE_SPEC.GOLD.alternatives).toEqual([
    'MINIMUM_TREASURE_500000',
    'ABSOLUTE_BREAKTHROUGH_OR_BETTER',
    'MINIMUM_GAME_AWARD_50'
  ]);
  expect(ART_PRESENTATION_GUARANTEE_SPEC.TIGER_OR_RAINBOW.alternatives).toEqual([
    'MINIMUM_TREASURE_1000000',
    'ABSOLUTE_BREAKTHROUGH_OR_BETTER'
  ]);
  expect(ART_PRESENTATION_GUARANTEE_SPEC.ATTACK_VISION.alternatives).toEqual([
    'MINIMUM_TREASURE_1000000',
    'GT_CONTINUATION_GUARANTEED'
  ]);
  expect(ART_PRESENTATION_GUARANTEE_SPEC.GOLD.automaticSelectionRate).toBeNull();
  expect(ART_PRESENTATION_GUARANTEE_POLICY.unresolvedAlternativeSelectionRatesInvented).toBe(false);
});
