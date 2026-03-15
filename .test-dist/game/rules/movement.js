"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveMovement = getEffectiveMovement;
exports.calculateReachableTiles = calculateReachableTiles;
exports.calculateReachableTilesInState = calculateReachableTilesInState;
const config_1 = require("../config");
const selectors_1 = require("../selectors");
const utils_1 = require("../utils");
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
    const queue = [
        { pos: { ...unit.position }, distance: 0 },
    ];
    const visited = new Set([(0, utils_1.positionKey)(unit.position)]);
    const reachable = [];
    while (queue.length > 0) {
        const current = queue.shift();
        if (!current)
            break;
        const { pos, distance } = current;
        reachable.push(pos);
        if (distance >= getEffectiveMovement(unit))
            continue;
        const neighbors = [
            { x: pos.x + 1, y: pos.y },
            { x: pos.x - 1, y: pos.y },
            { x: pos.x, y: pos.y + 1 },
            { x: pos.x, y: pos.y - 1 },
        ];
        for (const next of neighbors) {
            if (!(0, utils_1.isWithinBounds)(next, state.config.gridSize))
                continue;
            if (visited.has((0, utils_1.positionKey)(next)))
                continue;
            if ((0, selectors_1.isBlockedTile)(state, next))
                continue;
            const occupiedUnit = (0, selectors_1.getUnitAt)(state, next);
            if (occupiedUnit && occupiedUnit.id !== unit.id)
                continue;
            visited.add((0, utils_1.positionKey)(next));
            queue.push({ pos: next, distance: distance + 1 });
        }
    }
    return reachable;
}
