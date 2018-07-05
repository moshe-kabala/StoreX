export interface dependenceStore {
  store: Store;
  links: {
    onEvents?: string[];
    invokes?: string[];
  }[];
}

export interface StoreArgs {
  events?: string[];
  dependencies?: (Store | dependenceStore)[];
}

export class Store {
  state = {};
  _events;
  _waited_to_update_funcs;
  _eventsListenFunc : { [key:string] : Set<(a: any) => any>}= {
    onChange: new Set()
  };

  constructor(
    { events, dependencies }: StoreArgs = { events: [], dependencies: [] }
  ) {
    // todo dependencies
    this._events = new Set(events);
    if (!this._events.has("onChange")) {
      this._events.add("onChange");
    }
  }

  getState() {
    return this.state;
  }

  listen(func: (a: this) => any, eventNames?: string[]) {
    if (eventNames) {
      eventNames.forEach(eventName => {
        if (!this._eventsListenFunc[eventName]) {
          this._eventsListenFunc[eventName] = new Set();
        }
        this._eventsListenFunc[eventName].add(func);
      });
    } else {
      this._eventsListenFunc.onChange.add(func);
    }
  }

  unlistenFromAll(func) {
    for (const event of Object.keys(this._eventsListenFunc)) {
      this._eventsListenFunc[event].delete(func);
    }
  }

  unlisten(func, eventNames?: string[]) {
    if (eventNames) {
      eventNames.forEach(eventName => {
        if (this._eventsListenFunc[eventName]) {
          this._eventsListenFunc[eventName].delete(func);
        }
      });
    } else {
      this._eventsListenFunc.onChange.delete(func);
    }
  }

  dispatch(eventNames?: string[]) {
    let funcs_array = [...this._eventsListenFunc.onChange];
    if (eventNames) {
      eventNames.forEach(eventName => {
        if (this._eventsListenFunc[eventName]) {
          funcs_array = [...funcs_array, ...this._eventsListenFunc[eventName]];
        }
      });
    }

    const funcs = new Set(funcs_array);

    if (!this._waited_to_update_funcs) {
      this._waited_to_update_funcs = funcs;
      setTimeout(() => {
        try {
            for (const func of this._waited_to_update_funcs) {
                func(this);
            }
        } catch (err) {
            console.error(err);
        }
        this._waited_to_update_funcs = undefined;
      }, 0);
    } else {
      this._waited_to_update_funcs = new Set([
        ...funcs,
        ...this._waited_to_update_funcs
      ]);
    }
  }

  destroy() {
    // todo
  }
}
