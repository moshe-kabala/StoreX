import { Store, update, StoreArgs } from "@storex/core";
import { CollectionStatus } from "./collection-status";
import { CollectionMeta,  } from "./collection-meta";


export enum DataGridEvents {
  DataChange = "data-change",
  StateChange = "state-change",
  MetaChange = "meta-change"
}

const e = DataGridEvents;

const _events = Object.keys(e);

export interface CollectionArgs extends StoreArgs {
  meta: CollectionMeta;
  status: CollectionStatus;
}

export class Collection extends Store {
  // meta;
  meta: CollectionMeta;
  status: CollectionStatus;

  private _itemsDir = {};
  private _items = [];
  private _viewItems; // contain the data after viewing
  private _is_items_need_to_render = true;
  private _is_view_items_need_to_render = true;

  constructor({ meta, status, events = [], dependencies = [] }: CollectionArgs) {
    super({ events: [...events, ..._events], dependencies });
    this.meta = meta;
  }

  @update([e.DataChange])
  add(item) {
    const id = this.meta.itemToId(item);
    this._itemsDir[id] = item;
    this._is_items_need_to_render = true;
  }

  @update([e.DataChange])
  remove(id) {
    if (this._itemsDir[id]) {
      delete this._itemsDir[id];
      this._is_items_need_to_render = true;
    }
  }

  
  override(items) {
    this.data = items;
  }

  @update([e.DataChange])
  set data(value) {
    if (!(value instanceof Array)) {
      throw new TypeError("Data must to be Array");
    }

    this._items = value;
    if (this.meta.itemToId) this.generateDicItem();
  }

  get data() {
    if (this._is_items_need_to_render) {
      this._is_items_need_to_render = false;
      this._updateItemsFromItemDir();
    }
    return this._items;
  }

  @update([e.DataChange])
  set itemsAsObj(value) {
    this._itemsDir = value;
    this._is_items_need_to_render = true;
  }

  get itemsAsObj() {
    return this._itemsDir;
  }

  @update([e.DataChange])
  private generateDicItem() {
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


export function createCollection(itemToId) {
  const meta = new CollectionMeta({itemToId});
  const status = new CollectionStatus();  
  return new Collection({meta, status});
}
