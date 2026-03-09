# ThreeGame Roadmap 3 (Next Improvements)

## Focus A — UX + Readability

- [x] **Persistent HUD panel for series + save state**
  - Show BO mode, series score, and autosave status during gameplay (not only at match end).
  - Add small "Last saved" timestamp.

- [x] **Ability tooltip system**
  - Hover/click active ability button to show exact rules/cooldowns/effects.
  - Include per-archetype examples (Dash range, Guard mitigation, Aim crit bonus/move penalty).

- [x] **Combat log filters**
  - Toggle event categories (move/attack/death/turn_end/undo).
  - Add compact mode and clear-log control.

## Focus B — Combat + Balance

- [x] **Cover/height visualization on board**
  - Add tile overlays for cover contributors and LoS blockers.
  - Highlight why hit/miss chances changed.

- [x] **Status effect clarity pass**
  - Add duration chips over units for poison/guard/aim/armor.
  - Clarify stack/refresh behavior in unit info.

- [x] **Balance tuning pass v1**
  - Revisit base archetype stats and ability values from playtests.
  - Add a central balance config section with comments.

## Focus C — Systems + Progression

- [x] **Series history + quick rematch options**
  - Track completed series summaries in-memory and optionally localStorage.
  - Show recent winners and map presets used.

- [x] **Manual save slots**
  - Add multiple named save slots (not just autosave).
  - Support overwrite confirmation + delete.

- [x] **Match replay seed + deterministic replay groundwork**
  - Persist random seeds and core event sequence to replay a match.
  - Start with read-only playback prototype.

## Focus D — Engineering + Quality

- [x] **State reducer refactor**
  - Move game mutation flows to explicit action reducer style for easier testing and persistence.

- [x] **End-to-end gameplay tests**
  - Add browser-level tests for a full turn, full match, save/reload, and BO3 flow.

- [ ] **Telemetry hooks for balancing (dev-only)**
  - Capture anonymized local metrics (hit rates, ability usage, turn length) for tuning.

## Suggested Order

1. HUD + ability tooltip clarity
2. Cover/status visualization
3. Save slots + series history
4. Reducer refactor + e2e tests
