import { Dispatcher } from "./dispatcher";

export function dispatch(eventNames?: string[]) {
  return baseDispatch(eventNames);
}


export function dispatchIf( conditionFunc: () => boolean, eventNames?: string[],) {
  return baseDispatch(eventNames, conditionFunc);
}

function baseDispatch(eventNames?: string[], conditionFunc?) {
  return (store: Dispatcher, name, descriptor?) => {
    if (descriptor) {
      return functionDispatchHandler(store, name, descriptor, eventNames, conditionFunc);
    } else {
      let events = [name];
      if (eventNames instanceof Array) {
         events.concat(eventNames);
      }
      return propDispatchHandler(store, name, events, conditionFunc);
    }
  };
}

function propDispatchHandler(store: Dispatcher, propName, eventNames?: string[], conditionFunc?) {
  let _value;
  return {
    set (value) {
      if (_value === value) {
        return; // not update when there is no change
      }
      _value = value;
      if(typeof conditionFunc == "function" && !conditionFunc()) {
        // todo: maybe remove
      } else {
        store.dispatch.apply(this, [eventNames]);
      }
    },
    get() {
      return _value;
    }
  };
}


function functionDispatchHandler(store: Dispatcher, actionName, descriptor, eventNames?: string[], conditionFunc?) {
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
          if(typeof conditionFunc == "function" && !conditionFunc()) {
            // todo: maybe remove
          } else {
            store.dispatch.apply(this, [eventNames]);
          }
        }
      };
    }
    return descriptor;
}