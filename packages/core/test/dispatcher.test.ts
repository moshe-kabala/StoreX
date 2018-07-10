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

  test("Should register a function to some dispatchers", () => {
    // todo
  })
});
