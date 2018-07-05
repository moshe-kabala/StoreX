import * as React from "react";
import { Store } from "@storex/core";

export interface StoreWrapperProps<T extends Store> {
  store: T;
  updateOn?: string[];
  children: (store: T) => any;
}

export class StoreWrapper<T extends Store> extends React.Component<StoreWrapperProps<T>, any> {
  state = {
    store: undefined
  };

  update = state => {
    this.setState(state);
  };

  componentWillMount() {
    const { store, updateOn } = this.props;
    store.listen(this.update, updateOn);
    this.state.store = store;
  }

  componentWillUnmount() {
    const { store, updateOn } = this.props;
    store.unlisten(this.update, updateOn);
  }

  render() {
    const { store } = this.state;
    const { children } = this.props;
    return children(store);
  }
}
