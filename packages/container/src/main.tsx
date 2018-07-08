import {createCollection} from "./collection"

const collection = createCollection((i)=> i.id);
const data = [{id: 2, name: "moshe", age: 45}];
collection.override(data);