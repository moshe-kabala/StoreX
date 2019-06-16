import { useEffect } from "react";
import { useUpdate } from "./useUpdate";

interface Subscriber {
  subscribe(f: any);
  unsubscribe(f: any);
}

export function useSubscriber(sub: Subscriber) {
  const update = useUpdate();
  useEffect(() => {
    function _update() {
      update();
    }
    sub.subscribe(_update);
    return () => {
      sub.unsubscribe(_update);
    };
  }, []);
}
