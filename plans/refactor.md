# ThreeGame Refactor Plan

## Goals

- Improve maintainability of game logic as roadmap3 expands.
- Reduce file-level complexity and make rules/selectors easier to test.
- Replace scattered literals with named constants.

## Phase 1 — Safe Structural Cleanup

- [x] Create this refactor plan and begin execution
- [x] Extract remaining magic numbers in `game/gamestate.ts` into named constants
- [x] Move board/unit query helpers into a dedicated selectors module
- [x] Move persistence helpers into a dedicated persistence module
- [x] Keep `game/gamestate.ts` as orchestrator + exports for backwards compatibility

## Phase 2 — Rules Decomposition

- [x] Split movement rules into `game/rules/movement.ts`
- [x] Split combat rules into `game/rules/combat.ts`
- [x] Split turn/phase progression rules into `game/rules/turns.ts`
- [x] Confirm no behavior changes with tests

## Phase 3 — UI and Constants Hygiene

- [x] Move repeated inline UI style values in `SceneCanvas` into styles/classes or theme constants
- [x] Centralize scene/camera tuning constants
- [x] Verify UX visuals unchanged

## Validation

- [x] Run full build and test suite after each completed phase
- [x] Update this checklist as each item completes

## Incremental Follow-up Cleanup

- [x] Add shared game utilities module for cross-cutting helpers
- [x] De-duplicate `isWithinBounds` across game modules
- [x] Centralize random integer range helper and use it in combat variance rolls
- [x] Centralize generic math helpers (`clamp`, `clamp01`) and remove local duplicates
- [x] Centralize position helpers (`positionKey`, `manhattanDistance`) and reuse across modules
