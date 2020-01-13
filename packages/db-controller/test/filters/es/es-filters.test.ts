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

    let request = [condition];

    let expectedResponse = {
      bool: {
        must: [{ match: { [key]: val } }]
      }
    };

    let response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse);

    condition.operator = "!=";
    request = [condition];

    let expectedResponse2 = {
      bool: {
        must: [
          {
            bool: {
              must_not: [{ match: { [key]: val } }]
            }
          }
        ]
      }
    };

    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse2);
  });

  test("create numeric filter - single", async () => {
    const key = "a";
    const val = 1;
    const condition = {
      key,
      type: "number",
      value: val,
      operator: "=",
      path: ""
    };

    let request = [condition];

    let expectedResponse = {
      bool: {
        must: [{ match: { [key]: val } }]
      }
    };

    let response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse);

    condition.operator = "!=";
    request = [condition];

    let expectedResponse2 = {
      bool: {
        must: [
          {
            bool: {
              must_not: [{ match: { [key]: val } }]
            }
          }
        ]
      }
    };

    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse2);
  });
});
