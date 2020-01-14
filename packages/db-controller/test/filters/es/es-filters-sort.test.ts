import "jest";
import { getSortValues } from "../../../src/filter-data/filter-data-elasticsearch";

const asc = "asc";
const desc = "desc";
describe("filter data class tests - sort structs", () => {
  test("test sort object creator - backward compitability", async () => {
    const key = "somekey";
    let reverse = true;
    let sorts = [];
    let sort1 = { key, reverse };
    sorts = [sort1];
    let expectedResponse = [{ [key]: { order: desc } }];

    let response = getSortValues(sorts);
    expect(response).toEqual(expectedResponse);


    reverse = false;
    sort1 = { key, reverse };
    sorts = [sort1];
    expectedResponse = [{ [key]: { order: asc } }];

    response = getSortValues(sorts);
    expect(response).toEqual(expectedResponse);
  });

  test("test sort object creator", async () => {
    const key = "somekey";
    let order = asc;
    let sorts = [];
    let sort1 = { key, order };
    sorts = [sort1];

    let expectedResponse = [{ [key]: { order: asc } }];

    let response = getSortValues(sorts);
    expect(response).toEqual(expectedResponse);

    order = desc;
    sort1 = { key, order };
    sorts = [sort1];
    expectedResponse = [{ [key]: { order } }];
    
    response = getSortValues(sorts);
    expect(response).toEqual(expectedResponse);
  });
});
