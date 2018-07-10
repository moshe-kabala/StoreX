import { Dispatcher, dispatch, DispatcherRegisterOptions } from "@storex/core";

export type SourcesOptions =
  | (Dispatcher | DispatcherRegisterOptions)[]
  | { [key: string]: Dispatcher }
  | { [key: string]: DispatcherRegisterOptions };

export interface ViewArgs {
  transform: (data: any[]) => any[];
  sources: SourcesOptions;
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
  loading = false;
  _is_need_to_update = true;
  _transform;
  _sources;
  _data;
  _is_updating = false;

  constructor({ sources, transform }: ViewArgs) {
    super(); // todo
    let _sources,
      _registerProps = [];
    if (sources instanceof Array) {
      _sources = [];
      for (let val of sources) {
        if (val instanceof Dispatcher) {
          _sources.push(val);
          _registerProps.push(val);
        } else if (val && val.dispatcher instanceof Dispatcher) {
          _sources.push(val.dispatcher);
          _registerProps.push(val);
        } else {
          throw Error("You must ot send dispatcher in resources arg");
        }
      }
    } else if (sources instanceof Object) {
      _sources = {};
      for (let key in sources) {
        const val = sources[key];
        if (val instanceof Dispatcher) {
          _sources[key] = val;
          _registerProps.push(val);
        } else if (val || val.dispatcher instanceof Dispatcher) {
          _registerProps.push(val);
        } else {
          throw Error("You must ot send dispatcher in resources arg");
        }
      }
    }
    Dispatcher.register(this.update, _registerProps);
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

  update = () => {
    if (this._is_updating) {
      return; // todo
    }
    this._is_updating = true;
    try {
      const result = this._transform(this._sources);
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
}

export function createView(args: ViewArgs) {
  return new View(args);
}
