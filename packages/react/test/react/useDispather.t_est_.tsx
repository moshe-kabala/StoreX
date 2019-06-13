import * as React from "react";
import * as enzyme from "enzyme";
import { shallow } from "enzyme";
import { StoreIns } from "../helpers";
import { useDispatcher } from "../../src/react";

import * as Adapter from "enzyme-adapter-react-16";
enzyme.configure({ adapter: new Adapter() });



describe("useDispatcher", () => {
  let dispatcher: StoreIns;
  let dispatcher2: StoreIns;

  beforeEach(() => {
    dispatcher = new StoreIns();
    dispatcher2 = new StoreIns();
  });

  test("using", async () => {
    let renderCount = 0;

    function Comp(args) {
      useDispatcher([dispatcher, dispatcher2]);

      renderCount++;
      return (
        <ul>
          {[...dispatcher.args1, ...dispatcher2.args1].map((str, i) => (
            <li key={i}>{str}</li>
          ))}
        </ul>
      );
    }

    const wrapper = shallow(<Comp />);

    const arg = "arg1";
    const arg2 = "arg2";

    dispatcher.action1(arg); // adding the arg to a list
    dispatcher.action1(arg); // adding the arg to a list
    dispatcher.action1(arg2); // adding the arg to a list
    dispatcher.action1(arg2); // adding the arg to a list

    await new Promise(resolve => {
      setTimeout(() => {
        const text = wrapper.text();
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
