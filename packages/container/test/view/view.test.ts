import { createCollection } from "../../src/collection";
import { createState } from "../../src/";

import { View, createView } from "../../src/view";

import { generateList, itemToId, generateItem } from "../helpers/collection";

describe("View", () => {
  test("Create view", () => {
    const collection = createCollection({ itemToId });
    const filter = createState();
    const data = generateList();
    const transform = ([collection, filter]) => {
      const data = collection.data;
      const query = new RegExp(filter.state.name || "", "i");
      return data.filter(i => query.test(i.name));
    };
    const view = createView({
      sources: [collection, filter],
      transform
    });
    collection.override(data);
    expect(view.data).toHaveLength(data.length);
    const name = "moshe";
    const query = new RegExp(name, "i");
    filter.setState({ name });
    const filteredData = data.filter(i => query.test(i.name));
    expect(view.data).toHaveLength(filteredData.length);
  });
});
