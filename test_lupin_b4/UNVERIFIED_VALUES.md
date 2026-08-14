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
| Treasure return rows not explicitly present in the adopted table | UNRESOLVED / CONFLICT | No interpolation. See `js/art-return-profile.js`. |
| Game-count ceiling reached during non-plain-NORMAL special context | PARTIAL: RAIUN VERIFIED / OTHERS UNRESOLVED | Plain NORMAL ceiling → LUPIN BONUS is verified. RAIUN_MODE ceiling → SHIN_RAIUN + LEGEND_GATE is now cross-source confirmed and automatic. Other special contexts such as RIZE/CZ/REVENGE remain `SPECIAL_CONTEXT_PENDING`; do not generalize the Raiun benefit. See `js/ceiling-runtime-patch.js`. |
| Normal Raiun detailed initial-point distribution | UNVERIFIED | Aggregate published values are retained; detailed distribution is not invented. |
| Normal Raiun point-add distribution | UNVERIFIED | Aggregate published values are retained; detailed distribution is not invented. |
| Raiun HIGH level distribution | UNVERIFIED | LOW/HIGH published rates remain isolated; no invented level-selection lottery. |
| Shin Raiun ordinary per-game ART rate | UNVERIFIED | Verified LEGEND GATE 1/88.9 is separate; ordinary ART probability is not inferred. |
| LEGEND GATE duration | UNVERIFIED | Entry denominators and medal benefits can remain modelled; duration is not invented. |
| LEGEND GATE medal-acquisition model | UNVERIFIED | No automatic medal lottery until acquisition rules are verified. |
| IKUKAN exit return internal/visible stage | UNRESOLVED | Stop at the 10G-window exit boundary instead of fabricating the return stage. See `js/ikukan-exit-profile.js`. |
| IKUKAN exact per-game Treasure award distribution | UNVERIFIED | Verified 10G/every-game/minimum/average facts are retained without inventing the distribution. |
| Normal T-alignment exact Treasure award distribution | UNVERIFIED | Published minimum/maximum/average can be retained; exact lottery is not invented. |
| Treasure RUSH exact game-count / award distribution | UNVERIFIED / CONFLICT | Published bounds/averages remain metadata; conflicting duration descriptions and missing exact distribution are not synthesized. |
| Treasure Hunt success destination split (direct award vs Treasure RUSH) | UNRESOLVED | Verified special-hold minimum benefits remain available; destination split stays manual/guarded. |
| Chance-eye → Treasure RUSH exact weak/mid/strong rates | UNVERIFIED | Qualitative strength relationship is not converted into invented numeric probabilities. |
| ART normal-continuation LUPIN RUSH vs direct-add route | CONFLICT | Current always-RUSH core route remains explicitly provisional; empirical ~70% direct-add observation is not used as an exact lottery. See `js/art-continuation-entry-profile.js`. |
| ART normal-continuation direct-add / RUSH-type distributions | UNRESOLVED | No synthetic distribution until the original continuation-entry table is recovered. |
| GOLD RUSH stock denominator | CONFLICT | Source disagreement is retained in profile metadata; do not silently merge denominators. |
| GOLD RUSH breakthrough-label distributions | UNVERIFIED | Verified minimum-stock meanings are retained; label appearance distribution is not invented. |
| Physical reel strip details still marked provisional by the test UI | UNVERIFIED | Keep integrity checks, but do not claim final real-machine strip fidelity. |

## Promotion checklist

Before changing an unresolved item to verified runtime behavior:

1. Record the exact value/behavior and source basis.
2. Mark whether it is single-source or cross-source confirmed.
3. Implement it in the smallest relevant profile/module; avoid unrelated refactors.
4. Add or update a deterministic test for the new rule where possible.
5. Confirm the full GitHub Browser Test passes.

## Audit note

This register was cross-checked against the current profile/guard modules after the Step 6Z browser scenario gate became green. It intentionally includes unresolved boundaries that are already represented safely in code, so a future implementation pass cannot mistake an omitted register row for a verified machine rule.

This file is the authoritative unresolved-value register for `test_lupin_b4` until a dedicated machine-spec database replaces it.
