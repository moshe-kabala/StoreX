import { StoreIns, StoreInsEvents } from "./helpers";
import "jest";
import { Dispatcher } from "../src";

describe("Dispatcher", () => {
  let dispatcher;
  beforeEach(() => {
    dispatcher = new StoreIns();
  });

  test("Simple register checker", () => {
    let items;
    const arg = "new args";

    dispatcher.register(s => {
      items = s.args1;
    });
    dispatcher.action1(arg); // adding arg to store.args1

    expect(items).toContain(arg);
  });

  test("Should register to specific event", () => {
    let items;
    const arg = "new args";

    dispatcher.register(
      s => {
        items = s.args1;
      },
      [StoreInsEvents.AddItem]
    );

    dispatcher.action1(arg); // adding arg to store.args1

    expect(items).toContain(arg);
  });

  test("Should not register to specific event", () => {
    let items;
    const arg = "new args";

    dispatcher.register(
      s => {
        items = s.args1;
      },
      [StoreInsEvents.DeleteItem]
    );

    dispatcher.action1(arg); // adding arg to store.args1

    expect(items || []).not.toContain(arg);
  });

  test("Should dispatch only 1 time", () => {
    const items = ["moshe", "liav", "amit"];
    let count = 0;

    dispatcher.register(s => {
      count++;
    });

    dispatcher.action2(items); // call to action1 multiple times
    expect(count).toBe(1);
  });

  test("Should not register apter unregister", () => {
    let items;
    const arg = "new args";
    const func = s => {
      items = s.args1;
    };
    dispatcher.register(func);
    dispatcher.action1(arg); // adding arg to store.args1

    expect(items).toContain(arg);
    items = []; // reset the local items var
    dispatcher.unregister(func);
    dispatcher.action1(arg);
    expect(items).not.toContain(arg);
  });

  test("Should not register apter unregister for specific event", () => {
    let items1;
    let items2;

    const arg = "new args";
    const func1 = s => {
      items1 = s.args1;
    };
    const func2 = s => {
      items2 = s.args1;
    };

    dispatcher.register(func1);
    dispatcher.register(func2, [StoreInsEvents.AddItem]);

    dispatcher.action1(arg); // adding arg to store.args1

    setTimeout(() => {
      expect(items1).toContain(arg);
      expect(items2).toContain(arg);
    });

    items2 = []; // reset the local items var
    dispatcher.unregister(func2, [StoreInsEvents.AddItem]);
    dispatcher.action1(arg);

    // exist in item1 but not in item2 because we unregister
    expect(items1).toContain(arg);
    expect(items2).not.toContain(arg);
  });

  test("Should not register after unregister for all functions", () => {
    let items1;
    let items2;

    const arg = "new args";
    const func1 = s => {
      items1 = s.args1;
    };
    const func2 = s => {
      items2 = s.args1;
    };

    dispatcher.register(func1);
    dispatcher.register(func2, [StoreInsEvents.AddItem]);

    dispatcher.action1(arg); // adding arg to store.args1

    expect(items1).toContain(arg);
    expect(items2).toContain(arg);

    items1 = [];
    items2 = []; // reset the local items var
    dispatcher.unregisterFromAll(func1);
    dispatcher.unregisterFromAll(func2);
    dispatcher.action1(arg);

    // exist in item1 but not in item2 because we unregister
    expect(items1).not.toContain(arg);
    expect(items2).not.toContain(arg);
  });

  test("Should register and unregister a function to some dispatchers", () => {
    let count = 0;

    const func = () => count++;

    const dispatcher1 = new Dispatcher();
    const dispatcher2 = new Dispatcher();
    const dispatcher3 = new Dispatcher();
    const dispatcher4 = new Dispatcher();

    Dispatcher.register(func, [
      { dispatcher: dispatcher1, on: [] },
      { dispatcher: dispatcher2, on: ["myEvent"] },
      dispatcher3,
      { dispatcher: dispatcher4 }
    ]);
    dispatcher1.dispatch();
    dispatcher2.dispatch();
    dispatcher3.dispatch();
    dispatcher4.dispatch();

    expect(count).toBe(3);
    dispatcher2.dispatch(["myEvent"]);
    expect(count).toBe(4);

    Dispatcher.unregister(func, [
      { dispatcher: dispatcher1, on: [] },
      { dispatcher: dispatcher2, on: ["myEvent"] },
      dispatcher3,
      { dispatcher: dispatcher4 }
    ]);

    count = 0;

    dispatcher1.dispatch();
    dispatcher2.dispatch();
    dispatcher3.dispatch();
    dispatcher4.dispatch();

    expect(count).toBe(0);
  });

  test("Should dispatch on update prop", () => {
    let count = 0;
    const func = () => count++;
    dispatcher.register(func, ["args2"]);
    dispatcher.args2 = 4;
    dispatcher.args2 = 5;
    dispatcher.args2 = 5; // will not dispatch because there is no change
    expect(count).toBe(2);
    count = 0;
    dispatcher.unregisterFromAll(func);
    dispatcher.args2 = 4;
    expect(count).toBe(0);
  });

  test("Should dispatchOnce only once", async () => {
    let count = 0;
    const func = () => count++;
    dispatcher.register(func);
    dispatcher.dispatchOnce(() => {
      dispatcher.args2 = 4;
      dispatcher.args2 = 5;
      // dispatcher.action1("new item");
    });
    expect(count).toBe(1);
    count = 0; // reset the count;
  //   await dispatcher.dispatchOnce(async () => { // todo not working
  //     dispatcher.args2 = 4;
  //     dispatcher.args2 = 5;
  //     await timeoutPromise(() => {}, 20);
  //     dispatcher.action1("new item");
  //   });

  //   expect(count).toBe(0); // no change here

  //   await timeoutPromise(() => {
  //     expect(count).toBe(1);
  //   }, 1000);
  });

  test("Should unregister a function to some dispatchers", () => {
    // todo
  });
});

function timeoutPromise(func, time = 0) {
  return new Promise(res => {
    setTimeout(() => {
      func();
      res();
    }, time);
  });
}
