import { Subscriber } from "./subscriber";
import { Dispatcher } from "./dispatcher";
import { subscribe } from "./subscribe";

export const des1 = new Dispatcher();
export const des2 = new Dispatcher();

export class DepIns extends Subscriber {
  count1 = 0;
  count2 = 0;

  constructor() {
    super({ to: [{ dispatcher: des1, name: "des1" }, des2] });
  }

  @subscribe(["des1"])
  update1() {
    this.count1++;
    console.log("update 1");
  }

  @subscribe()
  update2() {
    this.count2++;
    console.log("update 2");
  }

  @subscribe()
  updateAndDispatch2() {
    this.count2++;
    des1.dispatch();
    console.log("update and dispatch 2");
  }
}
