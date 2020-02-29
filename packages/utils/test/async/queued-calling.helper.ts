import { queuedCalling, getQueuedCallingStatus, sleep } from "../../src/async";

export const SLEEP_TIME = 100;

export function createClass(opt1?, opt2?) {
  class SomeClass {
    data = {
      action_1_count: { success: 0, error: 0 },
      action_2_count: { success: 0, error: 0 }
    };
    static data = {
      action_1_count: { success: 0, error: 0 },
      action_2_count: { success: 0, error: 0 }
    };

    @queuedCalling(opt1)
    async action1(isError) {
      await sleep(SLEEP_TIME);
      if (isError) {
        this.data.action_1_count.error++;
        SomeClass.data.action_1_count.error++;
        throw new Error("Async function error");
      }
      this.data.action_1_count.success++;
      SomeClass.data.action_1_count.success++;
      return this.data.action_1_count.success;
    }

    @queuedCalling(opt2)
    async action2(isError) {
      await sleep(SLEEP_TIME);
      if (isError) {
        this.data.action_2_count.error++;
        SomeClass.data.action_2_count.error++;
        throw new Error("Async function error");
      }
      this.data.action_2_count.success++;
      SomeClass.data.action_2_count.success++;
      return this.data.action_2_count.success;
    }
  }

  return SomeClass as any;
}

export function createFunction() {
  async function F(isError) {
    await sleep(SLEEP_TIME);
    if (isError) {
      (F as any).count.error++;
      throw new Error("Async function error");
    }
    (F as any).count.success++;
    return (F as any).count.success;
  }

  (F as any).count = { success: 0, error: 0 };
  return F as any;
}

export function wrapFunction(func, opt?) {
  const wrappedFunc = queuedCalling(opt)(func);
  function WF() {
    return wrappedFunc(...arguments).then(
      r => {
        (WF as any).wrapped_count.success++;
        return r;
      },
      e => {
        (WF as any).wrapped_count.error++;
        throw e;
      }
    );
  }
  (WF as any).wrapped_count = { success: 0, error: 0 };
  (WF as any).count = func.count;

  return WF as Function;
}

export function createFunctionCallingEnv(wrappedFunc, originalFunc) {
  let result = [];

  return {
    *callFunction(isError = false) {
      while (true) {
        isError = yield wrappedFunc(isError).then(
          r => {
            result.push(r);
            return r;
          },
          e => {
            result.push(null);
            throw e;
          }
        );
      }
    },
    getResult() {
      return result;
    },
    getCallingCount(): { success: number; error: number } {
      return originalFunc.count;
    }
  };
}

export function createClassCallingEnv(_class, _Class) {
  let result = [];

  return {
    *callFunction(isError = false) {
      while (true) {
        isError = yield _class.action1(isError).then(
          r => {
            result.push(r);
            return r;
          },
          e => {
            result.push(null);
            throw e;
          }
        );
      }
    },
    getResult() {
      return result;
    },
    getCallingCount(): { success: number; error: number } {
      return _class.data.action_1_count;
    }
  };
}
