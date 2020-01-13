import "jest";
import { getConditionalFilterValue } from "./../../../src/filter-data/filter-data-elasticsearch";

describe("filter data class tests", () => {
  test("create boolean filter - single", async () => {
    const key = "a";
    const val = true;
    const condition = {
      key,
      type: "boolean",
      value: val,
      operator: "=",
      path: ""
    };

    const request = [condition];

    const expectedResponse = {
      bool: {
        must: [{ match: { [key]: val } }]
      }
    };

    const response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse);
  });
});
