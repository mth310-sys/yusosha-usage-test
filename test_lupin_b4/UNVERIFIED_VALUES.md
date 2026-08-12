# LUPIN B4 — UNVERIFIED VALUES REGISTER

Purpose: keep unresolved real-machine values separate from verified implementation so the reverse model never silently invents probabilities.

## Status policy

- `VERIFIED`: value/behavior is supported strongly enough to drive automatic runtime behavior.
- `CROSS_SOURCE_CONFIRMED`: independently matching sources; preferred verified class.
- `SOURCE_ONLY`: supported by one usable source; retain source/confidence metadata.
- `CONFLICT`: sources disagree; do not average or silently choose one.
- `UNVERIFIED`: behavior is known or suspected but the numeric value/distribution is not confirmed.
- `UNRESOLVED`: insufficient information to decide the behavior itself.

## Runtime policy

1. Never invent a probability for `UNVERIFIED`, `UNRESOLVED`, or `CONFLICT` items.
2. Do not interpolate missing table rows unless the source explicitly defines interpolation/grouping.
3. Unknown automatic-entry rates remain disabled. Use DEBUG/manual entry only when needed for boundary testing.
4. Preserve verified neighboring behavior while an unresolved decision is pending.
5. New evidence should update this register and the relevant profile/module together.
6. GitHub Browser Test must remain green after any value is promoted to verified runtime behavior.

## Current unresolved / guarded areas

| Area | Current status | Runtime handling |
| --- | --- | --- |
| Seven Attack natural entry rate | UNVERIFIED | Automatic entry disabled; post-entry 67% success behavior can be tested separately. |
| LCD visual hold/step-up distribution | UNVERIFIED | Visual distribution is not automatically inferred. |
| Revenge Chance natural entry rate after eligible loss | UNVERIFIED | Boundary can stop at `ENTRY_PENDING_UNVERIFIED_RATE`; DEBUG/manual route is used for tests. |
| Revenge Chance per-game success probability | UNVERIFIED | No invented automatic hit rate. |
| Revenge Chance LB/GT success destination split | UNVERIFIED | DEBUG/manual destination selection where required. |
| Treasure-return notification route split (Revenge vs normal-stage notice) | UNVERIFIED | A confirmed return HIT pauses for explicit notification-route resolution. |
| Treasure-return normal-stage notification waiting games | UNVERIFIED | No fabricated wait-game distribution. |
| Treasure return rows not explicitly present in the adopted table | UNRESOLVED / source conflict | No interpolation. See `js/art-return-profile.js`. |
| Physical reel strip details still marked provisional by the test UI | UNVERIFIED | Keep integrity checks, but do not claim final real-machine strip fidelity. |

## Promotion checklist

Before changing an unresolved item to verified runtime behavior:

1. Record the exact value/behavior and source basis.
2. Mark whether it is single-source or cross-source confirmed.
3. Implement it in the smallest relevant profile/module; avoid unrelated refactors.
4. Add or update a deterministic test for the new rule where possible.
5. Confirm the full GitHub Browser Test passes.

This file is the authoritative unresolved-value register for `test_lupin_b4` until a dedicated machine-spec database replaces it.
