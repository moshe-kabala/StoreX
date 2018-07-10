import {wrapObject} from "../src";

describe("wrapObject", () => {
  test("Should updated on changes in an object", () => {
      let counter = 0;
      let obj: any = {name: "moshe"};
      const store = wrapObject(obj);
      store.listen(()=> counter++);
      store.context.name = "name";
      store.context.age = 45
      expect(counter).toBe(2);
  });
});
