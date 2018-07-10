import { Store } from "./store";

export interface objectWrapper {
  ignores?: string[];
}

export function wrapObject<T extends Object>(instance: T, options: objectWrapper = {}): Store<T> {
  const store = new Store<T>();
  const ignores = options.ignores && new Set(options.ignores);
  store.context = new Proxy(instance, {
      set: function(obj, prop, value) {
        obj[prop] = value;
        if (!ignores || typeof prop !== "string" || !ignores.has(prop)) {
          if(typeof prop === "string")
            store.dispatch([prop]);
          // else todo:
        }
        // Indicate success
        return true;
      }
    }
  );
  return store;
}
