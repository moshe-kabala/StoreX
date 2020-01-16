import "jest";
import {
  getConditionalFilterValue,
  determineRelation
} from "../../../src/filter-data/filter-data-elasticsearch";
import { RelationEnum } from "../../../src/filter-data/types";

const keyA = "a";
const valA = true;
const keyB = "b";
const valB = "some string";
const conditionA = {
  key: keyA,
  type: "boolean",
  value: valA,
  operator: "=",
  path: ""
};

const conditionB = {
  key: keyB,
  type: "boolean",
  value: valB,
  operator: "=",
  path: ""
};

describe("filter data class tests - relations structs", () => {
  test("test relation determination method", async () => {
    // single "or"
    const relationA = "or";
    let relationObj = { relation: relationA };
    let request = [relationObj];
    let expectedResponse = relationA;
    let response = determineRelation(request);
    expect(response).toEqual(expectedResponse);

    // single "and"
    const relationB = "and";
    const relationObjB = { relation: relationB };
    request = [relationObjB];
    expectedResponse = relationB;
    response = determineRelation(request);
    expect(response).toEqual(expectedResponse);

    // multiple relations - should be determined by first appearence
    request = [relationObj, relationObjB];
    expectedResponse = relationA;
    response = determineRelation(request);
    expect(response).toEqual(expectedResponse);

    request = [relationObjB, relationObj];
    expectedResponse = relationB;
    response = determineRelation(request);
    expect(response).toEqual(expectedResponse);

    // relations with other objects
    const request2 = [relationObj, {somefield: "someval"}, {somefield2: "someval2"}, {somefield3: { somefiled4: "someval3" }}];
    expectedResponse = relationA;
    response = determineRelation(request2);
    expect(response).toEqual(expectedResponse);
  });

  test("create or relation group filter", async () => {
    const relation = { relation: RelationEnum.or };

    const request = [conditionA, relation, conditionB];

    let expectedResponse = {
      bool: {
        should: [{ match: { [keyA]: valA } }, { match: { [keyB]: valB } }]
      }
    };

    let response = getConditionalFilterValue(request);
    expect(response).toEqual(expectedResponse);
  });
});
