import { runQuery, FuncOpts, sort } from "./filter";


function main() {
  let sort_data = getNestedSort();
  let data = getData();
  let res = sort(data, sort_data);
}

function getNestedSort() {
  return [{ key: "obj_prop", path: "obj.obj2", reverse: false }];
}

function getSort() {
  return [{ key: "age", reverse: false }];
}

function getData() {
  return [
      {
          age: 1,
          name: "name1",
          obj: { prop: "prop1", obj2: { obj_prop: "obj2_prop" } }
      },
      { age: 3, name: "name3", obj: { prop: "prop3" } },
      { age: 2, name: "name2", obj: { prop: "prop2" } },
      { age: 5, name: "name5", obj: { prop: "prop5" } },
      { age: 7, name: "name7", obj: { prop: "prop7", obj2: { obj_prop: "obj1_prop" } } },
      { age: 6, name: "name6", obj: { prop: "prop6" } },
      { age: 4, name: "name4", obj: { prop: "prop4" } },
      { age: 8, name: "name8", obj: { prop: "prop8" } },
      { age: 9, name: "name15", obj: undefined }
  ];
}


main();

