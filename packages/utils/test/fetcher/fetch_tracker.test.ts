import "jest";
import { FetchTracker } from "../../src/fetcher";

describe("FetchTracker", () => {
  test("get start - get ended", async () => {
    const track = new FetchTracker();
    const key = "some key";
    const value = "value";

    track.start(key);

    expect(track.is_already_fetched(key)).toBeTruthy;

    setTimeout(() => {
      track.ended(key, value);
    }, 10);

    expect(await track.await_for(key)).toBe(value);
  });

  test("get start - get failed", async () => {
    const track = new FetchTracker();
    const key = "some key";
    const expected_error = new Error("Some err");

    track.start(key);

    expect(track.is_already_fetched(key)).toBeTruthy;

    setTimeout(() => {
      track.failed(key, expected_error);
    }, 10);

    let is_catch = false;
    try {
      await track.await_for(key);
    } catch (err) {
      is_catch = true;
      expect(err).toBe(expected_error);
    }
    // make sure the code was arrived to the catch block
    expect(is_catch).toBeTruthy;
  });

  test("get start - get ended, check the on ended event", async () => {
    const key = "some key";
    const wait_map = v => v + "_mapped";
    const value = "value";
    const mapped_value = wait_map(value);

    const track = new FetchTracker({ wait_map });
    let is_arrive_to_event_handler = false;

    // make sure that the value not changed by wait_map function
    track.onEnded((_key, _value) => {
      is_arrive_to_event_handler = true;
      expect(_key).toBe(key);
      expect(_value).toBe(value);
    });

    track.start(key);

    setTimeout(() => {
      track.ended(key, value);
    }, 10);

    expect(await track.await_for(key)).toBe(mapped_value);
    expect(is_arrive_to_event_handler).toBeTruthy;
  });

  test("get start - get ended, check await map", () => {
    const track = new FetchTracker();
    const key = "some key";
    const value = "value";
    let is_arrive_to_event_handler = false;

    track.onEnded((_key, _value) => {
      is_arrive_to_event_handler = true;
      expect(_key).toBe(key);
      expect(_value).toBe(value);
    });

    track.start(key);

    track.ended(key, value);

    expect(is_arrive_to_event_handler).toBeTruthy;
  });
});
