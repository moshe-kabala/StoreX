import { Store, update } from "@storex/core";

export interface ViewArgs {
  transform: (data: any[]) => any[];
  sources;
}

export interface ViewMeta {}

export interface ViewStatus {}

/**
 *
 *
 * @export
 * @class View
 */
export class View extends Store {
  loading = false;
  _is_need_to_update = true;
  _transform;
  _sources;
  _data;

  constructor({ sources, transform }: ViewArgs) {
    super(); // todo
    Store.register(this.update, sources);
    this._transform = transform;
    this._sources = sources;
  }
  @update()
  set data(value) {
    this._data = value;
  }

  get data() {
    return this._data;
  }

  update = () => {
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
  };
}

export function createView(args: ViewArgs) {
  return new View(args);
}
