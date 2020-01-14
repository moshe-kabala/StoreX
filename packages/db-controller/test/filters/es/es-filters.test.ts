import { FilterDataElasticSearch } from "../../../src/filter-data/filter-data-elasticsearch";

describe("elasticsearch filter class tests", () => {
  test("test filter class initiation - empty filters", async () => {
    const filters = {
      where: [],
      sort: [],

    };
    const filter = new FilterDataElasticSearch(filters);

    expect(filter.esFilter).toBeUndefined();
    expect(filter.esLimit).toBeUndefined();
    expect(filter.esSortBy).toBeUndefined();


    const filters2 = {
      where: [],
      sort: [],
      itemPerPage: undefined,
      page: undefined

    };
    const filter2 = new FilterDataElasticSearch(filters2);
    expect(filter2.esFilter).toBeUndefined();
    expect(filter2.esLimit).toBeUndefined();
    expect(filter2.esSortBy).toBeUndefined();
  });
});
