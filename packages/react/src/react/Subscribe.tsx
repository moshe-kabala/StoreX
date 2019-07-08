import * as React from "react";
import { Dispatcher, DispatcherRegisterOptions } from "@storex/core";

export interface SubscribeProps {
  to:
    | Dispatcher
    | DispatcherRegisterOptions
    | (Dispatcher | DispatcherRegisterOptions)[];
  children: () => any;
}

export class Subscribe extends React.Component<SubscribeProps> {
  isUpdated = false;

  mounted = false;

  state = {
    dispatchers: undefined
  };

  update = state => {
    if (this.isUpdated) {
      return;
    }

    this.isUpdated = true;

    setTimeout(() => {
      if (this.mounted) {
        this.setState({});
        this.isUpdated = false;
      }
    }, 0);
  };

  componentWillMount() {
    const { to } = this.props;
    let dis: any = to;
    if (!(to instanceof Array)) {
      dis = [to];
    }
    Dispatcher.register(this.update, dis);
    this.state.dispatchers = dis; // not updating by setState
  }

  componentWillUnmount() {
    this.mounted = false;
    const { dispatchers } = this.state;
    Dispatcher.unregister(this.update, dispatchers);
  }

  render() {
    this.mounted = true;
    const { children } = this.props;
    return children();
  }
}
