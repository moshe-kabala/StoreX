import * as React from "react";
import { ProviderProps } from "react";

interface Provider extends ProviderProps<any> {
  // todo
  provider;
}

interface ProvidersProps {
  providers: Provider[];
}

export class Providers extends React.Component<ProvidersProps, any> {
  render() {
    const { providers } = this.props;
    let result = this.props.children;
    providers.forEach(
      ({ provider: ProviderWrapper, ...args }) =>
        (result = <ProviderWrapper {...args}>{result}</ProviderWrapper>)
    );
    return result;
  }
}
