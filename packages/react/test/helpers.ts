import { Store, update } from "../src";

export enum StoreInsEvents {
  AddItem = "add-item",
  DeleteItem = "delete-item"
}

const events = Object.keys(StoreInsEvents);

export class StoreIns extends Store {
  args1 = [];
  args2;

  constructor() {
    super({ events });
    this.args1 = [];
  }

  @update([StoreInsEvents.AddItem])
  action1(item) {
    this.args1.push(item);
    this.dispatch();
  }

  @update()
  action2() {}

  @update()
  action3() {}

  @update()
  action4() {}
}
