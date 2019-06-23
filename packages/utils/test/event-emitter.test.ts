import { EventEmitter } from "../src/event-emitter";
import "jest";


describe("EventEmitter", () => {
    test("Base functionality", async () => {
        const eventEmitter = new EventEmitter();
        eventEmitter.on("testEvent", onFunc);

        // await sleep(1000);

        eventEmitter.emit("testEvent", "printMe");

        function onFunc(args) {
            expect(args).toEqual([[
                "printMe"
            ]])
        }
    })
})