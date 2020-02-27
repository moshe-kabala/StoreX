import { LinkedListNode, LinkedList } from "./LinkedList";

export type CacheValue<T> = { value: T; version: string };

type Key = string | number;

export function buildKeyValueCache<T>({limit, default_value}: {limit?: number, default_val?: ()=> T | null}) {
   
    let limiter ;

    if(limit !== undefined) {
        limiter = new KeyValueCacheLimiter(limit);
    }
    const cache = new KeyValueCache<T>({
        limiter,
        default_value
    });

    
    
    const tracker = new GetTracker<T>();

    tracker.onEnded((key, value:T)=> {
        cache
    })

    return {
        limiter
        cache
        tracker
    }
}


export class KeyValueCacheLimiter {
    __node_map = new Map<Key, LinkedListNode<Key>>();
    __ordered_keys = new LinkedList<Key>();

    __on_remove_func = new Set<(key:Key)=> void>();

    constructor(public limit = 10000) {

    }

    private __emit_removed(key: Key) {
        for (const func of Array.from(this.__on_remove_func)) {
            func(key);
        }
    }

    on_removed(func: (key: Key)=> void) {
        if (typeof func == "function") {
            this.__on_remove_func.add(func);
        }
    }

    unlisten_on_removed(func: (key: Key)=> void) {
        this.__on_remove_func.delete(func);
    }


    up(key: Key) {
        const node = this.__node_map.get(key);
        if (node) {
            this.__ordered_keys.remove(node);
            this.__ordered_keys.addToHead(node);
        } else {
            const node = this.__ordered_keys.addValueToHead(key);
            this.__node_map.set(key, node);
        }

        if (this.__node_map.size > this.limit) {
           this.remove();
        }
    }

    remove() {
        const node = this.__ordered_keys.removeFromTall();
        this.__node_map.delete(node.value);
        this.__emit_removed(node.value);
    }
}

function DEFAULT() {
    return null
}

export class KeyValueCache<T = any> {
  private __cache = new Map<Key,T>();
  private __limiter  = null;
  private __default_value  = null;


  // todo implement limit function
  constructor({default_value = DEFAULT}) {
    // if (tracker) {
    //     tracker.onNew((key, value)=> {
    //         this.set(key, value)
    //     })
    // }

    this.__default_value = default_value;

  }

  clean() {
    this.__cache.clear();
  }

  get(key: Key): CacheValue<T> {
    let v = this.__cache.get(key)
    return  v== undefined ? this.__default_value() : v;
  }

  set(key: Key, value: T) {
    this.__cache.set(key,  value );
    if(this.__limiter)  {

        this.__limiter.up(key);
    }
  }

  remove(key: Key) {
    this.__cache.delete(key );
    if(this.__limiter)  {
        this.__limiter.down(key);
    }
  }
}

// todo add option to config limit time for get cycle 
export class GetTracker<T = unknown> {
  private __waiting = new Map();

  __on_ended_func = new Set<(key:Key, value: T)=> void>();

  constructor(public limit = 10000) {

  }

  private __emit_ended_func(key: Key, value: T) {
      for (const func of Array.from(this.__on_ended_func)) {
          func(key, value);
      }
  }

  onEnded(func: (key: Key)=> void) {
      if (typeof func == "function") {
          this.__on_ended_func.add(func);
      }
  }

  unlistenOnEnded(func: (key: Key)=> void) {
      this.__on_ended_func.delete(func);
  }


  //
  is_already_getting(key: Key) {
    return this.__waiting.has(key);
  }

  // the function return the value when it coming
  async await_for(key: Key): Promise<T> {
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
    if (funcs) {
      this.__waiting.delete(key);
      funcs.forEach(func => func(value));
    }
  }

  failed(key: Key, err) {
    const funcs = this.__waiting.get(key);
    if (funcs) {
      this.__waiting.delete(key);
      funcs.forEach(func => func(null, err));
    }
  }
}
