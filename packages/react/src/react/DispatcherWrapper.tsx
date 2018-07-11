import * as React from "react";
import { Dispatcher } from "@storex/core";

export interface DispatcherWrapperProps<T extends Dispatcher> {
  dispatcher: T;
  updateOn?: string[];
  children: (store: T) => any;
}

export class DispatcherWrapper<T extends Dispatcher> extends React.Component<
  DispatcherWrapperProps<T>,
  any
> {
  state = {
    dispatcher: undefined
  };

  update = state => {
    this.setState(state);
  };

  componentWillMount() {
    const { dispatcher, updateOn } = this.props;
    dispatcher.register(this.update, updateOn);
    this.state.dispatcher = dispatcher; // not updating by set state
  }

  componentWillUnmount() {
    const { dispatcher, updateOn } = this.props;
    dispatcher.unregister(this.update, updateOn);
  }

  render() {
    const { dispatcher } = this.state;
    const { children } = this.props;
    return children(dispatcher);
  }
}
