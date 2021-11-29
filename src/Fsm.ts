import { Lookup } from "./GenericTypes";

export type GuardType<StateType> = (
  context: any,
  currentState: StateType
) => boolean;

export type StateFunction<StateType> = (
  context: any,
  previousState: StateType
) => void;

interface Hashable {
  toString: () => string;
}

export class Fsm<StateType extends Hashable> {
  transitionTable: Lookup<Lookup<[StateType, GuardType<StateType>]>> = {};
  stateLookup: Lookup<[StateType, StateFunction<StateType>]> = {};
  currentState: StateType;

  constructor(defaultState: StateType) {
    this.addState(defaultState);
    this.currentState = defaultState;
  }

  addState(state: StateType, stateFn: StateFunction<StateType> = () => null) {
    this.stateLookup[state.toString()] = [state, stateFn];
  }

  addTransition(from: StateType, to: StateType, guard: GuardType<StateType>) {
    const fKey = from.toString();
    const tKey = to.toString();
    this.transitionTable[fKey] = this.transitionTable[fKey] || {};
    this.transitionTable[fKey][tKey] = [to, guard];
  }

  process(context: any) {
    for (const [nextState, guard] of Object.values(
      this.transitionTable[this.currentState.toString()]
    )) {
      if (guard(context, this.currentState)) {
        const prevState = this.currentState;
        this.currentState = nextState;
        this.stateLookup[nextState.toString()][1](context, prevState);
        return;
      }
    }
  }
}
