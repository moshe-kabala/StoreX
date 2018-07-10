import { Dispatcher, dispatch } from "./";

export enum SortInsEvents {
  AddItem = "add-item",
  DeleteItem = "delete-item"
}

const events = Object.keys(SortInsEvents);

export class StoreIns extends Dispatcher {
  args1 = [];
  args2;

  constructor() {
    super({ events });
    this.args1 = [];
  }

  @dispatch([SortInsEvents.AddItem])
  action1(item) {
    this.args1.push(item);
    this.dispatch();
  }

  @dispatch()
  action2(items = []) {
    items.forEach(item => this.action1(item));
  }

  @dispatch()
  action3() {}

  @dispatch()
  action4() {}
}
