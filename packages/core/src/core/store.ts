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
  _events;
  _waited_to_update_funcs = new Set();
  _dispatch_count = 0;
  _eventsListenFunc: { [key: string]: Set<(a: any) => any> } = {
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

  static register(func, stores: Store[]) {
    for (const store of stores) {
      store.listen(func);
    }
  }

  _sentOnChange = () => this;

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

    this._waited_to_update_funcs = new Set([
      ...funcs_array,
      ...this._waited_to_update_funcs
    ]);

    if (this._dispatch_count === 0) {
      //setTimeout(() => {
        try {
          const message = this._sentOnChange();
          for (const func of this._waited_to_update_funcs) {
            func(message);
          }
        } catch (err) {
          console.error(err);
        }
        this._waited_to_update_funcs = new Set();
      //}, 0);
    }
  }

  destroy() {
    // todo
  }
}
