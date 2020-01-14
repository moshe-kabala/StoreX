import "jest";
import { getConditionalFilterValue } from "../../../src/filter-data/filter-data-elasticsearch";

describe("filter data class tests - operators structs", () => {
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
    let condition = {
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

    condition.operator = ">";
    request = [condition];

    let expectedResponse3 = {
      bool: {
        must: [
          {
            range: {
              [key]: {
                gt: val
              }
            }
          }
        ]
      }
    };
    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse3);

    condition.operator = "<";
    request = [condition];

    let expectedResponse4 = {
      bool: {
        must: [
          {
            range: {
              [key]: {
                lt: val
              }
            }
          }
        ]
      }
    };
    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse4);

    condition.operator = ">=";
    request = [condition];

    let expectedResponse5 = {
      bool: {
        must: [
          {
            range: {
              [key]: {
                gte: val
              }
            }
          }
        ]
      }
    };
    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse5);

    condition.operator = "<=";
    request = [condition];

    let expectedResponse6 = {
      bool: {
        must: [
          {
            range: {
              [key]: {
                lte: val
              }
            }
          }
        ]
      }
    };
    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse6);

    const val1 = val;
    const val2 = val1 + 1;
    const condition2 = {
      key,
      type: "number",
      value: [val1, val2],
      operator: "<>",
      path: ""
    };
    const request2 = [condition2];

    let expectedResponse7 = {
      bool: {
        must: [
          {
            range: {
              [key]: {
                lte: val2,
                gte: val1
              }
            }
          }
        ]
      }
    };

    response = getConditionalFilterValue(request2);
    expect(response).toEqual(expectedResponse7);
  });

  test("create string filter - single", async () => {
    const key = "a";
    let val = "some string";
    let condition = {
      key,
      type: "string",
      value: val,
      operator: "=",
      path: ""
    };

    let request = [condition];

    let expectedResponse = {
      bool: {
        must: [{ term: { [key]: { value: val } } }]
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
              must_not: [{ term: { [key]: { value: val } } }]
            }
          }
        ]
      }
    };
    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse2);

    condition.operator = "~";
    let expectedResponse3 = {
      bool: {
        must: [{ match: { [key]: { value: val } } }]
      }
    };

    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse3);

    condition.operator = "!~";
    let expectedResponse4 = {
      bool: {
        must: [
          {
            bool: {
              must_not: [{ match: { [key]: { value: val } } }]
            }
          }
        ]
      }
    };

    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse4);

    condition.operator = "regex";
    val = "some regex.* string";
    condition.value = val;
    request = [condition];
    let expectedResponse5 = {
      bool: {
        must: [
          {
            regexp: {
              [key]: {
                value: val
              }
            }
          }
        ]
      }
    };

    response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse5);
  });
});
