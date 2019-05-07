import { sort } from "../../src/filter";

describe("Sort", () => {
    test("Standard sort", () => {
        let sort_data = getSort();
        let data = getData();
        let res = sort(data, sort_data);
        expect(res.map(({ age }) => age)).toEqual([
            1, 2, 3, 4, 5, 6, 7, 8, 9
        ]);
    });

    test("Nested sort", () => {
        let sort_data = getNestedSort();
        let data = getData();
        let res = sort(data, sort_data);
        expect(res
            .map(({ obj }) => obj && obj.obj2 && obj.obj2.obj_prop)
            .filter(o => o)
        ).toEqual(["obj1_prop", "obj2_prop"])
    });
});


////////// helper /////////////

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
