"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRUISER_GUARD_DAMAGE_REDUCTION = exports.SNIPER_AIM_MOVE_PENALTY = exports.SNIPER_AIM_CRIT_BONUS = exports.SCOUT_DASH_BONUS_MOVEMENT = exports.COVER_MISS_BONUS = exports.ARMOR_UP_DAMAGE_REDUCTION = exports.ARMOR_UP_DURATION_TURNS = exports.POISON_DURATION_TURNS = exports.POISON_DAMAGE_PER_TURN = exports.CRIT_MULTIPLIER = exports.DAMAGE_VARIANCE_MAX = exports.DAMAGE_VARIANCE_MIN = exports.CRIT_CHANCE = exports.MISS_CHANCE = exports.FIXED_MAP_PRESETS = exports.UNIT_START_POSITIONS = exports.MAP_PRESET_LABELS = exports.UNIT_ARCHETYPES = void 0;
const balance_1 = require("./balance");
const constants_1 = require("../constants");
exports.UNIT_ARCHETYPES = {
    scout: {
        archetype: 'scout',
        displayName: 'Scout',
        maxHealth: balance_1.BALANCE_CONFIG.archetypes.scout.hp * constants_1.CONSTANTS.GAME_CONFIG.UNIT_HEALTH_SCALE,
        movement: balance_1.BALANCE_CONFIG.archetypes.scout.move,
        attack: balance_1.BALANCE_CONFIG.archetypes.scout.attack,
        range: balance_1.BALANCE_CONFIG.archetypes.scout.range,
    },
    bruiser: {
        archetype: 'bruiser',
        displayName: 'Bruiser',
        maxHealth: balance_1.BALANCE_CONFIG.archetypes.heavy.hp * constants_1.CONSTANTS.GAME_CONFIG.UNIT_HEALTH_SCALE,
        movement: balance_1.BALANCE_CONFIG.archetypes.heavy.move,
        attack: balance_1.BALANCE_CONFIG.archetypes.heavy.attack,
        range: balance_1.BALANCE_CONFIG.archetypes.heavy.range,
    },
    sniper: {
        archetype: 'sniper',
        displayName: 'Sniper',
        maxHealth: balance_1.BALANCE_CONFIG.archetypes.soldier.hp * constants_1.CONSTANTS.GAME_CONFIG.UNIT_HEALTH_SCALE,
        movement: balance_1.BALANCE_CONFIG.archetypes.soldier.move,
        attack: balance_1.BALANCE_CONFIG.archetypes.soldier.attack,
        range: balance_1.BALANCE_CONFIG.archetypes.soldier.range,
    },
};
exports.MAP_PRESET_LABELS = {
    crossroads: 'Crossroads',
    lanes: 'Lanes',
    fortress: 'Fortress',
    'random-seeded': 'Random (Seeded)',
};
exports.UNIT_START_POSITIONS = [
    { x: 1, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 2 },
    { x: 6, y: 6 },
    { x: 6, y: 4 },
    { x: 5, y: 5 },
];
exports.FIXED_MAP_PRESETS = {
    crossroads: [
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 4, y: 3 },
        { x: 4, y: 4 },
    ],
    lanes: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 5, y: 3 },
        { x: 5, y: 4 },
        { x: 5, y: 5 },
    ],
    fortress: [
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 2, y: 3 },
        { x: 5, y: 3 },
        { x: 2, y: 4 },
        { x: 5, y: 4 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
    ],
};
// Combat system parameters from balance config
exports.MISS_CHANCE = balance_1.BALANCE_CONFIG.combat.minHitChance;
exports.CRIT_CHANCE = balance_1.BALANCE_CONFIG.combat.baseCritChance;
exports.DAMAGE_VARIANCE_MIN = constants_1.CONSTANTS.COMBAT.DAMAGE_VARIANCE_MIN;
exports.DAMAGE_VARIANCE_MAX = constants_1.CONSTANTS.COMBAT.DAMAGE_VARIANCE_MAX;
exports.CRIT_MULTIPLIER = balance_1.BALANCE_CONFIG.combat.critMultiplier;
exports.POISON_DAMAGE_PER_TURN = constants_1.CONSTANTS.COMBAT.POISON_DAMAGE_PER_TURN;
exports.POISON_DURATION_TURNS = constants_1.CONSTANTS.COMBAT.POISON_DURATION_TURNS;
exports.ARMOR_UP_DURATION_TURNS = constants_1.CONSTANTS.COMBAT.ARMOR_UP_DURATION_TURNS;
exports.ARMOR_UP_DAMAGE_REDUCTION = balance_1.BALANCE_CONFIG.combat.coverMitigation;
exports.COVER_MISS_BONUS = balance_1.BALANCE_CONFIG.combat.coverMitigation * constants_1.CONSTANTS.COMBAT.COVER_MISS_BONUS;
exports.SCOUT_DASH_BONUS_MOVEMENT = balance_1.BALANCE_CONFIG.abilities.dash.rangeBonus;
exports.SNIPER_AIM_CRIT_BONUS = balance_1.BALANCE_CONFIG.abilities.aim.critBonus;
exports.SNIPER_AIM_MOVE_PENALTY = balance_1.BALANCE_CONFIG.abilities.aim.movePenalty;
exports.BRUISER_GUARD_DAMAGE_REDUCTION = balance_1.BALANCE_CONFIG.abilities.guard.mitigation;
