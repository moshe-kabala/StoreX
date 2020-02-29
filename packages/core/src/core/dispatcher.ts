export interface dependenceDispatcher {
  dispatcher: Dispatcher;
  links: {
    onEvents?: string[];
    invokes?: string[];
  }[];
}

export interface DispatcherArgs {
  events?: string[];
  dependencies?: (Dispatcher | dependenceDispatcher)[];
}

export interface DispatcherRegisterOptions {
  dispatcher: Dispatcher;
  on?: string[];
}

export class Dispatcher<T = any> {
  _is_async = false;
  _events;
  _waited_to_update_events = new Set();
  _waited_to_update_funcs = new Set<Function>();
  _dispatch_count = 0;
  _eventsRegisterFunc: { [key: string]: Set<(a: any) => any> } = {
    onChange: new Set()
  };

  context: T;

  constructor(
    { events, dependencies }: DispatcherArgs = { events: [], dependencies: [] }
  ) {
    // todo dependencies
    this._events = new Set(events);
    if (!this._events.has("onChange")) {
      this._events.add("onChange");
    }
    this.dispatch = this.dispatch.bind(this);
  }

  static register(
    func,
    dispatchers: (Dispatcher | DispatcherRegisterOptions)[]
  ) {
    const dis: any = dispatchers;
    for (const key in dis) {
      const val = dis[key];
      if (val && val.dispatch && val.register) {
        val.register(func);
      } else if (val || (val.dispatcher.dispatch && val.dispatcher.register)) {
        val.dispatcher.register(func, val.on);
      } else {
        throw Error("You must ot send dispatcher in resources arg");
      }
    }
  }

  dispatchOnce = async func => {
    this._dispatch_count++;
    try {
      const r = func();
      if (r instanceof Promise) {
        await r;
      }
      console.log("dic once");
      this._dispatch_count--;
      this.dispatch();
    } catch (err) {
      this._dispatch_count--;
      throw err;
    }
  };

  static unregister(
    func,
    dispatchers: (Dispatcher | DispatcherRegisterOptions)[]
  ) {
    const dis: any = dispatchers;
    for (const key in dis) {
      const val = dis[key];
      if (val && val.dispatch && val.unregister) {
        val.unregister(func);
      } else if (
        val ||
        (val.dispatcher.dispatch && val.dispatcher.unregister)
      ) {
        val.dispatcher.unregister(func, val.on);
      } else {
        throw Error("You must ot send dispatcher in resources arg");
      }
    }
  }

  _sentOnChange = () => this;

  register = (func: (a: this) => any, eventNames?: string[]) => {
    if (eventNames && eventNames.length) {
      eventNames.forEach(eventName => {
        if (!this._eventsRegisterFunc[eventName]) {
          this._eventsRegisterFunc[eventName] = new Set();
        }
        this._eventsRegisterFunc[eventName].add(func);
      });
    } else {
      this._eventsRegisterFunc.onChange.add(func);
    }
  };

  unregisterFromAll = func => {
    for (const event of Object.keys(this._eventsRegisterFunc)) {
      this._eventsRegisterFunc[event].delete(func);
    }
  };

  unregister = (func, eventNames?: string[]) => {
    if (eventNames && eventNames.length) {
      eventNames.forEach(eventName => {
        if (this._eventsRegisterFunc[eventName]) {
          this._eventsRegisterFunc[eventName].delete(func);
        }
      });
    } else {
      this._eventsRegisterFunc.onChange.delete(func);
    }
  };

  dispatch(eventNames?: string[]) {
    if (eventNames && !(eventNames instanceof Array)) {
      throw new TypeError(
        `[${getTypeName(
          this
        )}::dispatch]Events must to be array, got: ${getTypeName(eventNames)}`
      );
    }
    let funcs_array = [...this._eventsRegisterFunc.onChange];
    if (eventNames && eventNames.length) {
      eventNames.forEach(eventName => {
        if (this._eventsRegisterFunc[eventName]) {
          funcs_array = [
            ...funcs_array,
            ...this._eventsRegisterFunc[eventName]
          ];
        }
      });
    }

    this._waited_to_update_events = new Set([
      ...(eventNames || []),
      ...this._waited_to_update_events
    ]);

    this._waited_to_update_funcs = new Set([
      ...funcs_array,
      ...this._waited_to_update_funcs
    ]);

    if (this._dispatch_count === 0) {
      //setTimeout(() => {
      try {
        const message = this._sentOnChange();
        for (const func of this._waited_to_update_funcs) {
          func(message, this._waited_to_update_events);
        }
      } catch (err) {
        console.error(err);
      }
      this._waited_to_update_funcs = new Set();
      this._waited_to_update_events = new Set();
    }
  }
}

function getTypeName(arg) {
  if (arg && arg.constructor) {
    return arg.constructor.name;
  }
  return typeof arg;
}
