"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSM = void 0;
class FSM {
    constructor(initialState, transitions) {
        this.state = initialState;
        this.transitions = transitions;
    }
    can(next) {
        return this.transitions[this.state]?.includes(next) ?? false;
    }
    transition(next) {
        if (!this.can(next)) {
            return this.state;
        }
        this.state = next;
        return this.state;
    }
}
exports.FSM = FSM;
