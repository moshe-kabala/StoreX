
import {StoreIns} from "./examples"
const items = ["moshe", "liav", "amit"];
let count = 0;

const dispatcher = new StoreIns();

dispatcher.register(s => {
  count++;
});

dispatcher.action2(items); // call to action1 multiple times
expect(count).toBe(1);
