import type { GameState, Phase } from './gamestate'
import type { FSM } from './fsm'

export type PersistedGameState = Omit<GameState, 'phaseFSM'>

export function toPersistedGameState(state: GameState): PersistedGameState {
  const { phaseFSM: _phaseFSM, ...rest } = state
  return rest
}

export function fromPersistedGameState(
  state: PersistedGameState,
  createPhaseFSM: (phase: Phase) => FSM<Phase>,
): GameState {
  return {
    ...state,
    phaseFSM: createPhaseFSM(state.phase),
  }
}
