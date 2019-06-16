import { useState, useEffect } from "react";
import { Dispatcher, DispatcherRegisterOptions } from "@storex/core";

type disArgs =
  | Dispatcher
  | DispatcherRegisterOptions
  | (Dispatcher | DispatcherRegisterOptions)[];

type stateArgs = (Dispatcher | DispatcherRegisterOptions)[];

const useUpdate = () => {
  const [, setState] = useState(0);
  return () => setState(cnt => cnt + 1);
};

export function useDispatcher(dis: disArgs) {
  if (!(dis instanceof Array)) {
    dis = [dis] as stateArgs;
  }
  const _update = useUpdate();

  console.log("render...");

  useEffect(() => {
    console.log("effect...");

    function update() {
      _update();
    }
    const r = dis as stateArgs;
    Dispatcher.register(update, r);

    return () => {
      console.log("not effect...");
      Dispatcher.unregister(update, r);
    };
  }, []);
}
