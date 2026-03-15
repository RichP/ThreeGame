"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitById = getUnitById;
exports.getUnitAt = getUnitAt;
exports.isBlockedTile = isBlockedTile;
exports.isCurrentPlayersUnit = isCurrentPlayersUnit;
exports.canUnitMove = canUnitMove;
exports.canUnitAttack = canUnitAttack;
exports.canUseActiveAbility = canUseActiveAbility;
exports.hasUnitFinishedTurn = hasUnitFinishedTurn;
exports.hasAvailableActionsForCurrentPlayer = hasAvailableActionsForCurrentPlayer;
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
    return !!unit && !unit.hasUsedAbility;
}
function hasUnitFinishedTurn(unit) {
    return !!unit && unit.hasMoved && unit.hasAttacked;
}
function hasAvailableActionsForCurrentPlayer(state) {
    return state.units.some((unit) => unit.playerId === state.currentPlayer && !hasUnitFinishedTurn(unit));
}
