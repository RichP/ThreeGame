"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWithinBounds = isWithinBounds;
exports.positionKey = positionKey;
exports.manhattanDistance = manhattanDistance;
exports.clamp = clamp;
exports.clamp01 = clamp01;
exports.randomIntInRange = randomIntInRange;
function isWithinBounds(position, gridSize) {
    return (position.x >= 0 &&
        position.y >= 0 &&
        position.x < gridSize &&
        position.y < gridSize);
}
function positionKey(position) {
    return `${position.x},${position.y}`;
}
function manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function clamp01(value) {
    return clamp(value, 0, 1);
}
function randomIntInRange(min, max, rng = Math.random) {
    return Math.floor(rng() * (max - min + 1)) + min;
}
