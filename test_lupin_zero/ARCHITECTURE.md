# LUPIN ZERO — Technical Architecture

## Goal

Rebuild the presentation/runtime foundation from zero without modifying the stable `test_lupin_b4/` research build. Verified B4 behavior can later be promoted into this architecture in small, deterministic steps. Unverified probabilities and unresolved physical-reel data are intentionally not copied.

## Selected stack

- **HTML5**: semantic shell, accessibility, GitHub Pages entry point.
- **CSS**: cabinet/body, LED-like lighting, responsive 390px mobile layout and physical controls.
- **JavaScript ES modules**: deterministic machine state, adapters and orchestration without a mandatory build step.
- **Phaser 4.2.1**: LCD/reel/effects render layer using `Phaser.AUTO` (WebGL first, Canvas fallback).
- **Web Audio API (next layer)**: sound bus / gain groups / effects. Kept outside game rules.
- **Playwright + GitHub Actions**: deterministic browser regression, already established in this repository.
- **GitHub Pages**: zero-install iPhone test/deployment route.

## Why this hybrid

A pachislot-style machine has two different rendering problems. The cabinet and controls benefit from DOM/CSS because they need precise layout, touch interaction and fast design iteration. The LCD, reels and effects benefit from a game renderer because they need a stable frame loop, tweens, particles, masking, cameras and GPU acceleration. Game rules must remain independent from both so verified machine behavior can be tested without rendering.

## Layers

1. `MachineCore` — state and input rules only.
2. `VerifiedSpec` — future data/rules ported only when B4 evidence marks them verified.
3. `PhaserView` — reel/LCD/effect presentation; never decides machine probabilities.
4. DOM cabinet — physical UI and responsive shell.
5. Audio bus — future Web Audio adapter.
6. Debug/telemetry — future research controls, isolated from production decisions.

## Current boundary

This first zero-build milestone is intentionally a **research spin shell**. It supports BET / MAX BET / START / independent reel stops and a Phaser render loop. Symbol selection is presentation-only and explicitly not a reproduction of the 2016 machine's physical strip or probability model.

## Migration rule

Do not bulk-copy B4 patches. For each migration:

1. Identify one verified B4 rule and its regression test.
2. Port the rule into a pure module/data profile.
3. Add/port deterministic tests first.
4. Connect it to `MachineCore` only after tests pass.
5. Connect presentation last.
6. Leave `UNVERIFIED`, `UNRESOLVED`, and `CONFLICT` entries disabled/manual.

## Candidates considered but not selected as the core

- **C++ / WebAssembly**: useful later for very heavy simulation, but unnecessary complexity for the interactive runtime today.
- **C# / Unity**: strong native-game option, but poor fit for the current GitHub Pages + iPhone-first workflow and existing web assets.
- **Java / Kotlin**: useful for Android-native work, not the primary cross-platform browser target.
- **Python**: excellent for offline analysis/generation, not the browser runtime.
- **React/Vue**: unnecessary for the machine runtime; DOM state is small and Phaser owns the dynamic scene.
- **Three.js**: reserve for a genuinely 3D cabinet/3D mechanical feature. Phaser 4 remains the 2D gameplay renderer.
- **TypeScript + Vite**: recommended future upgrade when build tooling becomes convenient; deliberately not mandatory in this iPhone-first zero milestone.
