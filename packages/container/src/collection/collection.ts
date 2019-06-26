import { Dispatcher, dispatch, DispatcherArgs } from "@storex/core";
import { CollectionStatus } from "./collection-status";
import { CollectionMeta } from "./collection-meta";
import { CollectionOptions, GetOptionArgs } from "./collection-option";

export enum DataGridEvents {
  DataChange = "data-change",
  StateChange = "state-change",
  MetaChange = "meta-change"
}

const e = DataGridEvents;

const _events = Object.keys(e);

export interface CollectionArgs extends DispatcherArgs {
  options?: CollectionOptions;
  meta: CollectionMeta;
  status: CollectionStatus;
}

export class Collection extends Dispatcher {
  // meta;
  meta: CollectionMeta;
  status: CollectionStatus;
  options: CollectionOptions;

  private _itemsDir = {};
  private _items = [];
  private _viewItems; // contain the data after viewing
  private _is_items_need_to_render = true;
  private _is_view_items_need_to_render = true;

  constructor({
    meta,
    status,
    options,
    events = [],
    dependencies = []
  }: CollectionArgs) {
    super({ events: [...events, ..._events], dependencies });
    this.meta = meta;
    this.status = status;
    this.options = options;
  }

  @dispatch([e.DataChange])
  addMany(items) {
    this.data = [...this.data, ...items];
  }

  @dispatch([e.DataChange])
  removeMany(items) {
    const idsToRemove = items.map(item => item.id);
    this.data = this.data.filter(item => idsToRemove.indexOf(item.id) == -1);
  }

  @dispatch([e.DataChange])
  add(item) {
    const id = this.meta.itemToId(item);
    this._itemsDir[id] = item;
    if (this.options) {
      this.options.addObj(item);
    }
    this._is_items_need_to_render = true;
  }

  @dispatch([e.DataChange])
  remove(id) {
    if (this._itemsDir[id]) {
      delete this._itemsDir[id];
      this._is_items_need_to_render = true;
    }
  }

  @dispatch([e.DataChange])
  update(item) {
    const id = this.meta.itemToId(item);
    if (this._itemsDir[id]) {
      this._itemsDir[id] = item;
      this._is_items_need_to_render = true;
    }
  }

  override(items) {
    this.data = items;
  }

  @dispatch([e.DataChange])
  set data(value) {
    if (!(value instanceof Array)) {
      throw new TypeError("Data must to be Array");
    }

    this._items = value;
    if (this.meta.itemToId) {
      this.generateDicItem();
      // remove
      this._items = Object.keys(this._itemsDir).map(k => this._itemsDir[k]);
    }

    if (this.options) {
      this.options.map(this._items);
    }
  }

  // wrap the options
  async getOptions({ key, path = "", query = "", limit = 50 }) {
    await this.data;
    return this.options.getOptions({ key, path, query, limit });
  }

  get data() {
    if (this._is_items_need_to_render) {
      this._is_items_need_to_render = false;
      this._updateItemsFromItemDir();
    }
    return this._items;
  }

  @dispatch([e.DataChange])
  set itemsAsObj(value) {
    this._itemsDir = value;
    this._is_items_need_to_render = true;
  }

  @dispatch([e.DataChange])
  clean() {
    this.data = [];
  }

  get itemsAsObj() {
    return this._itemsDir;
  }

  get = id => {
    return this._itemsDir[id];
  };

  @dispatch([e.DataChange])
  private generateDicItem() {
    // clear the item dir
    this._itemsDir = {};
    // fill it from the array
    for (const item of this._items) {
      let id = this.meta.itemToId(item);
      item.$id = id;
      this._itemsDir[id] = item;
    }
  }

  private _updateItemsFromItemDir() {
    var _items = [];
    Object.keys(this._itemsDir).forEach(id => {
      _items.push(this._itemsDir[id]);
    });
    this._items = _items;
  }
}

export function createCollection({ itemToId, options = undefined }) {
  const meta = new CollectionMeta({ itemToId });
  const status = new CollectionStatus();
  return new Collection({ meta, status, options });
}
