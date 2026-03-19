"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const gamestate_1 = require("./gamestate");
(0, node_test_1.default)('records move and undo_move events', () => {
    let state = (0, gamestate_1.createInitialGameState)();
    state = (0, gamestate_1.selectUnit)(state, 'u1');
    state = (0, gamestate_1.moveSelectedUnit)(state, { x: 1, y: 2 });
    strict_1.default.equal(state.eventLog.at(-1)?.type, 'move');
    strict_1.default.equal(state.phase, gamestate_1.Phase.ATTACK);
    state = (0, gamestate_1.undoSelectedUnitMove)(state, { x: 1, y: 1 });
    strict_1.default.equal(state.eventLog.at(-1)?.type, 'undo_move');
    strict_1.default.equal(state.phase, gamestate_1.Phase.MOVE_UNIT);
});
(0, node_test_1.default)('records attack and turn_end events', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.5;
    try {
        let state = (0, gamestate_1.createInitialGameState)();
        state = {
            ...state,
            units: state.units.map((unit) => {
                if (unit.id === 'u1') {
                    return { ...unit, position: { x: 1, y: 1 }, hasMoved: true };
                }
                if (unit.id === 'u4') {
                    return { ...unit, position: { x: 2, y: 1 }, health: 3 };
                }
                return unit;
            }),
            selectedUnitId: 'u1',
            phase: gamestate_1.Phase.ATTACK,
        };
        const resolution = (0, gamestate_1.resolveAttack)(state, 'u4');
        strict_1.default.ok(resolution);
        const attackedState = resolution.nextState;
        const attackEvent = attackedState.eventLog.at(-2);
        const deathEvent = attackedState.eventLog.at(-1);
        strict_1.default.equal(attackEvent?.type, 'attack');
        strict_1.default.equal(deathEvent?.type, 'death');
        const turnEndedState = (0, gamestate_1.endTurn)(attackedState);
        strict_1.default.equal(turnEndedState.eventLog.at(-1)?.type, 'turn_end');
    }
    finally {
        Math.random = originalRandom;
    }
});
(0, node_test_1.default)('auto-skip attack after move when no valid targets', () => {
    let state = (0, gamestate_1.createInitialGameState)({ autoSkipNoTargetAttack: true });
    state = (0, gamestate_1.selectUnit)(state, 'u1');
    strict_1.default.equal(state.phase, gamestate_1.Phase.MOVE_UNIT);
    state = (0, gamestate_1.moveSelectedUnit)(state, { x: 1, y: 2 });
    const movedUnit = (0, gamestate_1.getUnitById)(state, 'u1');
    strict_1.default.ok(movedUnit);
    strict_1.default.equal(movedUnit.hasMoved, true);
    strict_1.default.equal(movedUnit.hasAttacked, true);
    strict_1.default.equal(state.phase, gamestate_1.Phase.SELECT_UNIT);
    strict_1.default.equal(state.selectedUnitId, null);
    strict_1.default.equal(state.currentPlayer, 'p1');
});
(0, node_test_1.default)('auto-skip attack when selecting a unit already in attack phase with no targets', () => {
    const base = (0, gamestate_1.createInitialGameState)({ autoSkipNoTargetAttack: true });
    const primed = {
        ...base,
        units: base.units.map((unit) => unit.id === 'u1'
            ? { ...unit, hasMoved: true, hasAttacked: false }
            : unit),
    };
    const state = (0, gamestate_1.selectUnit)(primed, 'u1');
    const unit = (0, gamestate_1.getUnitById)(state, 'u1');
    strict_1.default.ok(unit);
    strict_1.default.equal(unit.hasAttacked, true);
    strict_1.default.equal(state.phase, gamestate_1.Phase.SELECT_UNIT);
    strict_1.default.equal(state.selectedUnitId, null);
});
(0, node_test_1.default)('turn rollover when no actions remain for current player', () => {
    const base = (0, gamestate_1.createInitialGameState)();
    const exhausted = {
        ...base,
        units: base.units.map((unit) => unit.playerId === 'p1'
            ? { ...unit, hasMoved: true, hasAttacked: true }
            : unit),
    };
    strict_1.default.equal((0, gamestate_1.hasAvailableActionsForCurrentPlayer)(exhausted), false);
    const next = (0, gamestate_1.endTurn)(exhausted);
    strict_1.default.equal(next.currentPlayer, 'p2');
    strict_1.default.equal(next.phase, gamestate_1.Phase.SELECT_UNIT);
    strict_1.default.equal(next.eventLog.at(-1)?.type, 'turn_end');
});
(0, node_test_1.default)('poison can eliminate unit at turn start and logs environment death before turn_end', () => {
    const base = (0, gamestate_1.createInitialGameState)();
    const poisoned = {
        ...base,
        currentPlayer: 'p1',
        currentPlayerIndex: 0,
        units: base.units.map((unit) => unit.id === 'u4'
            ? {
                ...unit,
                health: 3,
                statusEffects: {
                    ...unit.statusEffects,
                    poisonTurns: 1,
                },
            }
            : unit),
    };
    const next = (0, gamestate_1.endTurn)(poisoned);
    const deathEventIndex = next.eventLog.findIndex((event) => event.type === 'death' && event.unitId === 'u4');
    const turnEndEventIndex = next.eventLog.findIndex((event) => event.type === 'turn_end');
    strict_1.default.ok(deathEventIndex >= 0);
    strict_1.default.ok(turnEndEventIndex >= 0);
    strict_1.default.ok(deathEventIndex < turnEndEventIndex);
    strict_1.default.equal(next.units.some((unit) => unit.id === 'u4'), false);
});
(0, node_test_1.default)('undo move keeps event ordering move then undo_move', () => {
    let state = (0, gamestate_1.createInitialGameState)();
    state = (0, gamestate_1.selectUnit)(state, 'u1');
    state = (0, gamestate_1.moveSelectedUnit)(state, { x: 1, y: 2 });
    state = (0, gamestate_1.undoSelectedUnitMove)(state, { x: 1, y: 1 });
    const lastTwo = state.eventLog.slice(-2).map((event) => event.type);
    strict_1.default.deepEqual(lastTwo, ['move', 'undo_move']);
});
(0, node_test_1.default)('skip attack logs no attack event but preserves available-actions checks', () => {
    let state = (0, gamestate_1.createInitialGameState)();
    state = (0, gamestate_1.selectUnit)(state, 'u1');
    state = (0, gamestate_1.moveSelectedUnit)(state, { x: 1, y: 2 });
    const selected = (0, gamestate_1.getUnitById)(state, state.selectedUnitId);
    strict_1.default.ok(selected);
    strict_1.default.equal((0, gamestate_1.getAttackableEnemies)(state, selected).length, 0);
    const preLogLength = state.eventLog.length;
    const skipped = (0, gamestate_1.skipAttackForSelectedUnit)(state);
    strict_1.default.equal(skipped.eventLog.length, preLogLength);
    strict_1.default.equal((0, gamestate_1.hasAvailableActionsForCurrentPlayer)(skipped), true);
});
(0, node_test_1.default)('target preview shows cover miss bonus when target is adjacent to blocked tile', () => {
    const base = (0, gamestate_1.createInitialGameState)();
    const state = {
        ...base,
        units: base.units.map((unit) => {
            if (unit.id === 'u3') {
                return { ...unit, position: { x: 3, y: 1 }, hasMoved: true, hasAttacked: false };
            }
            if (unit.id === 'u4') {
                return { ...unit, position: { x: 3, y: 2 } };
            }
            return unit;
        }),
        selectedUnitId: 'u3',
        phase: gamestate_1.Phase.ATTACK,
    };
    const attacker = (0, gamestate_1.getUnitById)(state, 'u3');
    const target = (0, gamestate_1.getUnitById)(state, 'u4');
    const preview = (0, gamestate_1.getTargetingPreview)(state, attacker, target);
    strict_1.default.ok(preview);
    strict_1.default.equal(preview.coverBonus, gamestate_1.COVER_MISS_BONUS);
    strict_1.default.equal(preview.missChance, gamestate_1.MISS_CHANCE + gamestate_1.COVER_MISS_BONUS);
    strict_1.default.equal(preview.critChance, gamestate_1.CRIT_CHANCE);
});
(0, node_test_1.default)('cover bonus can turn a borderline hit roll into miss', () => {
    const originalRandom = Math.random;
    let calls = 0;
    Math.random = () => {
        calls += 1;
        return calls === 1 ? 0.20 : 0.5;
    };
    try {
        const base = (0, gamestate_1.createInitialGameState)();
        const state = {
            ...base,
            units: base.units.map((unit) => {
                if (unit.id === 'u3') {
                    return { ...unit, position: { x: 3, y: 1 }, hasMoved: true, hasAttacked: false };
                }
                if (unit.id === 'u4') {
                    return { ...unit, position: { x: 3, y: 2 }, health: 20 };
                }
                return unit;
            }),
            selectedUnitId: 'u3',
            phase: gamestate_1.Phase.ATTACK,
        };
        const resolution = (0, gamestate_1.resolveAttack)(state, 'u4');
        strict_1.default.ok(resolution);
        strict_1.default.equal(resolution.outcome, 'miss');
        strict_1.default.equal(resolution.damage, 0);
    }
    finally {
        Math.random = originalRandom;
    }
});
(0, node_test_1.default)('scout dash grants bonus movement for one move', () => {
    let state = (0, gamestate_1.createInitialGameState)();
    state = (0, gamestate_1.selectUnit)(state, 'u1');
    state = (0, gamestate_1.useActiveAbilityForSelectedUnit)(state);
    const afterAbility = (0, gamestate_1.getUnitById)(state, 'u1');
    strict_1.default.ok(afterAbility);
    strict_1.default.equal(afterAbility.hasUsedAbility, true);
    strict_1.default.equal(afterAbility.statusEffects.dashBonusMovement > 0, true);
    strict_1.default.equal(afterAbility.abilityCooldownRemaining > 0, true);
    // Scout base movement is 3, dash adds +2, so total movement is 5
    // Moving from (1,1) to (1,6) is blocked by u2 at (1,3), so move to (4,1) instead
    // Distance from (1,1) to (4,1) is 3, which should be reachable
    state = (0, gamestate_1.moveSelectedUnit)(state, { x: 4, y: 1 });
    const afterMove = (0, gamestate_1.getUnitById)(state, 'u1');
    strict_1.default.ok(afterMove);
    strict_1.default.equal(afterMove.position.x, 4);
    strict_1.default.equal(afterMove.position.y, 1);
    strict_1.default.equal(afterMove.statusEffects.dashBonusMovement, 0);
});
(0, node_test_1.default)('active abilities go on cooldown and refresh after N turns', () => {
    // Dash cooldown is 2 turns (see balance.ts)
    let state = (0, gamestate_1.createInitialGameState)();
    state = (0, gamestate_1.selectUnit)(state, 'u1');
    state = (0, gamestate_1.useActiveAbilityForSelectedUnit)(state);
    let u1 = (0, gamestate_1.getUnitById)(state, 'u1');
    strict_1.default.ok(u1);
    const initialCooldown = u1.abilityCooldownRemaining;
    strict_1.default.ok(initialCooldown > 0);
    // End turn until player 1 is active again (two endTurn calls: p1->p2, p2->p1)
    state = (0, gamestate_1.endTurn)(state);
    state = (0, gamestate_1.endTurn)(state);
    u1 = (0, gamestate_1.getUnitById)(state, 'u1');
    strict_1.default.ok(u1);
    strict_1.default.equal(u1.abilityCooldownRemaining, Math.max(0, initialCooldown - 1));
    // Another full round
    state = (0, gamestate_1.endTurn)(state);
    state = (0, gamestate_1.endTurn)(state);
    u1 = (0, gamestate_1.getUnitById)(state, 'u1');
    strict_1.default.ok(u1);
    strict_1.default.equal(u1.abilityCooldownRemaining, Math.max(0, initialCooldown - 2));
});
(0, node_test_1.default)('bruiser guard reduces incoming damage', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.5;
    try {
        const base = (0, gamestate_1.createInitialGameState)();
        let guarded = {
            ...base,
            selectedUnitId: 'u5',
            currentPlayer: 'p2',
            currentPlayerIndex: 1,
            units: base.units.map((u) => u.id === 'u5' ? { ...u, position: { x: 2, y: 1 }, hasMoved: false, hasAttacked: false } : u),
        };
        guarded = (0, gamestate_1.useActiveAbilityForSelectedUnit)(guarded);
        const attackerState = {
            ...guarded,
            selectedUnitId: 'u1',
            currentPlayer: 'p1',
            currentPlayerIndex: 0,
            phase: gamestate_1.Phase.ATTACK,
            units: guarded.units.map((u) => u.id === 'u1' ? { ...u, position: { x: 1, y: 1 }, hasMoved: true, hasAttacked: false } : u),
        };
        const resolution = (0, gamestate_1.resolveAttack)(attackerState, 'u5');
        strict_1.default.ok(resolution);
        strict_1.default.ok(resolution.damage < 20);
    }
    finally {
        Math.random = originalRandom;
    }
});
