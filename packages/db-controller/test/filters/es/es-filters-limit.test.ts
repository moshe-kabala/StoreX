import "jest";
import { getLimitValue } from "../../../src/filter-data/filter-data-elasticsearch";
import { limitObj } from "../../../src/filter-data/types";

describe("filter data class tests - limit records structs", () => {
  test("test limit object creator", async () => {
    let request: limitObj = {
      limit: 30,
      from: 30,
      to: 90
    };

    const expectedResponse = {
      from: 30,
      size: 30
    };
    const response = getLimitValue(request);
    expect(response).toEqual(expectedResponse);
  });
});
