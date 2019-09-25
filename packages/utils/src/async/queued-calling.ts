const INSTANCE_KEY = "__INSTANCE__";
interface asyncQueueOptions {
  onlyLast?: boolean;
  maxParallelCalling?: number;
  static?: boolean;
}

interface functionData {
  queue: { onSuc; onFailed; args }[];
  runningCount: number;
}

interface FunctionStatus {
  isRunning: boolean;
  queueCount: number;
  runningCount: number;
}

function getDefaultFunctionData() {
  return { queue: [], runningCount: 0 };
}

const data = new WeakMap<
  Function,
  functionData | { [key: string]: functionData | boolean }
>();

export function getQueuedCallingStatus(
  key,
  functionName?: string
): FunctionStatus | { [key: string]: FunctionStatus } {
  let fd = data.get(key);

  if (!fd) {
    return null;
  }

  if (fd[INSTANCE_KEY]) {
    if (functionName) {
      if (!fd[functionName]) {
        return null;
      }
      fd = fd[functionName];
    } else {
      const result = {};
      for (const key in fd) {
        if (key == INSTANCE_KEY) continue;
        result[key] = mapFunctionDataToStatus(fd[key]);
      }
      return result;
    }
  }

  return mapFunctionDataToStatus(fd);
}

function mapFunctionDataToStatus(fd): FunctionStatus {
  return {
    isRunning: fd.runningCount > 0,
    queueCount: fd.queue.length,
    runningCount: fd.runningCount
  };
}

/**
 *
 * Call async functions in a queue. it is good when you don't want some async function run more the X times in the same time.  
 *
 * @Options
 * @prop onlyLast (boolean, default: false) - in case of multiple accumulated functions in a queue, exec only the last called function (all middle functions in the queue will get the result of the last one)
 * @prop maxParallelCalling (number, default: 1) - enable multiple functions to run in parallel
 * @prop static (boolean, default: false) - when true: 
 * in case of class all the method in all instances will insert to the same queue.
 * in case of function all wrapped of the same function will insert to the same queue.
 *
 *
 * @usage
 * option 1 wrap a function:
 * queuedCalling([Options])(<Your function>)
 * option 2 use it as a decorator on some method
 * class SomeClass {
 *  @queuedCalling([Options])
 *  async someMethod() {
 *  }
 * }
 *
 */
export const queuedCalling = ({
  maxParallelCalling: max = 1,
  onlyLast = false,
  static: _static = false
}: asyncQueueOptions = {}) => <T extends Function = any>(
  targetOrFunc: T | any,
  propertyKey?: string,
  descriptor?: PropertyDescriptor
): T | void => {
  function getKeyAndFunc(theThisFunction) {
    if (!descriptor) {
      return [targetOrFunc, targetOrFunc];
    }

    const key = _static ? targetOrFunc : theThisFunction;
    return [
      key,
      function() {
        return targetOrFunc.apply(theThisFunction, arguments);
      }
    ];
  }

  function getFunctionData(key) {
    const is_class_instance = !_static && descriptor;
    if (!data.has(key)) {
      if (is_class_instance) {
        data.set(key, {
          [INSTANCE_KEY]: true,
          [propertyKey]: getDefaultFunctionData()
        });
      } else {
        data.set(key, getDefaultFunctionData());
      }
    }
    let fd = data.get(key);

    if (is_class_instance) {
      if (!fd[propertyKey]) {
        fd[propertyKey] = getDefaultFunctionData();
      }
      fd = fd[propertyKey];
    }

    return fd as functionData;
  }

  function wrapper() {
    const [key, func] = getKeyAndFunc(this);

    let d: functionData = getFunctionData(key);
    if (d.runningCount < max) {
      return execFunction(d, func, arguments);
    } else {
      return new Promise((resolve, reject) => {
        d.queue.push({
          args: arguments,
          onSuc: resolve,
          onFailed: reject
        });
      });
    }
  }

  async function execFunction(fd, func, args) {
    try {
      fd.runningCount++;
      return await func(...args);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      fd.runningCount--;
      if (fd.queue.length > 0) {
        if (onlyLast) {
          const oldFuncQueue = fd.queue;
          fd.queue = [];
          const { args } = oldFuncQueue[oldFuncQueue.length - 1];
          execFunction(fd, func, args).then(
            r => {
              oldFuncQueue.forEach(fd => {
                fd.onSuc(r);
              });
            },
            e => {
              oldFuncQueue.forEach(fd => {
                fd.onFailed(e);
              });
            }
          );
        } else {
          const { args, onFailed, onSuc } = fd.queue.pop();
          execFunction(fd, func, args).then(onSuc, onFailed);
        }
      }
    }
  }

  // if the function is decorator on a class, else it is function wrapper
  if (descriptor) {
    targetOrFunc = descriptor.value;
    descriptor.value = wrapper;
  } else {
    if (!_static) {
      const originalFunction = targetOrFunc;
      // wrapping the original function to create uniq function for each wrapping
      targetOrFunc = function() {
        return originalFunction(...arguments);
      };
    }
    return (wrapper as any) as T;
  }
};
