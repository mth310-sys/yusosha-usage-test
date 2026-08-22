# LUPIN ZERO — Technology Selection

## Objective

Reconstruct the 2016 Olympia `パチスロ ルパン三世～消されたルパン～ / ルパン三世消されたルパン/B4` as a browser machine, including internal behavior and the physical-machine experience.

`Zero from scratch` means the architecture is selected from first principles. It does **not** require throwing away proven Yusosha assets. Existing work is reusable when it passes the target/evidence/responsibility gates below.

## Yusosha technologies and methods considered

### Browser/runtime technologies already proven in Yusosha

- HTML5
- CSS / responsive 390px cabinet layouts
- JavaScript / ES modules
- GitHub + GitHub Pages
- direct browser operation without mandatory local build
- modular test machines
- reel test machines
- LED test machines
- effect test machines
- cabinet/frame experiments
- Phaser minimal/showcase experiments
- Playwright browser regression tests
- deterministic machine-rule modules
- research/debug routes
- Visual Lab motion/rotation/logger/LED modules
- GDevelop no-PC visual prototyping experiments

### Available technologies considered for this machine

- SVG
- CSS 3D transforms
- Web Animations API
- Phaser 4 / Canvas / WebGL
- Web Audio API
- Web Workers
- IndexedDB / localStorage
- Three.js
- TypeScript
- Vite/build systems
- WebAssembly
- Python offline analysis/generation
- Unity / C#
- native Swift / SwiftUI
- Kotlin / Android-native
- React / Vue

## Selected stack

### Authoritative runtime

1. **HTML5** — machine shell and semantic/touch controls.
2. **CSS** — responsive cabinet geometry, lighting, materials and simple depth.
3. **SVG** — irregular bezels, masks, lamp windows and scalable physical geometry.
4. **CSS 3D + Web Animations API** — verified movable cabinet parts and mechanical timelines when geometry is simple enough.
5. **JavaScript ES modules** — authoritative deterministic machine kernel, evidence logic and orchestration.
6. **Phaser 4** — LCD, liquid-reel presentation, effects, masking, particles, cameras and high-frequency 2D rendering.
7. **Web Audio API** — BGM/SE/voice/mechanical buses and synchronized audio cues.
8. **Playwright** — end-to-end contract and regression tests.
9. **GitHub Pages** — iPhone-first zero-install validation/deployment.

### Conditional technologies

- **Three.js**: only if verified machine mechanics cannot be reproduced accurately with CSS 3D/SVG.
- **Web Workers**: when simulation/telemetry becomes heavy enough to block the UI.
- **IndexedDB/localStorage**: replay/debug snapshots and research traces when needed.
- **Python**: offline analysis/generation only; never required by browser runtime.
- **TypeScript/Vite**: optional future upgrade only if build tooling does not harm the zero-yen/iPhone-first workflow.

### Not selected as the authoritative core

- **GDevelop**: retain as a fast visual prototype/reference tool, not source-of-truth runtime.
- **Unity/C#**: capable but unnecessary deployment/tooling overhead for the iPhone-first browser target.
- **Swift/SwiftUI / Kotlin**: native-only paths would fragment the browser-first machine.
- **React/Vue**: application UI frameworks add little to a machine runtime dominated by custom rendering and deterministic state.
- **WebAssembly/C++**: reserve for future heavy simulation only.

## Reuse policy

Existing Yusosha assets are classified per module, not per project.

A candidate may be reused only if all required gates pass:

1. **Target gate** — it is generic or specifically belongs to 2016 B4.
2. **Evidence gate** — machine behavior encoded by the asset is VERIFIED, MULTI_SOURCE_MATCH, PUBLISHED_ANALYSIS, or explicitly presentation-only. UNVERIFIED/UNRESOLVED/CONFLICT behavior cannot become automatic production behavior.
3. **Responsibility gate** — the asset fits the new layer. Rendering code cannot decide machine probability. Research code cannot silently become production logic.
4. **Quality gate** — reuse is actually faster/safer than rewriting.
5. **Zero-yen gate** — no metered/paid dependency is introduced.

## High-value reuse sources already present

- `test_lupin_b4/` — verified/known machine behavior, evidence boundaries, cabinet experiments.
- `test_lupin_visual_lab/` — LED styling, motion, rotation, controls, logger patterns and physical-mechanism experiments.
- `test_lupin_body/` — cabinet/body experiments.
- `test_phaser_minimal/` — minimum Phaser boot patterns.
- `test_phaser_showcase/` — Phaser capability experiments.
- repository Playwright setup — browser regression foundation.
- current `test_lupin_zero/src/*-spec.js` — evidence-backed spec assets.

## Final architecture

```text
Input / physical controls
        ↓
Runtime Orchestrator + Event Trace
        ↓
Deterministic Machine Kernel ← Evidence/Spec Layer
        ↓
Presentation commands
   ┌───────────────┬──────────────┬───────────────┐
   ↓               ↓              ↓               ↓
DOM/CSS/SVG     Phaser LCD     Mechanisms      Web Audio
cabinet         & effects      CSS3D/WAAPI     buses
```

No presentation system owns probability or mode decisions.

## Development-speed rule

Before writing a subsystem from scratch:

1. Search B4, Visual Lab, body/frame tests, Phaser tests and older Yusosha test machines.
2. Score the existing candidate for reuse.
3. Reuse or adapt it when that is faster and does not violate the architecture/evidence gates.
4. Rewrite only when the old asset couples responsibilities, contains guesses, belongs to another machine, or costs more to adapt.

**Architecture is zero-based. Assets are reuse-first. Accuracy remains evidence-first.**
