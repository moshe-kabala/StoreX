import { createCollection } from "../../src/collection";
import { createState, State } from "../../src/";

import { createView, ViewTransform } from "../../src/view";

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
      dispatchers: [collection, filter],
      transform
    });
    collection.data = data;
    expect(view.data).toHaveLength(data.length);
    const name = "moshe";
    const query = new RegExp(name, "i");
    filter.setState({ name });
    const filteredData = data.filter(i => query.test(i.name));
    expect(view.data).toHaveLength(filteredData.length);
  });

  test("Should run pre and post func and destroy the view", () => {
    const names = ["moshe", "liav", "amit"];
    let postCount = 0,
      preCount = 0;
    const state1 = createState({ name: names[0] });
    const state2 = createState({ name: names[1] });
    const state3 = createState({ name: names[2] });

    const transform: ViewTransform = (sources: any, { oldData, context }) => {
      const names = [];
      for (let s of sources) {
        names.push(s.state.name);
      }
      return names;
    };

    const view = createView({
      transform,
      dispatchers: [
        state1,
        {
          dispatcher: state2,
          onDispatch: {
            pre: () => preCount++,
            post: () => postCount++
          }
        },
        state3
      ]
    });

    state2.setState({ name: names[1] });

    expect(view.data).toEqual(names);
    expect(preCount).toBe(1);
    expect(postCount).toBe(1);

    view.destroy();
    state2.setState({ name: names[3] });

    expect(view.data).toEqual(names);
    expect(preCount).toBe(1);
    expect(postCount).toBe(1);


  });
});
