import { EventEmitter } from "events";

var SAVE_CACHE = true;

export interface BaseCacheArgs {
  delay?: number;
  getOnInit?: boolean;
  lazy?: boolean;
  lazyDelay?: number;
  name: string;
  getData?: () => Promise<object | Array<any>>;
  translateCache?: ({ preData, newData, roots }) => any;
  rootCaches?: BaseCache | { [key: string]: BaseCache };
}

const CACHES = new Set<IBaseCache>();

export interface IBaseCache {
  isNeedToUpdate;
  init:()=>void;
  get();
  remove();
  set(data);
  needToUpdate();
}

export abstract class BaseCache extends EventEmitter implements IBaseCache {
  protected _is_failed;
  protected _onUpdateOnce = [];
  protected _isUpdating = false;
  protected _rootCaches?: BaseCache | { [key: string]: BaseCache };
  protected _translateCache;
  protected _delay;
  protected _name: string;
  protected _lazy_delay;
  protected _lazy;
  protected _getData;
  protected _getOnInit: boolean;
  protected _labelCounts = {};
  protected _updatedDate = 0;
  protected _changeDate = 0;

  data: any;

  // event
  onChange;

  abstract set(data);
  abstract initData();

  constructor(args: BaseCacheArgs) {
    super();
    if (!args.getData && (!args.rootCaches || !args.translateCache)) {
      throw new Error(
        `You must set either args.getData or 'args.rootCache' and 'args.translateCache'`
      );
    }
    this._is_failed = false;
    this._name = args.name;
    this._getData = args.getData;
    this._rootCaches = args.rootCaches;
    this._registerToRoots(this._rootCaches);
    this._translateCache = args.translateCache;
    this._delay = args.delay || 1000;
    this._lazy = !(args.lazy === false);
    this._lazy_delay = args.lazyDelay;
    CACHES.add(this);
    setTimeout(this.init.bind(this));
  }

  static init() {
    for (const cache of CACHES) {
      cache.init();
    }
  }

  init = () => {
    this._updatedDate = 0;
    this._changeDate = 0;
    this.initData();
    if (this._getOnInit) {
      setTimeout(() => {
        this.needToUpdate();
        this.get();
      });
    }
  };

  /**
   * get the cache
   *
   * @param {boolean} [asObject]
   * @returns
   * @memberof BaseCache
   */
  async get() {
    if (this.isNeedToUpdate && !this._isUpdating) {
      try {
        await this._get_and_set();
      } catch (e) {
        console.error(`[Cache::${this._name}] Failed to get new data`, e);
        return Promise.reject(e);
      }
    } else if (this._isUpdating) {
      // if already updating.
      let a = null;
      return new Promise((resolve, reject) => {
        this._onUpdateOnce.push((data, err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });
      });
    } else if (this._is_failed) {
      try {
        await this._get_and_set();
      } catch (e) {
        console.error(`[Cache::${this._name}] Failed to get new data`, e);
        return Promise.reject(e);
      }
    }

    return this.data;
  }

  _registerToRoots = roots => {
    const register = cache => {
      if (cache instanceof BaseCache) {
        cache.on("need-to-update", this.needToUpdate);
      } else {
        throw new TypeError(
          "[Cache::_registerToRoots] The cacheRoot must be either array of Cache or object that all values are Cache"
        );
      }
    };
    if (roots instanceof Array) {
      for (const cache of roots) {
        register(cache);
      }
    } else if (typeof roots === "object") {
      for (const key in roots) {
        register(roots[key]);
      }
    } else if (roots) {
      throw new TypeError(
        "[Cache::_registerToRoots] The cacheRoot must be either array of Cache or object that all values are Cache"
      );
    }
  };

  get isNeedToUpdate() {
    let rootCache = false;
    if (!this._updatedDate || this.data === undefined) {
      return true;
    }

    // if (this._rootCache) {
    //   rootCache = this._rootCache.isNeedToUpdate;
    // }

    return this._changeDate > this._updatedDate || rootCache;
  }

  /**
   *
   *
   * @param {boolean} [asObject]
   * @returns
   * @memberof BaseCache
   */
  async getCopy() {
    return clone(await this.get());
  }

  /**
   * remove the cache
   *
   * @memberof BaseCache
   */
  async remove() {
    // this._cacheDir = undefined; // todo;
  }

  destructor() {
    CACHES.delete(this);
  }

  /**
   * update that some changes are detected and cache need to be updated.
   *
   * @memberof BaseCache
   */
  needToUpdate = (msg?) => {
    if (SAVE_CACHE === true) {
      this._changeDate = Date.now();
      console.log(`[Cache::${this._name}] Data need to update`);
      this.emit("need-to-update", msg);
    } else {
      console.warn(
        `[Cache::${
          this._name
        }] Ths cache will not update because process.env.save_cache !== "true"`
      );
    }
  };

  /**
   * update the cache
   *
   * @private
   * @returns
   * @memberof BaseCache
   */
  async _get_and_set() {
    this._isUpdating = true;
    const preUpdateTime = this._updatedDate;
    this._updatedDate = Date.now();
    // if delay
    if (typeof this._delay === "number") {
      let interval = Date.now() - (this._changeDate || 0);
      if (interval < this._delay) {
        await sleep(this._delay - interval);
      }
    }
    this._updatedDate = Date.now();
    console.log(`[Cache::${this._name}] Fetching data`);
    let data;
    if (typeof this._getData === "function") {
      try {
        data = await this._getData();
      } catch (e) {
        return onCatch.apply(this, [e]);
      }
    }
    if (typeof this._translateCache == "function") {
      try {
        data = await this._translateCache({
          action: "set",
          newData: data,
          oldData: this.data,
          roots: this._rootCaches
        });
      } catch (e) {
        return onCatch.apply(this, [e]);
      }
    }
    try {
      await this.set(data);
    } catch (e) {
      return onCatch.apply(this, [e]);
    }

    this._is_failed = false;

    this._isUpdating = false;

    this._onUpdateOnce.forEach(f => {
      f(this.data);
    });

    this._onUpdateOnce = [];

    this.emit("change");
    function onCatch(e) {
      console.error(`[Cache::${this._name}] Failed to get data`, e);
      this._updatedDate = preUpdateTime;
      this._isUpdating = false;
      this._is_failed = true;
      this._onUpdateOnce.forEach(f => {
        f(undefined, e);
      });
      this._onUpdateOnce = [];
      this.emit("failed");
      return Promise.reject(e);
    }
  }
}

function clone(obj) {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (null === obj || "object" !== typeof obj) {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }

  throw new Error(`Unable to copy obj! Its type isn't supported.`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
