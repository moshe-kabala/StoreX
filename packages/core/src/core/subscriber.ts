import { Dispatcher, dispatch, DispatcherRegisterOptions } from "./";

export interface SubscriberDispatcherRegisterOptions
  extends DispatcherRegisterOptions {
  name: string
  onDispatch?: {
    pre?: Function;
    post?: Function;
  };
}

export type SubscriberTransform = (
  dispatchers: Dispatcher[] | { [key: string]: Dispatcher },
  { context, oldData }
) => any;

export type DispatcherOptions =
  | (Dispatcher | SubscriberDispatcherRegisterOptions)[]
  | { [key: string]: Dispatcher }
  | { [key: string]: SubscriberDispatcherRegisterOptions };

export interface SubscriberArgs {
  to: DispatcherOptions;
}

export interface SubscriberMeta {}

export interface SubscriberStatus {}

/**
 *
 *
 * @export
 * @class Subscriber
 */
export class Subscriber extends Dispatcher {
    
  _is_need_to_update = true;
  _sources;
  _unregisterFunc = [];
  _data;
  _is_updating = false;
  context: any = {};
  static _functions_to_updates = []

  constructor({ to }: SubscriberArgs) {
    super(); // todo
    let _sources,
      _registerProps = [],
      _specificRegisterProps = [];

    if (to instanceof Array) {
      _sources = [];
      for (const i in to) {
        const val: any = to[i];
        if (val && val.dispatcher instanceof Object) {
          // Dispatcher
          _sources.push(val.dispatcher);
          if (val.onDispatch) {
            _specificRegisterProps.push(val);
          } else {
            _registerProps.push(val);
          }
        } else if (val && val.dispatch && val.register) {
          // Dispatcher
          _sources.push(val);
          _registerProps.push(val);
        } else {
          throw new TypeError("You must ot send dispatcher in resources arg");
        }
      }
    } else if (to instanceof Object) {
      _sources = {};
      for (let key in to) {
        const val: any = to[key];
        if (val && val.dispatch && val.register) {
          // Dispatcher
          _sources[key] = val;
          _registerProps.push(val);
        } else if (val && val.dispatcher instanceof Object) {
          // Dispatcher
          _sources[key] = val.dispatcher;
          if (val.onDispatch) {
            _specificRegisterProps.push(val);
          } else {
            _registerProps.push(val);
          }
        } else {
          throw Error("You must ot send dispatcher in resources arg");
        }
      }
    }
    Dispatcher.register(this._update, _registerProps);
    this._unregisterFunc.push(() =>
      Dispatcher.unregister(this._update, _registerProps)
    );

    if (_specificRegisterProps.length > 0) {
      for (let o of _specificRegisterProps) {
        const func = this._preAndPostUpdate(o);
        o.dispatcher.register(func, o.on);
        this._unregisterFunc.push(() => o.dispatcher.unregisterFromAll(func));
      }
    }
    this._sources = _sources;
  }

  subscribe(dispatcher) { // todo

  }

  getPostAndPreArgs() {
      return {context: this.context};
  };

  _preAndPostUpdate = (options: SubscriberDispatcherRegisterOptions) => (
    eventsData,
    events
  ) => {
    if (this._is_updating) {
      return; // todo
    }
    try {
      const { pre, post } = options.onDispatch;
      // let isUpdate
      let args = this.getPostAndPreArgs()
      if (pre) {
        this._is_updating = true;
        pre(this._sources, { eventsData, events, ...args});
        this._is_updating = false;
      }

      this._update();

      if (post) {
        this._is_updating = true;
        post(this._sources, { eventsData, events, ...args });
        this._is_updating = false;
      }
    } catch (err) {
      console.error(err);
      this._is_updating = false;
    }
  };

  _update = () => {
    if (this._is_updating) {
      return; // todo
    }
    this._is_updating = true;
    try {
     Subscriber._functions_to_updates.forEach(func => func.call(this, ))
    } catch (err) {
      console.error("Failed to update the Subscriber", err);
    }
    this._is_updating = false;
  };

  destroy() {
    this._unregisterFunc.forEach(func => func());
  }
}

export function Sreatesubscriber(args: SubscriberArgs) {
  return new Subscriber(args);
}
