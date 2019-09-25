import "jest";

import { sleep } from "../src/async";
import {
  SLEEP_TIME,
  createFunctionCallingEnv,
  createFunction,
  wrapFunction,
  createClass,
  createClassCallingEnv
} from "./queued-calling.helper";

/**
 * Test cases
 *
 * check static on function and class
 *
 * check max
 *
 * check onlyLast
 *
 */

describe("CallingInQueue", () => {
  test("calling parallelize with only 1 allow to call", async () => {
    const func1 = createFunction();
    const env = createFunctionCallingEnv(wrapFunction(func1), func1);
    await testMax({ ...env });

    const func2 = createFunction();
    const env2 = createFunctionCallingEnv(
      wrapFunction(func2, { onlyLast: true }),
      func2
    );
    await testLast({ ...env2 });
  });

  test("calling parallelize with multi allow calling together", async () => {
    const func1 = createFunction();
    const env = createFunctionCallingEnv(
      wrapFunction(func1, { maxParallelCalling: 3 }),
      func1
    );
    await testMax({ ...env, maxParallelCalling: 3 });

    const func2 = createFunction();
    const env2 = createFunctionCallingEnv(
      wrapFunction(func2, { maxParallelCalling: 3, onlyLast: true }),
      func2
    );
    await testLast({ ...env2, maxParallelCalling: 3 });
  });

  test("calling parallelize with only 1 allow to call on a class method", async () => {
    const Class1 = createClass();
    const class1 = new Class1();
    const env = createClassCallingEnv(class1, Class1);
    await testMax({ ...env });

    const Class2 = createClass({ onlyLast: true });
    const class2 = new Class2();
    const env2 = createClassCallingEnv(class2, Class2);
    await testLast({ ...env2 });
  });

  test("calling parallelize with multi allow calling together on a class method", async () => {
    const Class1 = createClass({ maxParallelCalling: 3 });
    const class1 = new Class1();
    const env = createClassCallingEnv(class1, Class1);
    await testMax({ ...env, maxParallelCalling: 3 });

    const Class2 = createClass({ maxParallelCalling: 3, onlyLast: true });
    const class2 = new Class2();
    const env2 = createClassCallingEnv(class2, Class2);
    await testLast({ ...env2, maxParallelCalling: 3 });
  });

  test("test static true on class", async () => {
    const Class = createClass({ static: true });
    const class1 = new Class();
    const class2 = new Class();

    const env1 = createClassCallingEnv(class1, Class);
    const env2 = createClassCallingEnv(class2, Class);

    testStaticTrue(env1, env2, () => Class.data.action_1_count);
  });

  test("test static false on class ", async () => {
    const Class = createClass({ static: false });
    const class1 = new Class();
    const class2 = new Class();

    const env1 = createClassCallingEnv(class1, Class);
    const env2 = createClassCallingEnv(class2, Class);

    testStaticFalse(env1, env2, () => Class.data.action_1_count);
  });

  test("test static true on function", async () => {
    const Func = createFunction();
    const wrapFunc1 = wrapFunction(Func, { static: true });
    const wrapFunc2 = wrapFunction(Func, { static: true });

    const env1 = createFunctionCallingEnv(wrapFunc1, Func);
    const env2 = createFunctionCallingEnv(wrapFunc2, Func);

    testStaticTrue(env1, env2, () => Func.count);
  });

  test("test static false on function ", async () => {
    const Func = createFunction();
    const wrapFunc1 = wrapFunction(Func, { static: false });
    const wrapFunc2 = wrapFunction(Func, { static: false });

    const env1 = createFunctionCallingEnv(wrapFunc1, Func);
    const env2 = createFunctionCallingEnv(wrapFunc2, Func);

    testStaticFalse(env1, env2, () => Func.count);
  });

  test("throw error", async () => {
    const Func = createFunction();
    const func = wrapFunction(Func, { maxParallelCalling: 3 });
    const env = createFunctionCallingEnv(func, Func);
    let error;
    try {
      await func(true);
    } catch (err) {
      error = err;
    }
    expect(error).not.toBeUndefined();
  });
});

async function testLast({
  callFunction,
  getCallingCount,
  getResult,
  maxParallelCalling = 1,
  callingCount = 0
}) {
  if (!callingCount) {
    callingCount = maxParallelCalling * 3 + 1;
  }

  const callFunc = callFunction();
  while (callingCount--) {
    callFunc.next();
  }

  await sleep(SLEEP_TIME * 3 + 10);
  // check the calling time
  expect(getCallingCount().success).toBe(maxParallelCalling + 1);
  // check that all the result are the same
  expect(new Set(getResult().slice(maxParallelCalling)).size).toBe(1);
}

async function testMax({
  callFunction,
  maxParallelCalling = 1,
  getResult,
  getCallingCount,
  callingCount = 0
}) {
  if (!callingCount) {
    callingCount = maxParallelCalling * 2 + 1;
  }

  const callFunc = callFunction();
  while (callingCount--) {
    callFunc.next();
  }
  await sleep(SLEEP_TIME * 2 + 40);
  expect(getCallingCount().success).toBe(maxParallelCalling * 2);
}

async function testStaticTrue(env1, env2, getGlobalCount) {
  env1.callFunction().next();
  env2.callFunction().next();
  await sleep(SLEEP_TIME + 10);
  expect(getGlobalCount().success).toBe(1);
}

async function testStaticFalse(env1, env2, getGlobalCount) {
  env1.callFunction().next();
  env2.callFunction().next();
  await sleep(SLEEP_TIME + 10);
  expect(getGlobalCount().success).toBe(2);
}
