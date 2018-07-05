import {Store} from "./store";

export function update(eventNames?: string[]) {
  return (store: Store, actionName, descriptor) => {
    let original = descriptor.value;
    descriptor.value = function() {
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
    return descriptor;
  };
}
