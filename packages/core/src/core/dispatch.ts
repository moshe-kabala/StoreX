import { Dispatcher } from "./dispatcher";

export function dispatch(eventNames?: string[]) {
  return (store: Dispatcher, actionName, descriptor) => {

    let key = "value";

    if (!descriptor.value) {
      if (descriptor.set) {
        key = "set";
      } else if (descriptor.get) {
        key = "get";
      }
    }

    let original = descriptor[key];

    if (original) {
      descriptor[key] = function () {
        // console.log(`Arguments: ${arguments}`);
        try {
          this._dispatch_count++;
          const result = original.apply(this, arguments);
          // console.log(`Result: ${result}`);
          return result;
        } catch (e) {
          console.error(`Error: ${e}`);
          throw e;
        } finally {
          this._dispatch_count--;
          store.dispatch.apply(this, [eventNames]);
        }
      };
    }
    return descriptor;
  };
}
