import "jest";

import { KeyCache, KeyCacheEvents } from "../../src/cache";

describe("KeyCache", () => {
  let cache: KeyCache;
  beforeEach(() => {
    cache = new KeyCache();
  });

  test("test get, set and their events", () => {
    const pairs = getPairs(5);

    const gotPairs = [];

    const sotPairs = [];

    cache.on(KeyCacheEvents.get, (key, value) => {
      gotPairs.push({ key, value });
    });

    cache.on(KeyCacheEvents.set, (key, value) => {
      sotPairs.push({ key, value });
    });

    for (const { key, value } of pairs) {
      cache.set(key, value);
    }

    // test get and set
    for (const { key, value } of pairs) {
      expect(cache.get(key)).toBe(value);
    }

    // test the size
    expect(cache.size).toBe(pairs.length);

    // test get event
    expect(gotPairs).toEqual(pairs);

    // test set event
    expect(sotPairs).toEqual(pairs);
  });

  test("test events clean, remove and their events", () => {
    const pairs = getPairs(5);
    const expected_removedPair = pairs[2];

    let is_clean_event_handler_called = false;
    let actual_removedPair = {};

    cache.on(KeyCacheEvents.remove, (key, value) => {
      actual_removedPair = { key, value };
    });

    cache.on(KeyCacheEvents.clean, () => {
      is_clean_event_handler_called = true;
    });

    for (const { key, value } of pairs) {
      cache.set(key, value);
    }

    cache.remove(expected_removedPair.key);

    expect(cache.size).toBe(pairs.length - 1);
    expect(cache.get(expected_removedPair.key)).toBeNull;
    expect(actual_removedPair).toEqual(expected_removedPair);
    expect(is_clean_event_handler_called).toBe(false);

    cache.clean();
    expect(cache.size).toBe(0);
    expect(is_clean_event_handler_called).toBe(true);
  });
});

// helpers //

function getPairs(number = 4) {
  const pairs = [];

  for (let i = 1; i <= number; i++) {
    pairs.push({ key: "key" + i, value: "value" + i });
  }

  return pairs;
}
