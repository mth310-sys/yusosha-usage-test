# LUPIN ZERO — Architecture V2

## Target lock

This project reconstructs **2016 Olympia パチスロ ルパン三世～消されたルパン～ / ルパン三世消されたルパン/B4**.

Do not import behavior, art assumptions, cabinet mechanics, probabilities, or presentation from other Lupin machines (including 閃光のルパン) unless a source explicitly proves the same behavior exists on the 2016 B4 machine.

## Product goal

Build a playable browser reproduction by reverse-modeling the real machine. Research data is not the product; it is evidence used to drive a deterministic runtime. Every implemented behavior must retain its evidence status.

## Constraints

- Zero-yen operation only. No paid API, metered credits, trial credits, or services that can roll into billing.
- iPhone-first development and validation.
- GitHub Pages remains the zero-install runtime target.
- Current GitHub `main` is authoritative before every change.
- `UNVERIFIED`, `UNRESOLVED`, and `CONFLICT` facts are never silently promoted into production behavior.

## Technologies considered

### Used / proven in Yusosha

- HTML5 / CSS / JavaScript browser games
- CodePen-style direct browser prototyping
- GitHub + GitHub Pages deployment
- Modular test machines: minimal / reel / effects / LED
- 390px-class mobile cabinet layouts
- CSS cabinet and LED experiments
- deterministic JavaScript research engines
- Phaser render layer
- Playwright browser regression tests
- GDevelop experiments for no-PC authoring

### Available candidates

- SVG for precise scalable bezels, masks, paths, lamps and vector overlays
- CSS 3D transforms for cabinet depth and simple mechanical parts
- Web Animations API for DOM/SVG mechanisms and LED timelines
- Web Audio API for buses, gain, panning and synchronized cues
- Canvas/WebGL through Phaser for LCD, reels, particles, masks and high-frequency effects
- Three.js only when a verified mechanism genuinely requires 3D geometry/camera/parallax beyond CSS 3D
- Web Workers later for heavy deterministic simulation/telemetry without blocking rendering
- IndexedDB/localStorage for local research/debug snapshots when needed
- Python only as offline analysis/generation tooling, never as required browser runtime
- TypeScript/build tooling only if it becomes possible without damaging iPhone-first zero-build operation

## Selected architecture

The machine is not one rendering problem. Use the best technology per physical subsystem.

### 1. Evidence Layer — pure ES modules

`spec/` contains source-backed machine facts and evidence status. Existing `*-spec.js` files are migrated here gradually rather than rewritten in bulk.

Rules:
- no rendering
- no random draws
- no guessed defaults
- every unresolved field remains explicit

### 2. Machine Kernel — pure deterministic JavaScript

`core/` owns the actual machine state:

- credits / bet / payout
- game counter / ceilings
- role result input
- normal / WANTED / CZ / Raiun / Lupin Bonus / GT / Legend Gate state transitions
- counters, holds, stock, Treasure, set progression
- physical reel stop state

The kernel never calls Phaser, DOM, audio, timers, or `Math.random()` directly.

### 3. Random Source Adapter

`runtime/random-source.js` is the only probability boundary.

Production can use a seeded PRNG; tests can inject a fixed sequence. A spin can therefore be replayed exactly from seed + inputs + setting + spec revision.

Unknown probabilities cannot be registered in the production lottery table.

### 4. Physical Cabinet Layer — DOM + CSS + SVG

Use DOM/CSS for touch controls and cabinet geometry. Use SVG for irregular frame pieces, masks, lamp windows and scalable decorative geometry.

Use CSS 3D / Web Animations for verified simple mechanisms such as rotating/opening panels. This preserves editability and performs well on iPhone.

Three.js is **not** a default dependency. Introduce it only for a mechanism proven to need real 3D.

### 5. LCD / Reel / Effects Layer — Phaser 4

Phaser owns high-frequency visual content:

- LCD scenes
- liquid-reel presentation
- reel motion presentation where appropriate
- particles / flashes / masks
- camera shake / freeze presentation
- composited effects

Phaser receives commands/events from the kernel. It never decides hits, roles, destinations, stocks, or probabilities.

### 6. Mechanism Controller

`presentation/mechanisms/` maps machine events to physical presentation timelines:

- LEDs
- buttons
- frame illumination
- rotating/opening gimmicks
- Attack Vision / verified movable parts

A mechanism timeline is presentation only; completion can acknowledge back to orchestration but cannot change lottery results.

### 7. Audio Engine — Web Audio API

Separate buses:

- BGM
- SE
- voice
- mechanical

Audio is event-driven from the runtime timeline. Rules never depend on whether audio loads or plays.

### 8. Orchestrator / Event Bus

`runtime/` connects kernel outputs to cabinet, Phaser, mechanisms and audio. This is the only layer allowed to coordinate multiple presentation systems.

Core event examples:

- `spin:accepted`
- `role:resolved`
- `reel:stop-requested`
- `reel:stopped`
- `mode:entered`
- `mode:exited`
- `counter:changed`
- `effect:requested`
- `payout:committed`

### 9. Research / Debug Layer

Debug controls are isolated from normal play:

- force known role
- enter known mode
- set counter/stock
- replay seed
- inspect evidence status
- compare expected vs actual event trace

Unresolved behavior may be exposed here manually but must not leak into automatic production flow.

### 10. Test strategy

Use three levels:

1. Pure deterministic rule tests — no browser required conceptually.
2. Playwright integration tests — user input → kernel → presentation contract.
3. Visual/manual iPhone verification — cabinet, touch, LEDs, mechanisms, timing.

The existing public-repository standard GitHub-hosted runner may be used only while it remains truly zero-charge under the project's billing rule. No larger runners and no paid storage dependency.

## Why GDevelop is not the core

GDevelop remains useful as a visual experiment/prototyping reference, but it is not selected as the authoritative runtime because this reconstruction needs source-level evidence boundaries, deterministic replay, custom cabinet/mechanism rendering, exact tests, and GitHub-native incremental control.

## Why Phaser alone is not the core

Putting cabinet, buttons, mechanical gimmicks, LCD and rules into one Phaser scene would couple unrelated systems. DOM/CSS/SVG is superior for the physical shell and touch UI; Phaser is superior for high-frequency LCD/effect rendering; pure JS is superior for auditable rules.

## Directory target

```text
test_lupin_zero/
  index.html
  style.css
  spec/                 # evidence-backed facts
  core/                 # deterministic machine kernel
  runtime/              # orchestration, PRNG, clock, event trace
  presentation/
    cabinet/            # DOM/CSS/SVG adapters
    lcd/                # Phaser scenes/effects
    mechanisms/         # LEDs / movable parts / timelines
    audio/              # Web Audio
  research/             # debug-only adapters and evidence tools
  assets/               # only legally/appropriately sourced project assets
```

Migration is incremental. Existing files remain operational until their responsibility is moved and locked by tests.

## First implementation sequence

1. Add target-lock + architecture contract tests.
2. Introduce deterministic seeded random-source and clock interfaces.
3. Refactor current `MachineCore` behind the new kernel boundary without changing behavior.
4. Connect one verified normal-game rule end-to-end.
5. Add event trace/replay.
6. Build cabinet/mechanism interfaces.
7. Move verified mode specs into runtime one subsystem at a time.
8. Add audio only after event timing is stable.
9. Introduce true 3D only when verified machine geometry requires it.

## Non-negotiable rule

**Evidence decides machine behavior. Rendering technology never does. Unknown machine behavior remains unknown until evidence supports it.**
