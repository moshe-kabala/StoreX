import { Store, update } from "./";

export enum SortInsEvents {
  AddItem = "add-item",
  DeleteItem = "delete-item"
}

const events = Object.keys(SortInsEvents);

export class StoreIns extends Store {
  args1 = [];
  args2;

  constructor() {
    super({ events });
    this.args1 = [];
  }

  @update([SortInsEvents.AddItem])
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
