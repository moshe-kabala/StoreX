import * as React from "react";
import { mount } from "enzyme";
import * as enzyme from "enzyme";

import { StoreIns } from "../helpers";
import { Subscribe } from "../../src/react";

import * as Adapter from "enzyme-adapter-react-16";
enzyme.configure({ adapter: new Adapter() });

describe("Store Wrapper", () => {
  let dispatcher: StoreIns;
  let dispatcher2: StoreIns;

  beforeEach(() => {
    dispatcher = new StoreIns();
    dispatcher2 = new StoreIns();

  });

  

  test("Should update status, and unregister when the component is unmount", async () => {
    let renderCount = 0;
    const Comp = (
      <Subscribe to={[dispatcher, dispatcher2]}>
        {() => {
          renderCount++;
          return <ul>{([...dispatcher.args1, ...dispatcher2.args1]).map((str, i) => <li key={i}>{str}</li>)}</ul>
        }
        }
      </Subscribe>
    );
    const wrapper = mount(Comp);

    const arg = "arg1";
    const arg2 = "arg2";

    dispatcher.action1(arg); // adding the arg to a list
    dispatcher.action1(arg); // adding the arg to a list
    dispatcher.action1(arg2); // adding the arg to a list
    dispatcher.action1(arg2); // adding the arg to a list


    await new Promise(resolve => {
      setTimeout(() => {
        const text = wrapper.text()
        expect(text).toContain(arg);
        expect(text).toContain(arg2);
        expect(renderCount).toBe(2);

        wrapper.unmount();
        // check if unlisten when wrapper unmount
        expect(
          Array.from(dispatcher._eventsRegisterFunc.onChange)
        ).toHaveLength(0);
        resolve();
      }, 2);
    });
  });
});
