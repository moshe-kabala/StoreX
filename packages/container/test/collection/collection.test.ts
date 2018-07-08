import "jest";
import {generateList, itemToId } from "../helpers/collection";
import { createCollection } from "../../src/collection";

describe("Collection", () => {
    test("Create new collection with data", ()=> {
        const collection = createCollection(itemToId);
        const data = generateList();
        collection.override(data);
        expect( collection.data).toHaveLength(data.length);
    })

    test("Add new item", ()=> {
        
    })

    test("Delete item", ()=> {
        
    })

    test("Update item", ()=> {
        
    })

    test("Override", ()=> {
        
    })
});
