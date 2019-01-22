import { BaseCache, BaseCacheArgs } from "./base-cache";
import { createCollection, Collection, CollectionOptions } from "../collection";
import { flatKeys } from "@storex/utils/lib/schema";

interface CollectionCacheArgs extends BaseCacheArgs {
  id: ((item) => string | number) | string;
  schema?
  use_options?: boolean,
  validator?: (item: any) => any
}

export class CollectionCache extends BaseCache {
  protected _getId: (item) => string | number;
  data: Collection;
  _itemToId;
  _schema;
  _validator
  _use_options
  getSchema = () => {
    return this._schema
  }
  isValid = (item) => {
    if (this._validator) {
      return this._validator(item)
    }
  }
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
    this._schema = args.schema;
    this._validator = args.validator;
    this._use_options = args.use_options;
  }

  initData() {
    let options;
    if (this._use_options) {
      if (!this._schema) {
        throw new Error("[CollectionCache] you must to add schema if you set 'use_options: true'")
      }
      options = new CollectionOptions({
        fields: flatKeys(this._schema).filter(({ type }) => type !== "object")
      })
    }

    this.data = createCollection({ itemToId: this._itemToId, options });
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
