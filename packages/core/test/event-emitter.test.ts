import { EventEmitter } from "../src/core/event-emitter";
import "jest";

describe("EventEmitter", () => {
  test("Base functionality", async () => {
    const eventEmitter = new EventEmitter();
    const event = "testEvent";
    const arg = "some_arg";
    let onCount = 0;
    eventEmitter.on(event, onFunc);
    eventEmitter.emit(event, arg);

    eventEmitter.removeListener(event, onFunc);
    eventEmitter.emit(event, arg);

    expect(onCount).toEqual(1);

    function onFunc(a) {
      onCount++;
      expect(a).toEqual(arg);
    }
  });
});
