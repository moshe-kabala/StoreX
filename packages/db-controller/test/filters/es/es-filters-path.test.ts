import { FilterDataElasticSearch } from "../../../src/filter-data/filter-data-elasticsearch";
import {
  RelationEnum,
  typeOperators as op
} from "../../../src/filter-data/types";

describe("elasticsearch filter class tests", () => {
  test("test filter class - insert path", async () => {
    const path = "path.path2";
    const key = "a";
    const value = "X";
    const pathedKey = `${path}.${key}`;
    const filters = {
      where: [{ key, operator: "=", type: "string", value, path }]
    };
    const filter = new FilterDataElasticSearch(filters);
    let where = filter.esFilter;
    const expectedFilter = {
      query: {
        bool: {
          must: [{ term: { [pathedKey]: { value } } }]
        }
      }
    };
    expect(where).toEqual(expectedFilter);

    const val1 = "val1",
      val2 = "val2";
    const filters1 = {
      where: [
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val1,
          path
        },
        { relation: RelationEnum.and },
        {
          key,
          operator: op.operators.eq,
          type: "string",
          value: val2,
          path
        }
      ]
    };
    const filter1 = new FilterDataElasticSearch(filters1);
    let where1 = filter1.esFilter;
    const expectedFilter1 = {
      query: {
        bool: {
          must: [
            { term: { [pathedKey]: { value: val1 } } },
            { term: { [pathedKey]: { value: val2 } } }
          ]
        }
      }
    };
    expect(where1).toEqual(expectedFilter1);

    const filters2 = {
      where: [
        { key, operator: "=", type: "string", value, path },
        { relation: RelationEnum.or },
        [
          { key, operator: "=", type: "string", value, path },
          { relation: RelationEnum.or },
          { key, operator: "=", type: "string", value, path }
        ]
      ]
    };
    const filter2 = new FilterDataElasticSearch(filters2);
    const where2 = filter2.esFilter;
    const expectedFilter2 = {
      query: {
        bool: {
          should: [
            { term: { [pathedKey]: { value } } },
            {
              bool: {
                should: [
                  { term: { [pathedKey]: { value } } },
                  { term: { [pathedKey]: { value } } }
                ]
              }
            }
          ]
        }
      }
    };
    expect(where2).toEqual(expectedFilter2);
  });
});
