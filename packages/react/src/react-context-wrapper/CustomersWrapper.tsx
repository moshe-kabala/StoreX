import * as React from "react";
import { Consumer } from "react";

interface ConsumersProps {
  consumers: Consumer<any>[];
  children: (...args) => React.EmbedHTMLAttributes<any>;
}

export class Consumers extends React.Component<ConsumersProps, any> {
  render() {
    const { consumers, children } = this.props;
    let args = [];
    consumers.forEach(ConsumerWrapper => (
      <ConsumerWrapper>
        {arg => {
          args.push(arg);
          return <span />;
        }}
      </ConsumerWrapper>
    ));
    return children(...args);
  }
}
