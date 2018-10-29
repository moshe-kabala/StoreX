import { Dispatcher, dispatch } from "./";

export enum StoreInsEvents {
  AddItem = "add-item",
  DeleteItem = "delete-item"
}

const events = Object.keys(StoreInsEvents);

export class StoreIns extends Dispatcher {
  args1 = [];
  
  @dispatch()
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


const dispatcher = new StoreIns();


let count = 0;
const func = () => count++;
dispatcher.register(func);
dispatcher.dispatchOnce(() => {
  dispatcher.args2 = 4;
  dispatcher.args2 = 5;
  // dispatcher.action1("new item");
});

