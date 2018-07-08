import { StoreIns, StoreInsEvents } from "./helpers";
import "jest";
import { Store } from "../src";

describe("Store", () => {
  let store;
  beforeEach(() => {
    store = new StoreIns();
  });

  test("Simple listen checker", () => {
    let items;
    const arg = "new args";

    store.listen(s => {
      items = s.args1;
    });
    store.action1(arg); // adding arg to store.args1

    expect(items).toContain(arg);
  });

  test("Should Listen to specific event", () => {
    let items;
    const arg = "new args";

    store.listen(
      s => {
        items = s.args1;
      },
      [StoreInsEvents.AddItem]
    );

    store.action1(arg); // adding arg to store.args1

    expect(items).toContain(arg);
  });

  test("Should not Listen to specific event", () => {
    let items;
    const arg = "new args";

    store.listen(
      s => {
        items = s.args1;
      },
      [StoreInsEvents.DeleteItem]
    );

    store.action1(arg); // adding arg to store.args1

    expect(items || []).not.toContain(arg);
  });

  test("Should dispatch only 1 time", () => {
    const items = ["moshe", "liav", "amit"];
    let count = 0;

    store.listen(s => {
      count++;
    });

    store.action2(items); // call to action1 multiple times
    expect(count).toBe(1);
  });

  test("Should not listen apter unlisten", () => {
    let items;
    const arg = "new args";
    const func = s => {
      items = s.args1;
    };
    store.listen(func);
    store.action1(arg); // adding arg to store.args1

    expect(items).toContain(arg);
    items = []; // reset the local items var
    store.unlisten(func);
    store.action1(arg);
    expect(items).not.toContain(arg);
  });

  test("Should not listen apter unlisten for specific event", () => {
    let items1;
    let items2;

    const arg = "new args";
    const func1 = s => {
      items1 = s.args1;
    };
    const func2 = s => {
      items2 = s.args1;
    };

    store.listen(func1);
    store.listen(func2, [StoreInsEvents.AddItem]);

    store.action1(arg); // adding arg to store.args1

    setTimeout(() => {
      expect(items1).toContain(arg);
      expect(items2).toContain(arg);
    });

    items2 = []; // reset the local items var
    store.unlisten(func2, [StoreInsEvents.AddItem]);
    store.action1(arg);

    // exist in item1 but not in item2 because we unlisten
    expect(items1).toContain(arg);
    expect(items2).not.toContain(arg);
  });

  test("Should not listen after unlisten for all functions", () => {
    let items1;
    let items2;

    const arg = "new args";
    const func1 = s => {
      items1 = s.args1;
    };
    const func2 = s => {
      items2 = s.args1;
    };

    store.listen(func1);
    store.listen(func2, [StoreInsEvents.AddItem]);

    store.action1(arg); // adding arg to store.args1

    expect(items1).toContain(arg);
    expect(items2).toContain(arg);

    items1 = [];
    items2 = []; // reset the local items var
    store.unlistenFromAll(func1);
    store.unlistenFromAll(func2);
    store.action1(arg);

    // exist in item1 but not in item2 because we unlisten
    expect(items1).not.toContain(arg);
    expect(items2).not.toContain(arg);
  });
});
