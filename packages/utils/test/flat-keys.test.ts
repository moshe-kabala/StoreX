import { flatKeys } from "../src/schema/flat-keys"
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
})