import test from 'node:test'
import assert from 'node:assert/strict'

import {
  COVER_MISS_BONUS,
  CRIT_CHANCE,
  MISS_CHANCE,
  createInitialGameState,
  endTurn,
  getAttackableEnemies,
  getTargetingPreview,
  getUnitById,
  hasAvailableActionsForCurrentPlayer,
  moveSelectedUnit,
  Phase,
  resolveAttack,
  selectUnit,
  skipAttackForSelectedUnit,
  useActiveAbilityForSelectedUnit,
  undoSelectedUnitMove,
} from './gamestate'
import type { GameState } from './gamestate'

test('records move and undo_move events', () => {
  let state = createInitialGameState()
  state = selectUnit(state, 'u1')
  state = moveSelectedUnit(state, { x: 1, y: 2 })

  assert.equal(state.eventLog.at(-1)?.type, 'move')
  assert.equal(state.phase, Phase.ATTACK)

  state = undoSelectedUnitMove(state, { x: 1, y: 1 })
  assert.equal(state.eventLog.at(-1)?.type, 'undo_move')
  assert.equal(state.phase, Phase.MOVE_UNIT)
})

test('records attack and turn_end events', () => {
  const originalRandom = Math.random
  Math.random = () => 0.5

  try {
    let state = createInitialGameState()

    state = {
      ...state,
      units: state.units.map((unit) => {
        if (unit.id === 'u1') {
          return { ...unit, position: { x: 1, y: 1 }, hasMoved: true }
        }
        if (unit.id === 'u4') {
          return { ...unit, position: { x: 2, y: 1 }, health: 3 }
        }
        return unit
      }),
      selectedUnitId: 'u1',
      phase: Phase.ATTACK,
    }

    const resolution = resolveAttack(state, 'u4')
    assert.ok(resolution)

    const attackedState = resolution.nextState
    const attackEvent = attackedState.eventLog.at(-2)
    const deathEvent = attackedState.eventLog.at(-1)
    assert.equal(attackEvent?.type, 'attack')
    assert.equal(deathEvent?.type, 'death')

    const turnEndedState = endTurn(attackedState)
    assert.equal(turnEndedState.eventLog.at(-1)?.type, 'turn_end')
  } finally {
    Math.random = originalRandom
  }
})

test('auto-skip attack after move when no valid targets', () => {
  let state = createInitialGameState({ autoSkipNoTargetAttack: true })

  state = selectUnit(state, 'u1')
  assert.equal(state.phase, Phase.MOVE_UNIT)

  state = moveSelectedUnit(state, { x: 1, y: 2 })

  const movedUnit = getUnitById(state, 'u1')
  assert.ok(movedUnit)
  assert.equal(movedUnit.hasMoved, true)
  assert.equal(movedUnit.hasAttacked, true)
  assert.equal(state.phase, Phase.SELECT_UNIT)
  assert.equal(state.selectedUnitId, null)
  assert.equal(state.currentPlayer, 'p1')
})

test('auto-skip attack when selecting a unit already in attack phase with no targets', () => {
  const base = createInitialGameState({ autoSkipNoTargetAttack: true })
  const primed = {
    ...base,
    units: base.units.map((unit) =>
      unit.id === 'u1'
        ? { ...unit, hasMoved: true, hasAttacked: false }
        : unit
    ),
  }

  const state = selectUnit(primed, 'u1')
  const unit = getUnitById(state, 'u1')
  assert.ok(unit)
  assert.equal(unit.hasAttacked, true)
  assert.equal(state.phase, Phase.SELECT_UNIT)
  assert.equal(state.selectedUnitId, null)
})

test('turn rollover when no actions remain for current player', () => {
  const base = createInitialGameState()
  const exhausted = {
    ...base,
    units: base.units.map((unit) =>
      unit.playerId === 'p1'
        ? { ...unit, hasMoved: true, hasAttacked: true }
        : unit
    ),
  }

  assert.equal(hasAvailableActionsForCurrentPlayer(exhausted), false)

  const next = endTurn(exhausted)
  assert.equal(next.currentPlayer, 'p2')
  assert.equal(next.phase, Phase.SELECT_UNIT)
  assert.equal(next.eventLog.at(-1)?.type, 'turn_end')
})

test('poison can eliminate unit at turn start and logs environment death before turn_end', () => {
  const base = createInitialGameState()
  const poisoned = {
    ...base,
    currentPlayer: 'p1' as const,
    currentPlayerIndex: 0,
    units: base.units.map((unit) =>
      unit.id === 'u4'
        ? {
            ...unit,
            health: 3,
            statusEffects: {
              ...unit.statusEffects,
              poisonTurns: 1,
            },
          }
        : unit
    ),
  }

  const next = endTurn(poisoned)
  const deathEventIndex = next.eventLog.findIndex((event) => event.type === 'death' && event.unitId === 'u4')
  const turnEndEventIndex = next.eventLog.findIndex((event) => event.type === 'turn_end')

  assert.ok(deathEventIndex >= 0)
  assert.ok(turnEndEventIndex >= 0)
  assert.ok(deathEventIndex < turnEndEventIndex)
  assert.equal(next.units.some((unit) => unit.id === 'u4'), false)
})

test('undo move keeps event ordering move then undo_move', () => {
  let state = createInitialGameState()
  state = selectUnit(state, 'u1')
  state = moveSelectedUnit(state, { x: 1, y: 2 })
  state = undoSelectedUnitMove(state, { x: 1, y: 1 })

  const lastTwo = state.eventLog.slice(-2).map((event) => event.type)
  assert.deepEqual(lastTwo, ['move', 'undo_move'])
})

test('skip attack logs no attack event but preserves available-actions checks', () => {
  let state = createInitialGameState()
  state = selectUnit(state, 'u1')
  state = moveSelectedUnit(state, { x: 1, y: 2 })

  const selected = getUnitById(state, state.selectedUnitId)
  assert.ok(selected)
  assert.equal(getAttackableEnemies(state, selected).length, 0)

  const preLogLength = state.eventLog.length
  const skipped = skipAttackForSelectedUnit(state)
  assert.equal(skipped.eventLog.length, preLogLength)
  assert.equal(hasAvailableActionsForCurrentPlayer(skipped), true)
})

test('target preview shows cover miss bonus when target is adjacent to blocked tile', () => {
  const base = createInitialGameState()
  const state = {
    ...base,
    units: base.units.map((unit) => {
      if (unit.id === 'u3') {
        return { ...unit, position: { x: 3, y: 1 }, hasMoved: true, hasAttacked: false }
      }
      if (unit.id === 'u4') {
        return { ...unit, position: { x: 3, y: 2 } }
      }
      return unit
    }),
    selectedUnitId: 'u3',
    phase: Phase.ATTACK,
  }

  const attacker = getUnitById(state, 'u3')
  const target = getUnitById(state, 'u4')
  const preview = getTargetingPreview(state, attacker, target)

  assert.ok(preview)
  assert.equal(preview.coverBonus, COVER_MISS_BONUS)
  assert.equal(preview.missChance, MISS_CHANCE + COVER_MISS_BONUS)
  assert.equal(preview.critChance, CRIT_CHANCE)
})

test('cover bonus can turn a borderline hit roll into miss', () => {
  const originalRandom = Math.random
  let calls = 0
  Math.random = () => {
    calls += 1
    return calls === 1 ? 0.20 : 0.5
  }

  try {
    const base = createInitialGameState()
    const state = {
      ...base,
      units: base.units.map((unit) => {
        if (unit.id === 'u3') {
          return { ...unit, position: { x: 3, y: 1 }, hasMoved: true, hasAttacked: false }
        }
        if (unit.id === 'u4') {
          return { ...unit, position: { x: 3, y: 2 }, health: 20 }
        }
        return unit
      }),
      selectedUnitId: 'u3',
      phase: Phase.ATTACK,
    }

    const resolution = resolveAttack(state, 'u4')
    assert.ok(resolution)
    assert.equal(resolution.outcome, 'miss')
    assert.equal(resolution.damage, 0)
  } finally {
    Math.random = originalRandom
  }
})

test('scout dash grants bonus movement for one move', () => {
  let state = createInitialGameState()
  state = selectUnit(state, 'u1')
  state = useActiveAbilityForSelectedUnit(state)

  const afterAbility = getUnitById(state, 'u1')
  assert.ok(afterAbility)
  assert.equal(afterAbility.hasUsedAbility, true)
  assert.equal(afterAbility.statusEffects.dashBonusMovement > 0, true)
  assert.equal(afterAbility.abilityCooldownRemaining > 0, true)

  // Scout base movement is 3, dash adds +2, so total movement is 5
  // Moving from (1,1) to (1,6) is blocked by u2 at (1,3), so move to (4,1) instead
  // Distance from (1,1) to (4,1) is 3, which should be reachable
  state = moveSelectedUnit(state, { x: 4, y: 1 })
  const afterMove = getUnitById(state, 'u1')
  assert.ok(afterMove)
  assert.equal(afterMove.position.x, 4)
  assert.equal(afterMove.position.y, 1)
  assert.equal(afterMove.statusEffects.dashBonusMovement, 0)
})

test('active abilities go on cooldown and refresh after N turns', () => {
  // Dash cooldown is 2 turns (see balance.ts)
  let state = createInitialGameState()

  state = selectUnit(state, 'u1')
  state = useActiveAbilityForSelectedUnit(state)

  let u1 = getUnitById(state, 'u1')
  assert.ok(u1)
  const initialCooldown = u1.abilityCooldownRemaining
  assert.ok(initialCooldown > 0)

  // End turn until player 1 is active again (two endTurn calls: p1->p2, p2->p1)
  state = endTurn(state)
  state = endTurn(state)

  u1 = getUnitById(state, 'u1')
  assert.ok(u1)
  assert.equal(u1.abilityCooldownRemaining, Math.max(0, initialCooldown - 1))

  // Another full round
  state = endTurn(state)
  state = endTurn(state)

  u1 = getUnitById(state, 'u1')
  assert.ok(u1)
  assert.equal(u1.abilityCooldownRemaining, Math.max(0, initialCooldown - 2))
})

test('bruiser guard reduces incoming damage', () => {
  const originalRandom = Math.random
  Math.random = () => 0.5
  try {
    const base = createInitialGameState()
    let guarded: GameState = {
      ...base,
      selectedUnitId: 'u5',
      currentPlayer: 'p2' as const,
      currentPlayerIndex: 1,
      units: base.units.map((u) =>
        u.id === 'u5' ? { ...u, position: { x: 2, y: 1 }, hasMoved: false, hasAttacked: false } : u
      ),
    }
    guarded = useActiveAbilityForSelectedUnit(guarded)

    const attackerState = {
      ...guarded,
      selectedUnitId: 'u1',
      currentPlayer: 'p1' as const,
      currentPlayerIndex: 0,
      phase: Phase.ATTACK,
      units: guarded.units.map((u) =>
        u.id === 'u1' ? { ...u, position: { x: 1, y: 1 }, hasMoved: true, hasAttacked: false } : u
      ),
    }

    const resolution = resolveAttack(attackerState, 'u5')
    assert.ok(resolution)
    assert.ok(resolution.damage < 20)
  } finally {
    Math.random = originalRandom
  }
})
