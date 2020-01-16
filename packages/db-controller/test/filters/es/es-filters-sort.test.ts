import "jest";
import {
  getSortValues,
  FilterDataElasticSearch
} from "../../../src/filter-data/filter-data-elasticsearch";
import { orders } from "../../../src/filter-data/types";

const asc = orders.asc;
const desc = orders.desc;
describe("filter data class tests - sort structs", () => {
  test("test sort object creator - backward compitability", async () => {
    const key = "somekey";
    let reverse = true;
    let sorts = [];
    let sort1 = { key, reverse };
    sorts = [sort1];
    let expectedResponse = { sort: [{ [key]: { order: desc } }] };

    const filters = {
      sort: sorts
    };

    let filter = new FilterDataElasticSearch(filters);
    let sortResponse = filter.esSortBy;
    expect(sortResponse).toEqual(expectedResponse);

    reverse = false;
    const key2 = "somekey2";
    sort1 = { key, reverse };
    const sort2 = { key: key2, reverse: !reverse };
    sorts = [sort1, sort2];
    const expectedResponse2 = {
      sort: [{ [key]: { order: asc } }, { [key2]: { order: desc } }]
    };

    const filters2 = {
      sort: sorts
    };

    let filter2 = new FilterDataElasticSearch(filters2);
    let sortResponse2 = filter2.esSortBy;
    expect(sortResponse2).toEqual(expectedResponse2);
  });

  test("test sort object creator", async () => {
    const key = "somekey";
    let order = asc;
    let sorts = [];
    let sort1 = { key, order };
    sorts = [sort1];

    let expectedResponse = { sort: [{ [key]: { order } }] };

    let filters = {
      sort: sorts
    };

    let filter = new FilterDataElasticSearch(filters);
    let sortResponse = filter.esSortBy;
    expect(sortResponse).toEqual(expectedResponse);

    let order2 = desc;
    const key2 = "somekey2";
    let sort2 = { key: key2, order: order2 };
    sorts = [sort1, sort2];
    let expectedResponse2 = { sort: [{ [key]: { order } }, { [key2]: { order: order2 } }] };

    filters = {
      sort: sorts
    };

    filter = new FilterDataElasticSearch(filters);
    sortResponse = filter.esSortBy;
    expect(sortResponse).toEqual(expectedResponse2);

    // order = desc;
    // sort1 = { key, order };
    // sorts = [sort1];
    // expectedResponse = [{ [key]: { order } }];

    // response = getSortValues(sorts);
    // expect(response).toEqual(expectedResponse);
  });
});
