import "jest";
import { FilterDataMongo } from "./../../../src/filter-data/filter-data-mongo";
import { orders } from "../../../src/filter-data/types";

const asc = orders.asc;
const desc = orders.desc;
const mongoReverse = -1;
const MongoNotREverse = 1;
describe("filter data class tests - sort structs", () => {
  test("test sort object creator - backward compitability", async () => {
    const key = "somekey";
    let reverse = true;
    let sorts = [];
    let sort1 = { key, reverse };
    sorts = [sort1];
    let expectedResponse = [{ [key]: mongoReverse }];

    const filters = {
      sort: sorts
    };

    let filter = new FilterDataMongo(filters);
    let sortResponse = filter.mongoSortBy;
    expect(sortResponse).toEqual(expectedResponse);

    const key2 = "somekey2";
    sort1 = { key, reverse };
    const sort2 = { key: key2, reverse: !reverse };
    sorts = [sort1, sort2];
    const expectedResponse2 = [
      { [key]: mongoReverse },
      { [key2]: MongoNotREverse }
    ];

    const filters2 = {
      sort: sorts
    };

    let filter2 = new FilterDataMongo(filters2);
    let sortResponse2 = filter2.mongoSortBy;
    expect(sortResponse2).toEqual(expectedResponse2);
  });

  test("test sort object creator", async () => {
    const key = "somekey";
    let order = asc;
    let sorts = [];
    let sort1 = { key, order };
    sorts = [sort1];

    let expectedResponse = [{ [key]: MongoNotREverse }];

    let filters = {
      sort: sorts
    };

    let filter = new FilterDataMongo(filters);
    let sortResponse = filter.mongoSortBy;
    expect(sortResponse).toEqual(expectedResponse);

    let order2 = desc;
    const key2 = "somekey2";
    let sort2 = { key: key2, order: order2 };
    sorts = [sort1, sort2];
    let expectedResponse2 =  [{ [key]: MongoNotREverse }, { [key2]: mongoReverse }]

    filters = {
      sort: sorts
    };

    filter = new FilterDataMongo(filters);
    sortResponse = filter.mongoSortBy;
    expect(sortResponse).toEqual(expectedResponse2);
  });
});
