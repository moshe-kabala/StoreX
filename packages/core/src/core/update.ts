import { Store } from "./store";

export function update(eventNames?: string[]) {
  return (store: Store, actionName, descriptor) => {

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
          const result = original.apply(this, arguments);
          store.dispatch.apply(this, [eventNames]);
          // console.log(`Result: ${result}`);
          return result;
        } catch (e) {
          console.error(`Error: ${e}`);
          throw e;
        }
      };
    }
    return descriptor;
  };
}
