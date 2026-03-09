# ThreeGame Practical Roadmap (No AI Yet)

## Phase 1 — Core Rules Correctness

- [x] **Pathfinding-based movement (BFS first)**
  - Replace Manhattan-only reachability with true walkable paths around obstacles/units.
  - Deliverable: highlighted tiles are always truly reachable.

- [x] **Line-of-sight attack checks**
  - Attacks require both range and unobstructed line (walls block).
  - Deliverable: attack previews and execution both enforce LOS.

- [x] **Action economy edge-case hardening**
  - Ensure no phase skips/odd transitions under all combinations (cancel, no targets, dead target, etc.).
  - Deliverable: deterministic, test-covered turn flow.

## Phase 2 — Combat Readability + UX

- [x] **Action hint strip**
  - Add context hint near status panel: “Select unit”, “Move”, “Choose target or skip”, etc.

- [x] **Targeting previews**
  - On hover enemy: show hit/miss/crit chance and expected damage range.

- [x] **Selection/target visual polish**
  - Cleaner outlines/rings, stronger blocked/valid/invalid indicators, clearer selected unit marker.

## Phase 3 — Content Depth

- [x] **Unit archetypes (3 starter classes)**
  - Example: Scout, Bruiser, Sniper with distinct move/range/damage profiles.

- [x] **Map presets + seed support**
  - Multiple obstacle layouts and optional seeded random map generation.

- [x] **Status effects v1**
  - Add 1–2 simple effects first (e.g., armor up, poison) with turn tick handling.

## Phase 4 — Match Loop + Quality

- [x] **Game-over summary panel**
  - Turns played, total hits/misses/crits, damage dealt per player.

- [x] **Restart options**
  - “Rematch”, “Swap first player”, “New map”.

- [x] **Undo move (pre-attack only)**
  - Single-step undo during movement phase to reduce misclick frustration.

## Phase 5 — Engineering Quality

- [x] **Config extraction**
  - Centralize combat/turn constants and map presets.

- [x] **Event log architecture**
  - Typed event stream (`move`, `attack`, `death`, `turn_end`) to drive HUD/logs.

- [x] **Tests + cleanup**
  - Unit tests for gamestate transitions + remove debug logs + small refactors.

---

## Suggested Execution Order

- **Session 1:** Pathfinding + LOS
- **Session 2:** Hint strip + targeting previews + selection polish
- **Session 3:** Archetypes + map presets
