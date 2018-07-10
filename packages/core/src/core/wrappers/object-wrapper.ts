import { Dispatcher } from "../dispatcher";

export interface objectWrapper {
  ignores?: string[];
}

export function wrapObject<T extends Object>(instance: T, options: objectWrapper = {}): Dispatcher<T> {
  const dispatcher = new Dispatcher<T>();
  const ignores = options.ignores && new Set(options.ignores);
  dispatcher.context = new Proxy(instance, {
      set: function(obj, prop, value) {
        obj[prop] = value;
        if (!ignores || typeof prop !== "string" || !ignores.has(prop)) {
          if(typeof prop === "string") {
            dispatcher.dispatch([prop]);
          }
          // else todo:
        }
        // Indicate success
        return true;
      }
    }
  );
  return dispatcher;
}
