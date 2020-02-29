import { flatKeys, flatObj } from "../../src/schema/flat-keys"
import "jest"

describe("FlatKeys", () => {
    test("standard input", () => {

        const result = flatKeys({
            type: "object",
            properties: {
                name: {
                    type: "string"
                },
                age: {
                    type: "number"
                },
                address: {
                    type: "object",
                    properties: {
                        x: { type: "number" },
                        y: { type: "number" }
                    }
                }
            }
        })
        console.log(result);
    })



    test("standard input", () => {

        const result = flatObj({
            name: "moshe",
            age: 30,
            address: {
                x: 3, y: 3
            },
            array: [4, 5, 6]
        })


        expect(result).toEqual({
            name: "moshe",
            age: 30,
            "address.x": 3,
            "address.y": 3,
        })
    })
})