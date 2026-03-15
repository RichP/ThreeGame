"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTurnStartStatusTick = applyTurnStartStatusTick;
exports.applyTurnStartClassBuffs = applyTurnStartClassBuffs;
const config_1 = require("../config");
function applyTurnStartStatusTick(unit) {
    const nextPoisonTurns = Math.max(0, unit.statusEffects.poisonTurns - 1);
    const poisonDamage = unit.statusEffects.poisonTurns > 0 ? config_1.POISON_DAMAGE_PER_TURN : 0;
    const nextHealth = Math.max(0, unit.health - poisonDamage);
    return {
        ...unit,
        health: nextHealth,
        statusEffects: {
            ...unit.statusEffects,
            poisonTurns: nextPoisonTurns,
            armorUpTurns: Math.max(0, unit.statusEffects.armorUpTurns - 1),
            guardTurns: Math.max(0, unit.statusEffects.guardTurns - 1),
            aimTurns: Math.max(0, unit.statusEffects.aimTurns - 1),
            dashBonusMovement: 0,
        },
    };
}
function applyTurnStartClassBuffs(unit) {
    if (unit.archetype !== 'bruiser')
        return unit;
    // Only apply armor buff if the unit is on the current player's turn
    // This function is called during endTurn() for the NEXT player's units,
    // so we only want to apply the buff to units that will be acting next
    return {
        ...unit,
        statusEffects: {
            ...unit.statusEffects,
            armorUpTurns: Math.max(unit.statusEffects.armorUpTurns, config_1.ARMOR_UP_DURATION_TURNS),
        },
    };
}
