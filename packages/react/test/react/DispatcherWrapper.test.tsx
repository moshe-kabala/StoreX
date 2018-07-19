import * as React from "react";
import { mount } from "enzyme";
import * as enzyme from "enzyme";

import { StoreIns } from "../helpers";
import { DispatcherWrapper } from "../../src/react";

import * as Adapter from "enzyme-adapter-react-16";
enzyme.configure({ adapter: new Adapter() });

describe("Store Wrapper", () => {
  let dispatcher: StoreIns;
  beforeEach(() => {
    dispatcher = new StoreIns();
  });

  

  test("Should update status, and unregister when the component is unmount", async () => {
    const Comp = (
      <DispatcherWrapper dispatcher={dispatcher}>
        {(_store: StoreIns) => (
          <ul>{_store.args1.map(str => <li key={str}>{str}</li>)}</ul>
        )}
      </DispatcherWrapper>
    );
    const wrapper = mount(Comp);

    const arg = "arg1";
    dispatcher.action1(arg); // adding the arg to a list

    await new Promise(resolve => {
      setTimeout(() => {
        expect(wrapper.text()).toContain(arg);
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
