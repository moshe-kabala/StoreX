import { BaseCache, BaseCacheArgs } from "./base-cache";
import { createCollection, Collection } from "../collection";

interface CollectionCacheArgs extends BaseCacheArgs {
  id: ((item) => string | number) | string;
}

export class CollectionCache extends BaseCache {
  protected _getId: (item) => string | number;
  data: Collection;
  _itemToId;
  constructor(args: CollectionCacheArgs) {
    super(args);
    let itemToId;
    if (typeof args.id === "string") {
      itemToId = getID.bind(null, args.id);
    } else if (typeof args.id === "function") {
      itemToId = args.id as any;
    } else {
      throw new TypeError(
        "[CollectionCache]:: the 'id' arg is in valid (should be string or function)"
      );
    }
    this._itemToId = itemToId;
  }

  initData(){
    this.data = createCollection({ itemToId: this._itemToId });
  };

  /**
   * set the cache
   *
   * @private
   * @returns
   * @memberof Cache
   */
  async set(d) {
    let len;
    if (d.data && d.length !== undefined) {
      const { data, length } = d;
      this.data.data = data;
      len = length;
    } else if (d instanceof Array) {
      this.data.data = d;
      len = d.length;
    } else {
      throw TypeError(
        "[CollectionCache]:: receiving unknown data, only <array> or {data: <array>, length: <number>} is valid"
      );
    }
    this.data.meta.length = len;
  }
}

function getID(key_id, item) {
  return item[key_id];
}
