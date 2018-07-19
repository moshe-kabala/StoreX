
import {StoreIns} from "./examples"
import {wrapObject} from "./core/wrappers"
let counter = 0;
let obj: any = {name: "moshe"};
const store = wrapObject(obj);
store.register(()=> counter++);
store.context.name = "name";
store.context.age = 45;