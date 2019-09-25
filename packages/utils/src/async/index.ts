export { queuedCalling, getQueuedCallingStatus } from "./queued-calling";
import { DelayState, DelayStateOpt } from "./delay-state";

const SUFFIX_STATUS_KEY = `__delay_status__`;

export function delay<T = Function>(opt: DelayStateOpt) {
  return function(
    target,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) {
    function getStatus(theThisFunction) {
      // todo: change to weak map
      let arg = descriptor
        ? `${propertyKey}${SUFFIX_STATUS_KEY}`
        : SUFFIX_STATUS_KEY;

      if (!theThisFunction[arg]) {
        theThisFunction[arg] = new DelayState(target, opt, theThisFunction);
      }
      return theThisFunction[arg];
    }

    function wrapper() {
      let s = getStatus(this || wrapper);
      if (opt.reduceArgs) {
        // first lets reduce aggregate the arguments
        s.state.argsState = opt.reduceArgs(s.state.argsState, ...arguments);
      }
      // if already waiting
      if (s.state.waiting) {
        s.state.delayCallingAmount++;
        return;
      }

      s.state.callingAmount++;

      if (s.state.callingAmount > opt.startDelayAfter) {
        s.state.waiting = true;
        s.delay();
      } else {
        s.invoke();
      }
    }

    // if class
    if (descriptor) {
      target = descriptor.value;
      descriptor.value = wrapper;
      return descriptor as any;
    } else {
      return (wrapper as any) as T;
    }
  };
}

export function sleep(time = 0) {
  return new Promise(res => {
    setTimeout(() => {
      res();
    }, time);
  });
}
