import "jest";
import { createKeyCache } from "../../src/cache";

describe("createKeyCache", () => {
  test("Test the integration of limit and tracker to the cache", () => {
    const pairs = getPairs(4);
    const expected_limited_pair = pairs[0];
    const expected_removed_pair = pairs[1];

    const data = createKeyCache({ limit: 3 });

    for (const { key } of pairs) {
      data.tracker.start(key);
    }

    for (const { key, value } of pairs) {
      data.tracker.ended(key, value);
    }

    // expect the size of the cache to not be exact 3
    expect(data.cache.size).toBe(3);
    // expect that the limited was removed from the cache
    expect(data.cache.get(expected_limited_pair.key)).toBeNull;

    data.cache.remove(expected_removed_pair.key);
    expect(data.limiter.__node_map.get(expected_removed_pair.key))
      .toBeUndefined;

    data.cache.clean();
    expect(data.limiter.__node_map.size).toBe(0);
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
