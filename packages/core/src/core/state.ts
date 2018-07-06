import { Store, StoreArgs } from "./store";
import { update } from "./update";
import { fromJS } from "immutable";

export interface StateArsg extends StoreArgs {
    defaultState?: Object
    saveHistory?: boolean
}

export class State extends Store {
    _save_history;
    _history = [];
    _status_history = [];
    _status = {};
    _state;
    constructor(
        { defaultState, saveHistory, ...args }: StateArsg = { saveHistory: false, defaultState: {} }
    ) {
        super(args);
        this._save_history = saveHistory;
        this._state = fromJS(defaultState);
    }

    get state() {
        return this._state.toObject();
    }

    @update()
    set state(value) {
        const oldState = this._state;
        const newState = this._state.mergeDeep(value);
        if (this._save_history) {
            this._history.push(oldState);
        }
        this._state = newState;
    }

    setState(args) {
        this.state = args
    }
}


export function createState(defaultState?): State {
    return new State({ defaultState });
}