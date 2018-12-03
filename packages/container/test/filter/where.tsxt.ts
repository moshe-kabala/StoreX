import { where } from "../../src/filter";

describe("Where", () => {
  test("Standard where filter", () => {
    let where_data = getAgeWhere();
    let data = getData();
    let res = where(data, where_data);
    expect(res).toHaveLength(data.filter(i => i.age === 56).length);
  });

  test("Nested where filter", () => {
    let where_data = getNestedWhere();
    let data = getData();
    let res = where(data, where_data);
    expect(res).toHaveLength(1);
  });
});

////////// helper /////////////

function getNestedWhere() {
  return [{ key: "obj_prop", value: "obj1_prop", path: "obj.obj2" }];
}

function getAgeWhere() {
  return [{ key: "age", value: 56, path: "" }];
}

function getData() {
  return [
    {
      age: 56,
      name: "name1",
      obj: { prop: "prop1", obj2: { obj_prop: "obj1_prop" } }
    },
    { age: 56, name: "name2", obj: { prop: "prop2" } },
    { age: 56, name: "name3", obj: { prop: "prop3" } },
    { age: 56, name: "name4", obj: { prop: "prop4" } },
    { age: 56, name: "name5", obj: { prop: "prop5" } },
    { age: 56, name: "name6", obj: { prop: "prop6" } },
    { age: 48, name: "name7", obj: { prop: "prop7" } },
    { age: 56, name: "name8", obj: { prop: "prop8" } },
    { age: 56, name: "name9", obj: { prop: "prop9" } },
    { age: 56, name: "name10", obj: { prop: "prop10" } },
    { age: 56, name: "name11", obj: { prop: "prop11" } },
    { age: 56, name: "name12", obj: { prop: "prop12" } },
    { age: 56, name: "name13", obj: { prop: "prop13" } },
    { age: 56, name: "name14", obj: { prop: "prop14" } },
    { age: 56, name: "name15", obj: undefined }
  ];
}
