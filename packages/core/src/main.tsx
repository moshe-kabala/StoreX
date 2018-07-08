import { Store } from "./core";
import {StoreIns} from "./examples"

const items = ["moshe", "liav", "amit"];
let count = 0;
const store = new StoreIns();


store.listen(s => {
  count++;
});

store.action2(items);
