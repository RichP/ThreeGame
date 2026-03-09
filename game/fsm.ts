export class FSM<S extends string> {
    public state: S;
    private readonly transitions: Record<S, ReadonlyArray<S>>;

    constructor(initialState: S, transitions: Record<S, ReadonlyArray<S>>) {
        this.state = initialState;
        this.transitions = transitions;
    }

    can(next: S): boolean {
        return this.transitions[this.state]?.includes(next) ?? false;
    }

    transition(next: S): S {
        if(!this.can(next)) {
            return this.state;
        }
        this.state = next;
        return this.state;
    }
}