import { MultiEventsEmitter } from "../src/core";
import "jest";

describe("MultiEventsEmitter", () => {
  test("Base functionality", async () => {
    const multiEventsEmitter = new MultiEventsEmitter();
    const event = "testEvent";
    const arg = "some_arg";
    let onCount = 0;
    multiEventsEmitter.on(event, onFunc);
    multiEventsEmitter.emit(event, arg);

    multiEventsEmitter.removeListener(event, onFunc);
    multiEventsEmitter.emit(event, arg);

    expect(onCount).toEqual(1);

    function onFunc(a) {
      onCount++;
      expect(a).toEqual(arg);
    }
  });

  test("add many events (more than 11)", async () => {
    const multiEventsEmitter = new MultiEventsEmitter();
    const event = "testEvent";
    const arg = "some_arg";
    let onCount = 0;
    
    const funcs = [];


    for (let i = 0; i< 100; i++) {
      funcs.push(createOnFunction())
    }

    funcs.forEach(f=>multiEventsEmitter.on(event, f));
    multiEventsEmitter.emit(event, arg);

    funcs.forEach(f=>multiEventsEmitter.removeListener(event, f));
    multiEventsEmitter.emit(event, arg);

    expect(onCount).toEqual(funcs.length);


    function createOnFunction() {
      return (a)=> {
        onCount++;
        expect(a).toEqual(arg);
      }
    }
  });
});


