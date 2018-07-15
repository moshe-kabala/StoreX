import { Dispatcher, dispatch, DispatcherRegisterOptions } from "@storex/core";

export interface ViewDispatcherRegisterOptions
  extends DispatcherRegisterOptions {
  onDispatch?: {
    pre?: Function;
    post?: Function;
  };
}

export type ViewTransform = (dispatchers: Dispatcher[] | {[key: string]: Dispatcher}, {context, oldData} ) => any;

export type DispatcherOptions =
  | (Dispatcher | ViewDispatcherRegisterOptions)[]
  | { [key: string]: Dispatcher }
  | { [key: string]: ViewDispatcherRegisterOptions };

export interface ViewArgs {
  transform: ViewTransform;
  dispatchers: DispatcherOptions;
}

export interface ViewMeta {}

export interface ViewStatus {}

/**
 *
 *
 * @export
 * @class View
 */
export class View extends Dispatcher {
  _is_need_to_update = true;
  _transform;
  _sources;
  _unregisterFunc = [];
  _data;
  _is_updating = false;
  context: any = {};

  constructor({ dispatchers, transform }: ViewArgs) {
    super(); // todo
    let _sources,
      _registerProps = [],
      _specificRegisterProps = [];

    if (dispatchers instanceof Array) {
      _sources = [];
      for (let val of dispatchers) {
        if (val instanceof Dispatcher) {
          _sources.push(val);
          _registerProps.push(val);
        } else if (val && val.dispatcher instanceof Dispatcher) {
          _sources.push(val.dispatcher);
          if (val.onDispatch) {
            _specificRegisterProps.push(val);
          } else {
            _registerProps.push(val);
          }
        } else {
          throw Error("You must ot send dispatcher in resources arg");
        }
      }
    } else if (dispatchers instanceof Object) {
      _sources = {};
      for (let key in dispatchers) {
        const val = dispatchers[key];
        if (val instanceof Dispatcher) {
          _sources[key] = val;
          _registerProps.push(val);
        } else if (val && val.dispatcher instanceof Dispatcher) {
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
    Dispatcher.register(this.update, _registerProps);
    this._unregisterFunc.push(()=>Dispatcher.unregister(this.update, _registerProps));

    if (_specificRegisterProps.length > 0) {
      for(let o of _specificRegisterProps) {
        const func = this._preAndPostUpdate(o);
        o.dispatcher.register(func, o.on);
        this._unregisterFunc.push(()=>o.dispatcher.unregisterFromAll(func));
      }
    }
    this._sources = _sources;
    this._transform = transform;
  }

  @dispatch()
  set data(value) {
    this._data = value;
  }

  get data() {
    return this._data;
  }

  _preAndPostUpdate = (options: ViewDispatcherRegisterOptions) => (
    eventsData,
    events
  ) => {
    if (this._is_updating) {
      return; // todo
    }
    try {

      const { pre, post } = options.onDispatch;
      // let isUpdate
      let { data, context } = this;
      if (pre) {
        this._is_updating = true;
        pre(this._sources, { eventsData, events, data, context });
        this._is_updating = false;
      }
      data = this.data;
      context = this.data
      
      this.update();
      
      if (post) {
        this._is_updating = true;
        post(this._sources, { eventsData, events, data, context });
        this._is_updating = false;
      }
    } catch (err) {
      console.error(err);
      this._is_updating = false
    }
  };

  update = () => {
    if (this._is_updating) {
      return; // todo
    }
    this._is_updating = true;
    try {
      const result = this._transform(this._sources, {
        oldData: this.data,
        context: this.context
      });
      if (!(result instanceof Promise)) {
        this.data = result;
      } else {
        result.then(
          r => (this.data = r),
          err => console.error("Failed to update the View", err)
        );
      }
    } catch (err) {
      console.error("Failed to update the View", err);
    }
    this._is_updating = false;
  };

  destroy() {
    this._unregisterFunc.forEach(func=> func());
  }
}

export function createView(args: ViewArgs) {
  return new View(args);
}
