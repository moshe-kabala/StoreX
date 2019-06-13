import { useState, useEffect } from "react";
import { Dispatcher, DispatcherRegisterOptions } from "@storex/core";

type disArgs =
  | Dispatcher
  | DispatcherRegisterOptions
  | (Dispatcher | DispatcherRegisterOptions)[];

type stateArgs = (Dispatcher | DispatcherRegisterOptions)[];

export function useDispatcher(dis: disArgs) {
  if (!(dis instanceof Array)) {
    dis = [dis] as stateArgs;
  }
  const [_dis, setDis] = useState<stateArgs>(dis);

  console.log("render...");

  useEffect(() => {
    console.log("effect...");

    function update() {
      setDis(dis as stateArgs);
    }
    const r = _dis;
    Dispatcher.register(update, _dis);

    return () => {
      console.log("not effect...");
      Dispatcher.unregister(update, r);
    };
  });
}
