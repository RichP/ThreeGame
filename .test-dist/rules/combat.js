"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdjacentToBlockedTile = isAdjacentToBlockedTile;
exports.getLineTiles = getLineTiles;
exports.hasLineOfSight = hasLineOfSight;
exports.getUnitAttackChances = getUnitAttackChances;
exports.calculateAttackableTilesInState = calculateAttackableTilesInState;
exports.getAttackableEnemies = getAttackableEnemies;
exports.getTargetingPreview = getTargetingPreview;
const config_1 = require("../config");
const selectors_1 = require("../selectors");
const utils_1 = require("../utils");
function isAdjacentToBlockedTile(state, position) {
    const adjacentPositions = [
        { x: position.x + 1, y: position.y },
        { x: position.x - 1, y: position.y },
        { x: position.x, y: position.y + 1 },
        { x: position.x, y: position.y - 1 },
    ];
    return adjacentPositions.some((adjacent) => (0, utils_1.isWithinBounds)(adjacent, state.config.gridSize) && (0, selectors_1.isBlockedTile)(state, adjacent));
}
function getLineTiles(from, to) {
    const tiles = [];
    let x0 = from.x;
    let y0 = from.y;
    const x1 = to.x;
    const y1 = to.y;
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
        tiles.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1)
            break;
        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
    return tiles;
}
function hasLineOfSight(state, from, to) {
    const lineTiles = getLineTiles(from, to);
    if (lineTiles.length <= 2)
        return true;
    for (let i = 1; i < lineTiles.length - 1; i++) {
        if ((0, selectors_1.isBlockedTile)(state, lineTiles[i]))
            return false;
    }
    return true;
}
function getUnitAttackChances(state, attacker, target) {
    const coverBonus = isAdjacentToBlockedTile(state, target.position) ? config_1.COVER_MISS_BONUS : 0;
    const critBonus = attacker.statusEffects.aimTurns > 0 ? config_1.SNIPER_AIM_CRIT_BONUS : 0;
    const missChance = (0, utils_1.clamp01)(config_1.MISS_CHANCE + coverBonus);
    const critChance = (0, utils_1.clamp01)(config_1.CRIT_CHANCE + critBonus);
    const hitChance = (0, utils_1.clamp01)(1 - missChance - critChance);
    return {
        missChance,
        hitChance,
        critChance,
        coverBonus,
    };
}
function calculateAttackableTilesInState(state, unit) {
    if (!unit)
        return [];
    if (!(0, selectors_1.canUnitAttack)(unit))
        return [];
    const range = unit.range;
    const tiles = [];
    for (let dx = -range; dx <= range; dx++) {
        for (let dy = -range; dy <= range; dy++) {
            const x = unit.position.x + dx;
            const y = unit.position.y + dy;
            const pos = { x, y };
            if (!(0, utils_1.isWithinBounds)(pos, state.config.gridSize))
                continue;
            if ((0, selectors_1.isBlockedTile)(state, pos))
                continue;
            if (Math.abs(dx) + Math.abs(dy) <= range && (dx !== 0 || dy !== 0)) {
                if (hasLineOfSight(state, unit.position, pos)) {
                    tiles.push(pos);
                }
            }
        }
    }
    return tiles;
}
function getAttackableEnemies(state, unit) {
    if (!unit)
        return [];
    const attackableTiles = calculateAttackableTilesInState(state, unit);
    const enemies = state.units.filter((u) => u.playerId !== unit.playerId &&
        attackableTiles.some((pos) => pos.x === u.position.x && pos.y === u.position.y));
    return enemies;
}
function getTargetingPreview(state, attacker, target) {
    if (!attacker || !target)
        return null;
    if (attacker.playerId === target.playerId)
        return null;
    if (!(0, selectors_1.canUnitAttack)(attacker))
        return null;
    if ((0, utils_1.manhattanDistance)(attacker.position, target.position) > attacker.range)
        return null;
    if (!hasLineOfSight(state, attacker.position, target.position))
        return null;
    const minDamage = Math.max(1, attacker.attack + config_1.DAMAGE_VARIANCE_MIN);
    const maxDamage = Math.max(1, attacker.attack + config_1.DAMAGE_VARIANCE_MAX);
    const minCritDamage = Math.max(1, Math.round(minDamage * config_1.CRIT_MULTIPLIER));
    const maxCritDamage = Math.max(1, Math.round(maxDamage * config_1.CRIT_MULTIPLIER));
    const chances = getUnitAttackChances(state, attacker, target);
    const armorReduction = target.statusEffects.armorUpTurns > 0 ? config_1.ARMOR_UP_DAMAGE_REDUCTION : 0;
    const guardReduction = target.statusEffects.guardTurns > 0 ? config_1.BRUISER_GUARD_DAMAGE_REDUCTION : 0;
    return {
        attackerId: attacker.id,
        targetId: target.id,
        missChance: chances.missChance,
        hitChance: chances.hitChance,
        critChance: chances.critChance,
        minDamage,
        maxDamage,
        minCritDamage,
        maxCritDamage,
        coverBonus: chances.coverBonus,
        effectiveCritChance: chances.critChance,
        breakdown: {
            baseAttack: attacker.attack,
            varianceRange: [config_1.DAMAGE_VARIANCE_MIN, config_1.DAMAGE_VARIANCE_MAX],
            critMultiplier: config_1.CRIT_MULTIPLIER,
            armorReduction,
            guardReduction,
        },
    };
}
