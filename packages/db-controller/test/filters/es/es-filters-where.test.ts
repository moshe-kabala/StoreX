import { FilterDataElasticSearch } from "../../../src/filter-data/filter-data-elasticsearch";
import {
  RelationEnum,
  typeOperators as op
} from "../../../src/filter-data/types";

describe("elasticsearch filter class tests", () => {
  test("test filter class initiation - empty filters", async () => {
    const filters = {
      where: [],
      sort: []
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

  test("test filter class initiation - where filter relations - single hirerchy", async () => {
    const key = "key";
    const value = "value";
    const filters0 = {
      where: [
        { key, operator: op.operators.eq, type: "string", value, path: "" }
      ]
    };
    const filter0 = new FilterDataElasticSearch(filters0);
    let where0 = filter0.esFilter;
    const expectedFilter0 = {
      query: {
        bool: {
          must: [{ term: { [key]: { value } } }]
        }
      }
    };
    expect(where0).toEqual(expectedFilter0);

    const filters = {
      where: [
        { key, operator: op.operators.eq, type: "string", value, path: "" },
        { key, operator: op.operators.eq, type: "string", value, path: "" }
      ]
    };
    const filter = new FilterDataElasticSearch(filters);
    let where = filter.esFilter;
    const expectedFilter = {
      query: {
        bool: {
          must: [{ term: { [key]: { value } } }, { term: { [key]: { value } } }]
        }
      }
    };
    expect(where).toEqual(expectedFilter);

    const filters1 = {
      where: [
        { key, operator: op.operators.eq, type: "string", value, path: "" },
        { relation: RelationEnum.and },
        { key, operator: op.operators.eq, type: "string", value, path: "" }
      ]
    };
    const filter1 = new FilterDataElasticSearch(filters1);
    let where1 = filter1.esFilter;
    const expectedFilter1 = {
      query: {
        bool: {
          must: [{ term: { [key]: { value } } }, { term: { [key]: { value } } }]
        }
      }
    };
    expect(where1).toEqual(expectedFilter1);
    
    const filters2 = {
      where: [
        { key, operator: op.operators.eq, type: "string", value, path: "" },
        { relation: RelationEnum.or },
        { key, operator: op.operators.eq, type: "string", value, path: "" }
      ]
    };
    const filter2 = new FilterDataElasticSearch(filters2);
    let where2 = filter2.esFilter;
    const expectedFilter2 = {
      query: {
        bool: {
          should: [
            { term: { [key]: { value } } },
            { term: { [key]: { value } } }
          ]
        }
      }
    };
    expect(where2).toEqual(expectedFilter2);
    const val1 = "val1";
    const val2 = "val2";
    const val3 = "val3";
    const filters3 = {
      where: [
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val1,
          path: ""
        },
        { relation: RelationEnum.or },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val2,
          path: ""
        },
        { relation: RelationEnum.and },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val3,
          path: ""
        }
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
    const filters4 = {
      where: [
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val1,
          path: ""
        },
        { relation: RelationEnum.and },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val2,
          path: ""
        },
        { relation: RelationEnum.or },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val3,
          path: ""
        }
      ]
    };
    const filter4 = new FilterDataElasticSearch(filters4);
    let where4 = filter4.esFilter;
    const expectedFilter4 = {
      query: {
        bool: {
          should: [
            {
              bool: {
                must: [
                  { term: { [key]: { value: val1 } } },
                  { term: { [key]: { value: val2 } } }
                ]
              }
            },
            { term: { [key]: { value: val3 } } }
          ]
        }
      }
    };
    expect(where4).toEqual(expectedFilter4);
    const val4 = "val4";
    const val5 = "val5";
    const filters5 = {
      where: [
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val1,
          path: ""
        },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val2,
          path: ""
        },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val3,
          path: ""
        },
        { relation: RelationEnum.and },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val4,
          path: ""
        },
        { relation: RelationEnum.or },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val5,
          path: ""
        }
      ]
    };
    const filter5 = new FilterDataElasticSearch(filters5);
    let where5 = filter5.esFilter;
    const expectedFilter5 = {
      query: {
        bool: {
          should: [
            {
              bool: {
                must: [
                  { term: { [key]: { value: val1 } } },
                  { term: { [key]: { value: val2 } } },
                  { term: { [key]: { value: val3 } } },
                  { term: { [key]: { value: val4 } } }
                ]
              }
            },
            { term: { [key]: { value: val5 } } }
          ]
        }
      }
    };
    expect(where5).toEqual(expectedFilter5);
    const filters6 = {
      where: [
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val1,
          path: ""
        },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val2,
          path: ""
        },
        { relation: RelationEnum.or },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val3,
          path: ""
        },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val4,
          path: ""
        }
      ]
    };
    const filter6 = new FilterDataElasticSearch(filters6);
    let where6 = filter6.esFilter;
    const expectedFilter6 = {
      query: {
        bool: {
          should: [
            {
              bool: {
                must: [
                  { term: { [key]: { value: val1 } } },
                  { term: { [key]: { value: val2 } } }
                ]
              }
            },
            {
              bool: {
                must: [
                  { term: { [key]: { value: val3 } } },
                  { term: { [key]: { value: val4 } } }
                ]
              }
            }
          ]
        }
      }
    };
    expect(where6).toEqual(expectedFilter6);
  });

  test("test filter class initiation - where filter relations - multiple hirerchy", async () => {
    const key = "key";
    const val1 = "val1",
      val2 = "val2",
      val3 = "val3";
    const filters = {
      where: [
        [
          {
            key,
            operator: op.operators.eq,
            type: "string",
            value: val1,
            path: ""
          },
          { relation: RelationEnum.or },
          {
            key,
            operator: op.operators.eq,
            type: "string",
            value: val2,
            path: ""
          }
        ],
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val3,
          path: ""
        }
      ]
    };
    const filter = new FilterDataElasticSearch(filters);
    let where = filter.esFilter;

    const expectedFilter = {
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  { term: { [key]: { value: val1 } } },
                  { term: { [key]: { value: val2 } } }
                ]
              }
            },
            { term: { [key]: { value: val3 } } }
          ]
        }
      }
    };
    expect(where).toEqual(expectedFilter);

    const val4 = "val4";
    const filters1 = {
      where: [
        [
          {
            key,
            operator: op.operators.eq,
            type: "string",
            value: val1,
            path: ""
          },
          { relation: RelationEnum.or },
          {
            key,
            operator: op.operators.eq,
            type: "string",
            value: val2,
            path: ""
          }
        ],
        { relation: RelationEnum.or },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val3,
          path: ""
        },
        { relation: RelationEnum.or },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val4,
          path: ""
        }
      ]
    };
    const filter1 = new FilterDataElasticSearch(filters1);
    let where1 = filter1.esFilter;

    const expectedFilter1 = {
      query: {
        bool: {
          should: [
            {
              bool: {
                should: [
                  { term: { [key]: { value: val1 } } },
                  { term: { [key]: { value: val2 } } }
                ]
              }
            },
            { term: { [key]: { value: val3 } } },
            { term: { [key]: { value: val4 } } }
          ]
        }
      }
    };
    expect(where1).toEqual(expectedFilter1);

    const filters2 = {
      where: [
        [
          {
            key,
            operator: op.operators.eq,
            type: "string",
            value: val1,
            path: ""
          },
          { relation: RelationEnum.or },
          {
            key,
            operator: op.operators.eq,
            type: "string",
            value: val2,
            path: ""
          }
        ],
        { relation: RelationEnum.or },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val3,
          path: ""
        },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val4,
          path: ""
        }
      ]
    };
    const filter2 = new FilterDataElasticSearch(filters2);
    let where2 = filter2.esFilter;

    const expectedFilter2 = {
      query: {
        bool: {
          should: [
            {
              bool: {
                should: [
                  { term: { [key]: { value: val1 } } },
                  { term: { [key]: { value: val2 } } }
                ]
              }
            },
            {
              bool: {
                must: [
                  { term: { [key]: { value: val3 } } },
                  { term: { [key]: { value: val4 } } }
                ]
              }
            }
          ]
        }
      }
    };
    expect(where2).toEqual(expectedFilter2);

    // const filters3 = {
    //   where: [
    //     [
    //       {
    //         key,
    //         operator: op.operators.eq,
    //         type: "string",
    //         value: val1,
    //         path: ""
    //       },
    //       [
    //         {
    //           key,
    //           operator: op.operators.eq,
    //           type: "string",
    //           value: val2,
    //           path: ""
    //         },
    //         { relation: RelationEnum.or },
    //         {
    //           key,
    //           operator: op.operators.eq,
    //           type: "string",
    //           value: val3,
    //           path: ""
    //         }
    //       ]
    //     ],
    //     {
    //       key,
    //       operator: op.operators.eq,
    //       type: "string",
    //       value: val4,
    //       path: ""
    //     }
    //   ]
    // };
    // const filter3 = new FilterDataElasticSearch(filters3);
    // let where3 = filter3.esFilter;

    // const expectedFilter3 = {
    //   query: {
    //     bool: {
    //       must: [
    //         {
    //           bool: {
    //             must: [
    //               { term: { [key]: { value: val1 } } },
    //               {
    //                 bool: {
    //                   should: [
    //                     { term: { [key]: { value: val2 } } },
    //                     { term: { [key]: { value: val3 } } }
    //                   ]
    //                 }
    //               }
    //             ]
    //           }
    //         },
    //         { term: { [key]: { value: val4 } } }
    //       ]
    //     }
    //   }
    // };
    // expect(where3).toEqual(expectedFilter3);
  });
});
