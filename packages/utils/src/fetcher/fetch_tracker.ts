type Key = string | number;

// todo add option to config limit time for get cycle
// consider to throw error if wait_for(key) calling but no one defines waiter for this key

/**
 * FetchTracker help when you fetch some data asynchronically and in this time
 * you receive anther request for the same data. and you prefer to send the same
 * data for both requests instead of re-fetch
 *
 * @example
 * const tracker = FetchTracker();
 *
 * // before you go to fetch the data. check if the data currently fetched
 *
 * if (tracker.is_already_fetched("data_key")) {
 *      // the function return promise that will invoked by calling
 *      // tracker.start(key) and tracker.ended(key, value) or in case of failing tracker.failed(key, err)
 *      // see latter ...
 *      return tracker.wait_for("data_key")
 * }
 *
 *
 * // before you go to fetch the data
 * tracker.start("data_key");
 *
 * // if the fetcher success
 * tracker.ended("data_key", fetched_value);
 *
 * // if the fetcher failed
 * tracker.failed("data_key", some_err);
 *
 *
 *
 * @export
 * @class FetchTracker
 * @template T
 * @template unknown
 */
export class FetchTracker<T = unknown> {
  private __waiting = new Map();

  __on_ended_func = new Set<(key: Key, value: T) => void>();
  __wait_map?: (value) => any | T;
  __timeout?: number;

  constructor({
    timeout = 60000,
    wait_map
  }: {
    wait_map?: (value) => any | T;
    timeout?: number;
  } = {}) {
    this.__timeout = timeout;
    this.__wait_map = wait_map;
  }

  private __emit_ended_func(key: Key, value: T) {
    for (const func of Array.from(this.__on_ended_func)) {
      func(key, value);
    }
  }

  onEnded(func: (key: Key, value: T) => void) {
    if (typeof func == "function") {
      this.__on_ended_func.add(func);
    }
  }

  unlistenOnEnded(func: (key: Key, value: T) => void) {
    this.__on_ended_func.delete(func);
  }

  //
  is_already_fetched(key: Key) {
    return this.__waiting.has(key);
  }

  // the function return the value when it coming
  async await_for(key: Key): Promise<T | any> {
    return new Promise((resolve, reject) => {
      this.__waiting.get(key).push((value: T, err) => {
        if (err) {
          return reject(err);
        }
        resolve(value);
      });
    });
  }

  // lifetime cycle for get action
  start(key: Key) {
    this.__waiting.set(key, []);
  }

  ended(key: Key, value: T) {
    const funcs = this.__waiting.get(key);
    // update waiters function
    if (funcs) {
      this.__waiting.delete(key);
      let mapped_value =
        typeof this.__wait_map == "function" ? this.__wait_map(value) : value;
      funcs.forEach(func => func(mapped_value));
    }
    this.__emit_ended_func(key, value);
  }

  failed(key: Key, err) {
    const funcs = this.__waiting.get(key);
    if (funcs) {
      this.__waiting.delete(key);
      funcs.forEach(func => func(null, err));
    }
  }
}
