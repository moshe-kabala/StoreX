import { Store, StoreArgs, update } from "@storex/core";
import { fromJS } from "immutable";

export interface StateArsg extends StoreArgs {
    defaultState?: Object
    saveHistory?: boolean
}

export class State extends Store {
    _save_history;
    _is_need_to_updated = true;
    _history;
    _status_history;
    _status = {};
    _state_cache
    _state;

    _sentOnChange = () => this.state;

    constructor(
        { defaultState, saveHistory, ...args }: StateArsg
    ) {
        super(args);
        
        if (saveHistory) {
            this._history = [];
            this._status_history = [];
        }
        this._save_history = saveHistory || false;
        this._state = fromJS(defaultState || {});
    }

    get state() {
        if (this._is_need_to_updated) {
            this._state_cache = this._state.toJS();
        }
        return this._state_cache
    }

    @update()
    set state(value) {
        const oldState = this._state;
        const newState = this._state.mergeDeep(value);
        if (this._save_history) {
            this._history.push(oldState);
        }
        this._state = newState;
        this._is_need_to_updated = true;
    }

    setState(args) {
        this.state = args
    }
}


export function createState(defaultState?): State {
    return new State({ defaultState });
}