# ThreeGame Roadmap 2 (Next Session)

## Focus A — Turn Flow + UX Clarity

- [x] **Auto-skip attack when no valid targets**
  - Optional setting: if a unit has no legal targets in ATTACK phase, auto-skip instead of requiring Continue.
  - Keep manual behavior as default if you want stricter control.

- [x] **Turn transition banner**
  - Add a short center-screen "Player 1 Turn" / "Player 2 Turn" overlay (500–900ms).
  - Pair with existing Game Status pulse for stronger readability.

- [x] **Action availability indicators on units**
  - Small icons/rings for state: can move, can attack, exhausted.
  - Makes board-scanning faster late in turn.

## Focus B — Combat Depth (Lightweight)

- [x] **Height/cover modifiers**
  - Add simple hit chance modifiers based on tile type or cover adjacency.
  - Keep deterministic and visible in Target Preview.

- [x] **Archetype active abilities (v1)**
  - Scout: Dash (extra short move)
  - Bruiser: Guard (temporary stronger mitigation)
  - Sniper: Aim (higher crit, lower move)

- [x] **Damage preview breakdown**
  - Show "base + variance + crit + armor reduction" in Target Preview.

## Focus C — Match Systems

- [x] **Best-of series mode**
  - Track match wins (e.g., BO3/BO5), not just single-match result.

- [x] **Post-match stats expansion**
  - Add per-unit kills, damage taken, attacks landed, turns survived.

- [x] **Save/load match state (localStorage)**
  - Resume unfinished match after refresh.

## Focus D — Engineering + Quality

- [x] **FSM transition hardening**
  - Replace console transition warnings with guarded transition helpers.
  - Ensure invalid transitions cannot occur from UI actions.

- [x] **Broaden tests for edge cases**
  - No-target attack skip flow, turn rollover with remaining units, poison kill at turn start.
  - Add tests around undo behavior + event log ordering.

- [x] **Structured event log rendering**
  - Render typed events in ActionLog with category styling (move/attack/death/turn_end/undo).

## Suggested Session Plan

1. **Start:** FSM hardening + no-target skip flow + tests
2. **Middle:** turn transition banner + unit action indicators
3. **End:** first archetype active ability + preview breakdown
