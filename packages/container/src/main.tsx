import { createCollection } from "./collection";
import {createState} from "./state";
import {createView} from "./view";


const collection = createCollection({ itemToId: i => i.id });
const data = [{ id: 2, name: "moshe", age: 45 }];
const filter = createState();
const transform = ([collection, filter]) => {
    const data = collection.data;
    const query = new RegExp( filter.state.name || "", "i");
    return data.filter(i=> query.test(i.name));
}
const view = createView({
    dispatchers: [collection, filter],
    transform,
})
console.log("before", view.data)

collection.override(data);
console.log("after", view.data)