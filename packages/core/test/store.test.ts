import { StoreIns, StoreInsEvents } from "./helpers";
import "jest";
import { Store } from "../src";

describe("Store", () => {
  let store;
  beforeEach(() => {
    store = new StoreIns();
  });

  test("Simple listen checker", async () => {
    let items;
    const arg = "new args";

    store.listen(s => {
      items = s.args1;
    });
    store.action1(arg); // adding arg to store.args1

    await new Promise(resolve => {
      setTimeout(() => {
        expect(items).toContain(arg);
        resolve();
      }, 1);
    });
  });

  test("Should Listen to specific event", async () => {
    let items;
    const arg = "new args";

    store.listen(
      s => {
        items = s.args1;
      },
      [StoreInsEvents.AddItem]
    );

    store.action1(arg); // adding arg to store.args1

    await new Promise(resolve => {
      setTimeout(() => {
        expect(items).toContain(arg);
        resolve();
      }, 1);
    });
  });

  test("Should not Listen to specific event", async () => {
    let items;
    const arg = "new args";

    store.listen(
      s => {
        items = s.args1;
      },
      [StoreInsEvents.DeleteItem]
    );

    store.action1(arg); // adding arg to store.args1

    await new Promise(resolve => {
      setTimeout(() => {
        expect(items || []).not.toContain(arg);
        resolve();
      }, 1);
    });
  });

  test("Should not listen apter unlisten", async () => {
    let items;
    const arg = "new args";
    const func = s => {
      items = s.args1;
    }
    store.listen(func);
    store.action1(arg); // adding arg to store.args1

    await new Promise(resolve => {
      setTimeout(() => {
        expect(items).toContain(arg);
        resolve();
      }, 1);
    });
    items = [] // reset the local items var
    store.unlisten(func);
    store.action1(arg);
    await new Promise(resolve => {
      setTimeout(() => {
        expect(items).not.toContain(arg);
        resolve();
      }, 1);
    });
  });

  test("Should not listen apter unlisten for specific event", async () => {
    let items1;
    let items2;

    const arg = "new args";
    const func1 = s => {
      items1 = s.args1;
    }
    const func2 = s => {
      items2 = s.args1;
    }


    store.listen(func1);
    store.listen(func2, [StoreInsEvents.AddItem]);

    store.action1(arg); // adding arg to store.args1

    await new Promise(resolve => {
      setTimeout(() => {
        expect(items1).toContain(arg);
        expect(items2).toContain(arg);
        resolve();
      }, 1);
    });

    items2 = [] // reset the local items var
    store.unlisten(func2, [StoreInsEvents.AddItem]);
    store.action1(arg);

    await new Promise(resolve => {
      setTimeout(() => {
        // exist in item1 but not in item2 because we unlisten 
        expect(items1).toContain(arg);
        expect(items2).not.toContain(arg);
        resolve();
      }, 1);
    });
  });

  test("Should not listen after unlisten for all functions", async () => {
    let items1;
    let items2;

    const arg = "new args";
    const func1 = s => {
      items1 = s.args1;
    }
    const func2 = s => {
      items2 = s.args1;
    }


    store.listen(func1);
    store.listen(func2, [StoreInsEvents.AddItem]);

    store.action1(arg); // adding arg to store.args1

    await new Promise(resolve => {
      setTimeout(() => {
        expect(items1).toContain(arg);
        expect(items2).toContain(arg);
        resolve();
      }, 1);
    });

    items1 = []
    items2 = [] // reset the local items var
    store.unlistenFromAll(func1);
    store.unlistenFromAll(func2);
    store.action1(arg);

    await new Promise(resolve => {
      setTimeout(() => {
        // exist in item1 but not in item2 because we unlisten 
        expect(items1).not.toContain(arg);
        expect(items2).not.toContain(arg);
        resolve();
      }, 1);
    });
  });
});
