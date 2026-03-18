"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPath = findPath;
exports.canReachPosition = canReachPosition;
exports.getShortestPathToPosition = getShortestPathToPosition;
const selectors_1 = require("./selectors");
const utils_1 = require("./utils");
function findPath(state, start, goal) {
    // If start and goal are the same, return empty path
    if (start.x === goal.x && start.y === goal.y) {
        return {
            path: [],
            canReach: true,
            distance: 0
        };
    }
    // Check if goal is within bounds and not blocked
    if (!(0, utils_1.isWithinBounds)(goal, state.config.gridSize) || (0, selectors_1.isBlockedTile)(state, goal)) {
        return {
            path: [],
            canReach: false,
            distance: Infinity
        };
    }
    // Check if goal is occupied by another unit
    const goalUnit = (0, selectors_1.getUnitAt)(state, goal);
    if (goalUnit) {
        return {
            path: [],
            canReach: false,
            distance: Infinity
        };
    }
    const openSet = new Map();
    const closedSet = new Set();
    // Initialize start node
    const startNode = {
        position: { ...start },
        g: 0,
        h: manhattanHeuristic(start, goal),
        f: manhattanHeuristic(start, goal),
        parent: null
    };
    openSet.set((0, utils_1.positionKey)(start), startNode);
    // Directions: North, South, East, West (no diagonals)
    const directions = [
        { x: 0, y: 1 }, // North
        { x: 0, y: -1 }, // South
        { x: 1, y: 0 }, // East
        { x: -1, y: 0 } // West
    ];
    while (openSet.size > 0) {
        // Find node with lowest f score
        let current = null;
        let lowestF = Infinity;
        for (const node of openSet.values()) {
            if (node.f < lowestF) {
                lowestF = node.f;
                current = node;
            }
        }
        if (!current)
            break;
        // Remove current from open set and add to closed set
        openSet.delete((0, utils_1.positionKey)(current.position));
        closedSet.add((0, utils_1.positionKey)(current.position));
        // Check if we reached the goal
        if (current.position.x === goal.x && current.position.y === goal.y) {
            return reconstructPath(current);
        }
        // Explore neighbors
        for (const dir of directions) {
            const neighborPos = {
                x: current.position.x + dir.x,
                y: current.position.y + dir.y
            };
            const neighborKey = (0, utils_1.positionKey)(neighborPos);
            // Skip if already evaluated
            if (closedSet.has(neighborKey))
                continue;
            // Skip if out of bounds or blocked
            if (!(0, utils_1.isWithinBounds)(neighborPos, state.config.gridSize) || (0, selectors_1.isBlockedTile)(state, neighborPos))
                continue;
            // Skip if occupied by another unit
            const neighborUnit = (0, selectors_1.getUnitAt)(state, neighborPos);
            if (neighborUnit)
                continue;
            // Calculate tentative g score
            const tentativeG = current.g + 1; // Each step costs 1
            const existingNode = openSet.get(neighborKey);
            if (!existingNode || tentativeG < existingNode.g) {
                const neighborNode = {
                    position: neighborPos,
                    g: tentativeG,
                    h: manhattanHeuristic(neighborPos, goal),
                    f: tentativeG + manhattanHeuristic(neighborPos, goal),
                    parent: current
                };
                openSet.set(neighborKey, neighborNode);
            }
        }
    }
    // No path found
    return {
        path: [],
        canReach: false,
        distance: Infinity
    };
}
function manhattanHeuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function reconstructPath(node) {
    const path = [];
    let current = node;
    while (current !== null) {
        path.unshift(current.position);
        current = current.parent;
    }
    // Remove the starting position from the path
    if (path.length > 0) {
        path.shift();
    }
    return {
        path,
        canReach: true,
        distance: path.length
    };
}
function canReachPosition(state, start, goal, maxDistance) {
    const result = findPath(state, start, goal);
    return result.canReach && result.distance <= maxDistance;
}
function getShortestPathToPosition(state, start, goal, maxDistance) {
    const result = findPath(state, start, goal);
    if (result.canReach && result.distance <= maxDistance) {
        return result.path;
    }
    return [];
}
