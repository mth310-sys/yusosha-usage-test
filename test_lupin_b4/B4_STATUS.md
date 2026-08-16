# LUPIN B4 — CURRENT STATUS

Last audited against GitHub `main`: `cfed64314b746848292e2e948eced92b633bb3d9`

## Purpose

This file marks the current development boundary of `test_lupin_b4/`.
It is not a claim that the 2016 machine has been fully reverse-engineered.
The current runtime implements verified behavior where sufficient evidence exists and deliberately stops or uses DEBUG/manual routes where values remain unresolved.

## Current CI state

- GitHub Actions workflow: `Browser Test`
- Run: `#229`
- Result: `success`
- Head commit: `cfed64314b746848292e2e948eced92b633bb3d9`
- Latest fix affected test observation only; production runtime was not changed.

## Development rule

1. GitHub `main` is authoritative.
2. Only verified machine behavior may drive automatic runtime behavior.
3. `UNVERIFIED`, `UNRESOLVED`, and `CONFLICT` values must not be guessed, normalized, averaged, or interpolated.
4. Unknown natural-entry rates remain disabled unless evidence promotes them to verified behavior.
5. DEBUG/manual entry is permitted to test boundaries whose automatic rate is unresolved.
6. Every promoted rule should receive deterministic regression coverage and keep the full Browser Test green.

## Implemented / guarded system areas

The current B4 codebase contains runtime/profile/test coverage across the following major areas:

- WANTED target-game cycle and WANTED CHANCE countdown/hold behavior.
- Initial WANTED published 32G-band table, including the published rounded total of `100.6` without synthetic normalization.
- Post-WANTED-failure setting-specific target tables, preserving published rounded totals and zero-weight bands exactly as sourced.
- LCD chance appearance / expectation / verified destination routing for WANTED and normal contexts.
- Changed-hold consumption, countdown freeze/resume, direct CZ routing, and LB/GT reservation boundaries.
- DOROBO ZONE / FUJIKO ZONE and related CZ profiles/aggregate handling.
- Seven Zone / Seven Attack guarded manual or verified post-entry behavior while unresolved natural-entry rates remain disabled.
- Normal-mode game-count ceiling handling, setting-change reset handling, and verified RAIUN ceiling exception behavior.
- Raiun / Shin Raiun / LEGEND GATE guarded behavior where evidence is sufficient, while unresolved distributions remain blocked.
- ART stage/scenario, continuation, return, Treasure-related, IKUKAN, LUPIN RUSH, GOLD RUSH and associated DEBUG/guard routes where exact distributions are incomplete.
- Credit / hold / state-transition integrity and browser regression coverage around the above systems.

This list describes covered areas, not a statement that every probability or visual behavior inside each area is fully verified.

## Authoritative unresolved boundary

`UNVERIFIED_VALUES.md` is the authoritative unresolved-value register for B4.
The current unresolved/guarded set includes, among others:

- Seven Attack natural entry rate.
- LCD visual hold/step-up distribution.
- Revenge Chance natural entry and per-game success rates, plus LB/GT destination split.
- Treasure-return notification split and normal-stage waiting-game distribution.
- Missing/conflicting Treasure-return table rows.
- Non-RAIUN special-context game-count ceiling behavior.
- Detailed Normal Raiun point distributions and BLUE-side rank / RED-promotion probability.
- Shin Raiun ordinary ART rate.
- LEGEND GATE duration and medal-acquisition model.
- IKUKAN exit visible/internal return stage and exact Treasure award distribution.
- Normal T-alignment exact Treasure award distribution.
- Treasure RUSH exact duration / award distribution.
- Treasure Hunt success destination split.
- Chance-eye -> Treasure RUSH exact weak/mid/strong rates.
- ART normal-continuation direct-add vs LUPIN RUSH route conflict and unresolved route distributions.
- GOLD RUSH stock denominator conflict and breakthrough-label distributions.
- Physical reel strip details still marked provisional by the test UI.

Do not implement automatic probabilities for these items merely to make the simulator feel complete.

## WANTED verification boundary reached in this pass

The WANTED regression layer now explicitly locks:

- Initial 15-band published table.
- Initial low endpoint `1G` and high endpoint `480G`.
- Exactly two RNG draws for target-band + in-band selection in the deterministic boundary test.
- Initial published rounded weight total `100.6` as published, without normalization.
- Post-WC setting-specific high-end eligibility:
  - settings 1-3: highest eligible band `417-448`.
  - settings 4-6: highest eligible band `449-480`.
- Setting-specific published rounded totals and zero-weight bands.
- Full 10G no-LCD WANTED failure lifecycle.
- Miss-hold countdown extension, including multiple consecutive miss holds.
- Winning hold precedence over failure at the final countdown boundary.
- LB route and direct FUJIKO/DOROBO CZ routes after miss-hold extensions.

## Current stopping point

B4 is in a stable, CI-green research build state.
Further development should begin from a specific unresolved item backed by new machine/source evidence, or from a clearly isolated presentation/UX task that does not invent machine behavior.

Before the next implementation pass:

1. Fetch current GitHub `main` again.
2. Read `UNVERIFIED_VALUES.md`.
3. Check this status file for the previous verified boundary.
4. Promote only the smallest newly verified rule.
5. Add deterministic coverage and verify the full Browser Test.
