import { Key } from "./types";

export type eventFunctions<T> = ((key: Key, value: T) => void) | (() => void);
export enum KeyCacheEvents {
  set = "set",
  get = "get",
  remove = "remove",
  clean = "clean"
}

function DEFAULT() {
  return null;
}

export class KeyCache<T = any> {
  private __cache = new Map<Key, T>();
  private __limiter = null;
  private __default_value = null;
  // init the funcs by iterate and mapping the key cache events
  private __on_funcs = new Map<KeyCacheEvents, Set<eventFunctions<T>>>(
    Object.keys(KeyCacheEvents).map(event => [event, new Set()]) as any
  );

  // todo implement limit function
  constructor({ default_value = DEFAULT }) {
    this.__default_value = default_value;
  }

  clean() {
    this.__cache.clear();
    this.__emit(KeyCacheEvents.clean);
  }

  get(key: Key): T {
    let value = this.__cache.get(key);
    // return default value
    if (value === undefined) return this.__default_value();

    this.__emit(KeyCacheEvents.set, key, value);
    return value;
  }

  set(key: Key, value: T) {
    this.__cache.set(key, value);
    this.__emit(KeyCacheEvents.set, key, value);
  }

  remove(key: Key) {
    let value = this.__cache.get(key);
    if (this.__cache.delete(key)) {
      this.__emit(KeyCacheEvents.remove, key, value);
    }
  }

  private __emit(event: KeyCacheEvents, key?: Key, value?: T) {
    for (const func of Array.from(this.__on_funcs.get(event))) {
      func(key, value);
    }
  }

  on(event: KeyCacheEvents, func: eventFunctions<T>) {
    if (typeof func == "function") {
      this.__on_funcs.get(event)?.add(func);
    }
  }

  unlistenOn(event: KeyCacheEvents, func: eventFunctions<T>) {
    this.__on_funcs.get(event)?.delete(func);
  }
}
