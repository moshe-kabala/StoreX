import { FilterDataElasticSearch } from "../../../src/filter-data/filter-data-elasticsearch";
import {
  RelationEnum,
  typeOperators as op
} from "../../../src/filter-data/types";

describe("elasticsearch filter class tests", () => {
  // test("test filter class initiation - empty filters", async () => {
  //   const filters = {
  //     where: [],
  //     sort: []
  //   };
  //   const filter = new FilterDataElasticSearch(filters);

  //   expect(filter.esFilter).toBeUndefined();
  //   expect(filter.esLimit).toBeUndefined();
  //   expect(filter.esSortBy).toBeUndefined();

  //   const filters2 = {
  //     where: [],
  //     sort: [],
  //     itemPerPage: undefined,
  //     page: undefined
  //   };
  //   const filter2 = new FilterDataElasticSearch(filters2);
  //   expect(filter2.esFilter).toBeUndefined();
  //   expect(filter2.esLimit).toBeUndefined();
  //   expect(filter2.esSortBy).toBeUndefined();
  // });

  test("test filter class initiation - where filter", async () => {
    const key = "key";
    // const value = "value";
    // const filters = {
    //   where: [
    //     { key, operator: op.operators.eq, type: "string", value, path: "" },
    //     { key, operator: op.operators.eq, type: "string", value, path: "" }
    //   ]
    // };
    // const filter = new FilterDataElasticSearch(filters);

    // let where = filter.esFilter;

    // const expectedFilter = {
    //   query: {
    //     bool: {
    //       must: [{ term: { [key]: { value } } }, { term: { [key]: { value } } }]
    //     }
    //   }
    // };
    // expect(where).toEqual(expectedFilter);

    // const filters1 = {
    //   where: [
    //     { key, operator: op.operators.eq, type: "string", value, path: "" },
    //     { relation: RelationEnum.and },
    //     { key, operator: op.operators.eq, type: "string", value, path: "" }
    //   ]
    // };
    // const filter1 = new FilterDataElasticSearch(filters1);
    // let where1 = filter1.esFilter;

    // const expectedFilter1 = {
    //   query: {
    //     bool: {
    //       must: [{ term: { [key]: { value } } }, { term: { [key]: { value } } }]
    //     }
    //   }
    // };
    // expect(where1).toEqual(expectedFilter1);

    // const filters2 = {
    //   where: [
    //     { key, operator: op.operators.eq, type: "string", value, path: "" },
    //     { relation: RelationEnum.or },
    //     { key, operator: op.operators.eq, type: "string", value, path: "" }
    //   ]
    // };
    // const filter2 = new FilterDataElasticSearch(filters2);
    // let where2 = filter2.esFilter;

    // const expectedFilter2 = {
    //   query: {
    //     bool: {
    //       should: [
    //         { term: { [key]: { value } } },
    //         { term: { [key]: { value } } }
    //       ]
    //     }
    //   }
    // };
    // expect(where2).toEqual(expectedFilter2);

    const val1 = "val1";
    const val2 = "val2";
    const val3 = "val3";
    const filters3 = {
      where: [
        { key, operator: op.operators.eq, type: "string", value: val1, path: "" },
        { relation: RelationEnum.or },
        { key, operator: op.operators.eq, type: "string", value: val2, path: "" },
        { relation: RelationEnum.and },
        { key, operator: op.operators.eq, type: "string", value: val3, path: "" }
      ]
    };
    const filter3 = new FilterDataElasticSearch(filters3);
    let where3 = filter3.esFilter;

    const expectedFilter3 = {
      query: {
        bool: {
          should: [
            { term: { [key]: { value: val1 } } },
            {
              bool: {
                must: [
                  { term: { [key]: { value: val2 } } },
                  { term: { [key]: { value: val3 } } }
                ]
              }
            }
          ]
        }
      }
    };
    expect(where3).toEqual(expectedFilter3);


    // const filters3 = {
    //   where: [
    //     { relation: RelationEnum.or },
    //     { key, operator: op.operators.eq, type: "string", value, path: "" },
    //     [{ key, operator: op.operators.eq, type: "string", value, path: "" }]
    //   ]
    // };
    // const filter3 = new FilterDataElasticSearch(filters3);
    // let where3 = filter3.esFilter;

    // const expectedFilter3 = {
    //   query: {
    //     bool: {
    //       should: [
    //         { term: { [key]: { value } } },
    //         {
    //           bool: {
    //             must: [{ term: { [key]: { value } } }]
    //           }
    //         }
    //       ]
    //     }
    //   }
    // };
    // expect(where3).toEqual(expectedFilter3);
  });

  // test("test filter class initiation - sort filter", async () => {});

  // test("test filter class initiation - limit filter", async () => {});

  test("test filter class - insert path", async () => {
    // const path = "path";
    // const key = "a";
    // const value = "X";
    // const pathedKey = `${path}.${key}`;
    // const filters = {
    //   where: [{ key, operator: "=", type: "string", value, path }]
    // };
    // const filter = new FilterDataElasticSearch(filters);

    // let where = filter.esFilter;
    // const expectedFilter = {
    //   query: {
    //     bool: {
    //       must: [{ term: { [pathedKey]: { value } } }]
    //     }
    //   }
    // };
    // expect(where).toEqual(expectedFilter);

    //   const filters1 = {
    //     where: [
    //       { key, operator: "=", type: "string", value, path },
    //       { relation: "or" }
    //     ]
    //   };
    //   const filter1 = new FilterDataElasticSearch(filters1);

    //   let where1 = filter1.esFilter;
    //   const expectedFilter1 = {
    //     query: {
    //       bool: {
    //         must: [{ term: { [pathedKey]: { value } } }]
    //       }
    //     }
    //   };
    //   expect(where1).toEqual(expectedFilter1);

    // const filters2 = {
    //   where: [
    //     { key, operator: "=", type: "string", value, path },
    //     { key, operator: "=", type: "string", value, path },
    //     [{ key, operator: "=", type: "string", value, path }]
    //   ]
    // };

    // const filter2 = new FilterDataElasticSearch(filters2);
    // const where2 = filter2.esFilter;
    // const expectedFilter2 = {
    //   query: {
    //     bool: {
    //       must: [
    //         { term: { [pathedKey]: { value } } },
    //         { term: { [pathedKey]: { value } } },
    //         {
    //           bool: {
    //             must: [{ term: { [pathedKey]: { value } } }]
    //           }
    //         }
    //       ]
    //     }
    //   }
    // };
    // expect(where2).toEqual(expectedFilter2);

    // const filters3 = {
    //   where: [
    //     { key, operator: "=", type: "string", value, path },
    //     [
    //       { key, operator: "=", type: "string", value, path },
    //       [{ key, operator: "=", type: "string", value, path }]
    //     ]
    //   ]
    // };

    // const filter3 = new FilterDataElasticSearch(filters3);
    // const where3 = filter3.esFilter;
    // const expectedFilter3 = {
    //   query: {
    //     bool: {
    //       must: [
    //         { term: { [pathedKey]: { value } } },
    //         {
    //           bool: {
    //             must: [
    //               { term: { [pathedKey]: { value } } },
    //               {
    //                 bool: {
    //                   must: [{ term: { [pathedKey]: { value } } }]
    //                 }
    //               }
    //             ]
    //           }
    //         }
    //       ]
    //     }
    //   }
    // };
    // expect(where3).toEqual(expectedFilter3);
  });
});
