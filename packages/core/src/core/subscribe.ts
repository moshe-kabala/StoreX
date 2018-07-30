import { Subscriber } from "./subscriber";

export function subscribe(dependOn?: string[]) {
  return function(dependent: Subscriber, funName, descriptor) {
    if (!descriptor.value || !(dependent instanceof Subscriber)) {
        throw new Error("You can put depend decorator only on a function from Subscriber instance")
    }
    Subscriber._functions_to_updates.push(descriptor.value)
    return descriptor;
  };
}

