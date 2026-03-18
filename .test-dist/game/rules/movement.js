"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveMovement = getEffectiveMovement;
exports.calculateReachableTiles = calculateReachableTiles;
exports.calculateReachableTilesInState = calculateReachableTilesInState;
const config_1 = require("../config");
const selectors_1 = require("../selectors");
const pathfinding_1 = require("../pathfinding");
function getEffectiveMovement(unit) {
    const aimPenalty = unit.statusEffects.aimTurns > 0 ? config_1.SNIPER_AIM_MOVE_PENALTY : 0;
    return Math.max(1, unit.movement + unit.statusEffects.dashBonusMovement - aimPenalty);
}
function calculateReachableTiles(unit, gridSize) {
    if (!unit)
        return [];
    const range = getEffectiveMovement(unit);
    const tiles = [];
    for (let dx = -range; dx <= range; dx++) {
        for (let dy = -range; dy <= range; dy++) {
            const x = unit.position.x + dx;
            const y = unit.position.y + dy;
            if (x < 0 || y < 0 || x >= gridSize || y >= gridSize)
                continue;
            if (Math.abs(dx) + Math.abs(dy) <= range) {
                tiles.push({ x, y });
            }
        }
    }
    return tiles;
}
function calculateReachableTilesInState(state, unit) {
    if (!unit)
        return [];
    if (!(0, selectors_1.canUnitMove)(unit))
        return [];
    const effectiveMovement = getEffectiveMovement(unit);
    const reachable = [];
    // Check all positions within the movement range
    const range = effectiveMovement;
    for (let dx = -range; dx <= range; dx++) {
        for (let dy = -range; dy <= range; dy++) {
            const x = unit.position.x + dx;
            const y = unit.position.y + dy;
            if (x < 0 || y < 0 || x >= state.config.gridSize || y >= state.config.gridSize)
                continue;
            // Use A* to check if this position is reachable
            const result = (0, pathfinding_1.findPath)(state, unit.position, { x, y });
            if (result.canReach && result.distance <= effectiveMovement) {
                reachable.push({ x, y });
            }
        }
    }
    return reachable;
}
