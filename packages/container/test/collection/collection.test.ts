import "jest";
import {generateList, itemToId, generateItem } from "../helpers/collection";
import { createCollection } from "../../src/collection";

describe("Collection", () => {
    test("Create new collection with data", ()=> {
        const collection = createCollection({itemToId});
        const data = generateList();
        collection.override(data);
        expect( collection.data).toHaveLength(data.length);
    })

    test("Add new item", ()=> {
        const collection = createCollection({itemToId});
        const item = generateItem();
        collection.add(item);
        expect( collection.data).toHaveLength(1);
        expect( collection.data[0]).toEqual(item);
    })

    test("Delete item", ()=> {
        const collection = createCollection({itemToId});
        const item = generateItem();
        collection.add(item);
        expect( collection.data).toHaveLength(1);
        collection.remove(item.id);
        expect( collection.data).toHaveLength(0);
    })

    test("Update item", ()=> {
        const collection = createCollection({itemToId});
        const item = generateItem();
        collection.add(item);
        expect( collection.data).toHaveLength(1);
        const updatedItem = {
            id: item.id,
            age: 36,
            name: "liav"
        }
        collection.update(updatedItem);
        expect( collection.data[0]).toEqual(updatedItem);
        expect( collection.data).toHaveLength(1);
    })

    test("Override", ()=> {
        const collection = createCollection({itemToId});
        const data = generateList(5);
        collection.override(data);
        expect( collection.data).toHaveLength(data.length);
        const data2 = generateList(10);
        collection.override(data2);
        expect( collection.data).toHaveLength(data2.length);
    })
});
