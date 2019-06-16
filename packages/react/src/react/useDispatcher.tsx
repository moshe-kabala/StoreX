import { useState, useEffect } from "react";
import { Dispatcher, DispatcherRegisterOptions } from "@storex/core";
import { useUpdate } from "./useUpdate";

type disArgs =
  | Dispatcher
  | DispatcherRegisterOptions
  | (Dispatcher | DispatcherRegisterOptions)[];

type stateArgs = (Dispatcher | DispatcherRegisterOptions)[];

export function useDispatcher(dis: disArgs) {
  if (!(dis instanceof Array)) {
    dis = [dis] as stateArgs;
  }
  const update = useUpdate();

  useEffect(() => {
    function _update() {
      update();
    }
    const r = dis as stateArgs;
    Dispatcher.register(_update, r);

    return () => {
      Dispatcher.unregister(_update, r);
    };
  }, []);
}
