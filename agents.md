<!--
This file is intended for AI coding agents working in this repository.
Keep it accurate, actionable, and grounded in the current codebase.
-->

# AI Agent Guide: ThreeGame

## Project Overview

**ThreeGame** is a small turn-based, grid-based tactics game rendered in 3D using **React Three Fiber**. It runs as a **Next.js (Pages Router)** web app.

**Primary stack**

- **Next.js 16** (Pages Router under `pages/`)
- **React 19**
- **TypeScript** (strict mode enabled)
- **three.js** rendered via **@react-three/fiber** and helpers from **@react-three/drei**

**Key runtime concepts**

- The “authoritative” game rules/state transitions live in `game/` (pure-ish functions, immutable updates).
- Rendering and interaction live in `components/game/` (R3F scene graph, meshes, highlights, UI overlays).
- Persistence is currently via `localStorage` inside `components/game/SceneCanvas.tsx`.

---

## Repository Structure

High-signal directories/files for an agent:

- `pages/` — Next.js route entries (Pages Router).
  - `pages/match.tsx` — the main match page hosting the 3D scene.
  - `pages/_app.tsx` — global CSS import + app wrapper.
- `components/` — UI + game rendering components.
  - `components/game/` — 3D board, units, movement/attack highlights, animation helpers.
  - `components/UI/` — HUD + overlays (status, controls, logs, tooltips, etc.).
- `game/` — game logic / domain layer.
  - `game/gamestate.ts` — core state model + state transition functions (select/move/attack/end turn, etc.).
  - `game/rules/` — movement/combat/turn rules.
  - `game/pathfinding.ts` — pathfinding utilities.
  - `game/selectors.ts` — query helpers.
- `services/` — API client(s) (e.g., `services/api.ts`) used by non-game pages/features.
- `styles/` — global CSS (`styles/globals.css`).
- `tests/` — Node test(s) (TypeScript compiled into `.test-dist` via `tsconfig.test.json`).
- `constants.ts` — central constants system used across the codebase.
- `plans/` — ignored by git (`.gitignore`) and intended as local planning docs.

Generated / build artifacts (do not edit):

- `.next/` — Next.js build output
- `.test-dist/` — compiled test output (created by `npm run test:build`)

---

## Build & Test Commands

All commands are run from the repository root.

### Install

```bash
npm install
```

### Dev server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Start production server (after build)

```bash
npm run start
```

### Tests

This project uses Node’s built-in test runner, with TypeScript tests compiled first.

```bash
npm test
```

You can run the compile step alone:

```bash
npm run test:build
```

### Lint

There is **no** `lint` script configured in `package.json` at the moment.

---

## Code Style & Conventions

### TypeScript

- **`strict: true`** in `tsconfig.json`.
- Prefer explicit types on exported APIs and component props.
- Avoid `any` unless you’re plumbing an external boundary (and add a TODO comment if it’s temporary).

### React + Next.js

- Prefer **functional components** and hooks.
- Pages live in `pages/` and export a default React component.
- Many 3D/game components are **client components** (they start with `'use client'`) because they depend on browser APIs / WebGL.

### Game logic boundaries

- Keep rules/state transitions in `game/`.
  - `game/gamestate.ts` should remain the “single source of truth” for turn/phase transitions.
- Keep rendering and input concerns in `components/`.
- Avoid mixing UI concerns into `game/` (no DOM/WebGL/localStorage in the rules layer).

### Immutability + state updates

- `GameState` updates are generally done via immutable updates (copy objects/arrays, do not mutate in-place).
- When deriving computed data from `gameState` in React components, use `useMemo` when it prevents repeated heavy work (e.g., reachable/attackable tile calculations).

### Styling

- Global styles are in `styles/globals.css`.
- Many components use **CSS Modules** (`*.module.css`). Prefer CSS Modules for new UI styling.
- If you must use inline styles (e.g., quick overlays), keep them local and avoid duplicating magic values—prefer constants when practical.

### Coordinate conventions (important for animation + highlights)

- Game board positions are typically `{ x, y }` (grid coordinates).
- In three.js space, the grid is commonly mapped as:
  - `x` → world X
  - `y` (grid) → world Z
  - world Y is height (e.g., `0.2`)

---

## Git Workflow

This repo does not currently enforce a workflow via tooling, but the following is **recommended** for consistent collaboration:

### Branching

- Branch from the default branch (commonly `main`).
- Use short-lived feature branches, e.g.:
  - `feat/unit-move-animation`
  - `fix/pathfinding-occupancy`

### Commit messages

Recommended: **Conventional Commits**

- `feat(game): ...`
- `fix(ui): ...`
- `refactor(game): ...`
- `docs: ...`

Keep commits small and scoped. Prefer “why + what” in the body if the change is non-obvious.

---

## Boundaries & Guardrails

### Never modify (unless the user explicitly requests it)

- `package-lock.json` (dependency lockfile)
- `.git/` and anything under it
- Generated directories:
  - `.next/`
  - `.test-dist/`
  - `node_modules/`

### Be cautious / require explicit intent

- Adding/upgrading dependencies in `package.json`.
- Changing core domain rules in `game/gamestate.ts` / `game/rules/*` (high blast radius).
- Changing persistence format (`toPersistedGameState` / `fromPersistedGameState`) or localStorage keys.

### Security / secrets

- Do not commit secrets.
- Respect `.gitignore` for env files: `.env*`.

### Operational discipline

- Prefer small, reviewable diffs.
- Run `npm test` and `npm run build` after non-trivial changes.
- Keep changes grounded in existing patterns (e.g., don’t introduce a new state management library without discussion).
