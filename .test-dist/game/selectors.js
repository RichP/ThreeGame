"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveAbilityId = getActiveAbilityId;
exports.getActiveAbilityName = getActiveAbilityName;
exports.getActiveAbilityCooldownTurns = getActiveAbilityCooldownTurns;
exports.getUnitById = getUnitById;
exports.getUnitAt = getUnitAt;
exports.isBlockedTile = isBlockedTile;
exports.isCurrentPlayersUnit = isCurrentPlayersUnit;
exports.canUnitMove = canUnitMove;
exports.canUnitAttack = canUnitAttack;
exports.canUseActiveAbility = canUseActiveAbility;
exports.getActiveAbilityAvailability = getActiveAbilityAvailability;
exports.hasUnitFinishedTurn = hasUnitFinishedTurn;
exports.hasAvailableActionsForCurrentPlayer = hasAvailableActionsForCurrentPlayer;
const balance_1 = require("./balance");
function getActiveAbilityId(unit) {
    switch (unit.archetype) {
        case 'scout':
            return 'dash';
        case 'bruiser':
            return 'guard';
        case 'sniper':
            return 'aim';
        default: {
            // Exhaustive safeguard; TS should prevent this.
            return 'dash';
        }
    }
}
function getActiveAbilityName(unit) {
    const id = getActiveAbilityId(unit);
    switch (id) {
        case 'dash':
            return 'Dash';
        case 'guard':
            return 'Guard';
        case 'aim':
            return 'Aim';
    }
}
function getActiveAbilityCooldownTurns(unit) {
    const id = getActiveAbilityId(unit);
    return balance_1.BALANCE_CONFIG.abilities[id].cooldown;
}
function getUnitById(state, id) {
    if (!id)
        return undefined;
    return state.units.find((unit) => unit.id === id);
}
function getUnitAt(state, position) {
    return state.units.find((unit) => unit.position.x === position.x && unit.position.y === position.y);
}
function isBlockedTile(state, position) {
    return state.config.blockedTiles.some((tile) => tile.x === position.x && tile.y === position.y);
}
function isCurrentPlayersUnit(state, unit) {
    return !!unit && unit.playerId === state.currentPlayer;
}
function canUnitMove(unit) {
    return !!unit && !unit.hasMoved;
}
function canUnitAttack(unit) {
    return !!unit && !unit.hasAttacked;
}
function canUseActiveAbility(unit) {
    if (!unit)
        return false;
    // Some abilities are intended to be used before movement to avoid confusion
    // (and because they modify movement budget).
    if (unit.archetype === 'scout' && unit.hasMoved)
        return false;
    if (unit.archetype === 'sniper' && unit.hasMoved)
        return false;
    const cooldownRemaining = unit.abilityCooldownRemaining ?? 0;
    if (cooldownRemaining > 0)
        return false;
    return !unit.hasUsedAbility;
}
function getActiveAbilityAvailability(unit) {
    if (!unit)
        return null;
    const abilityId = getActiveAbilityId(unit);
    const abilityName = getActiveAbilityName(unit);
    const cooldownTurns = getActiveAbilityCooldownTurns(unit);
    const cooldownRemaining = unit.abilityCooldownRemaining ?? 0;
    if (unit.hasUsedAbility) {
        return {
            abilityId,
            abilityName,
            cooldownTurns,
            cooldownRemaining,
            canUse: false,
            reason: 'Already used this turn',
        };
    }
    if (unit.archetype === 'scout' && unit.hasMoved) {
        return {
            abilityId,
            abilityName,
            cooldownTurns,
            cooldownRemaining,
            canUse: false,
            reason: 'Use before moving',
        };
    }
    if (unit.archetype === 'sniper' && unit.hasMoved) {
        return {
            abilityId,
            abilityName,
            cooldownTurns,
            cooldownRemaining,
            canUse: false,
            reason: 'Use before moving',
        };
    }
    if (cooldownRemaining > 0) {
        return {
            abilityId,
            abilityName,
            cooldownTurns,
            cooldownRemaining,
            canUse: false,
            reason: `On cooldown (${cooldownRemaining} turn${cooldownRemaining === 1 ? '' : 's'} remaining)`,
        };
    }
    return {
        abilityId,
        abilityName,
        cooldownTurns,
        cooldownRemaining,
        canUse: true,
    };
}
function hasUnitFinishedTurn(unit) {
    return !!unit && unit.hasMoved && unit.hasAttacked;
}
function hasAvailableActionsForCurrentPlayer(state) {
    return state.units.some((unit) => unit.playerId === state.currentPlayer && !hasUnitFinishedTurn(unit));
}
