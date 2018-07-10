import { Dispatcher, dispatch } from "../../src";

export enum StoreInsEvents {
  AddItem = "add-item",
  DeleteItem = "delete-item"
}

const events = Object.keys(StoreInsEvents);

export class StoreIns extends Dispatcher {
  args1 = [];
  args2;

  constructor() {
    super({ events });
    this.args1 = [];
  }

  @dispatch([StoreInsEvents.AddItem])
  action1(item) {
    this.args1.push(item);
    this.dispatch();
  }

  @dispatch()
  action2(items = []) {
    items.forEach(item => this.action1(item));
  }

}
