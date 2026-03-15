"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPersistedGameState = toPersistedGameState;
exports.fromPersistedGameState = fromPersistedGameState;
function toPersistedGameState(state) {
    const { phaseFSM: _phaseFSM, ...rest } = state;
    return rest;
}
function fromPersistedGameState(state, createPhaseFSM) {
    return {
        ...state,
        phaseFSM: createPhaseFSM(state.phase),
    };
}
