import { FilterData, IFilterData } from "./filter-data";
import {
  limitObj,
  Where,
  WhereRelationFilter,
  WhereFilterList,
  typeOperators,
  RelationEnum,
  defaultRelation
} from "./types";

export class FilterDataElasticSearch extends FilterData {
  constructor(filterData?: IFilterData, validateFunc?) {
    super(filterData, validateFunc);
  }

  get esFilter() {
    if (!this.where || this.where.length === 0) {
      return;
    }

    console.log("array before simplifying: ", this.where);
    let simpleWhereStructure = makeSimple(this.where);
    if (!Array.isArray(simpleWhereStructure)) {
      simpleWhereStructure = [simpleWhereStructure];
    }
    console.log("array after simplifying: ", simpleWhereStructure);

    return {
      query: getConditionalFilterValue(simpleWhereStructure)
    };
  }

  get esSortBy() {
    if (!this.sort || this.sort.length === 0) {
      return;
    }
    return {
      sort: getSortValue(this.sort)
    };
  }

  get esLimit() {
    const limit = this.limitData;
    if (!limit) return;
    return getLimitValue(limit);
  }

  filter = (f: (w, i?) => Boolean): this => {
    this.where = this.where.filter(f);
    return this;
  };

  map = (m: (w, i?) => Where): this => {
    this.where = this.where.map(m);
    return this;
  };
}

/* filters */

// export function getConditionalFilterValue2(condition) {
//   // console.log("getConditionalFilterValue: condition: ", condition);
//   /* array of conditions */
//   if (Array.isArray(condition)) {
//     // determine relation
//     const relation = determineRelation(condition);
//     // filter relation objects
//     const conditions_no_relations = condition.filter(cond => {
//       return cond.relation === undefined;
//     });
//     // calculate conditions
//     const c = conditions_no_relations.map(cond => {
//       return getConditionalFilterValue(cond);
//     });
//     // create skelaton
//     let skelaton = { bool: {} };
//     if (relation === "and") {
//       skelaton.bool = { must: c };
//     } else if (relation == "or") {
//       skelaton.bool = { should: c };
//     }
//     // return struct
//     return skelaton;
//   }

//   /* single condition */
//   return getFilterValue(condition);
// }

export function getConditionalFilterValue(
  condition: WhereRelationFilter | WhereFilterList
) {
  /* single condition */
  if (!Array.isArray(condition)) {
    return getFilterValue(condition);
  }
  /* array of condition */

  // determine relation
  const relation = determineRelation(condition);
  // filter relation objects
  const conditions_no_relations = (condition as any[]).filter(cond => {
    return cond["relation"] === undefined;
  });
  // calculate conditions
  const c = conditions_no_relations.map(cond => {
    return getConditionalFilterValue(cond);
  });
  // create skelaton
  let skelaton = { bool: {} };
  if (relation === RelationEnum.and) {
    skelaton.bool = { must: c };
  } else if (relation == RelationEnum.or) {
    skelaton.bool = { should: c };
  }
  // return struct
  return skelaton;
}

function makeSimple(conditions: WhereFilterList) {
  const groupsList = [];
  let currentGroup = [];
  let orExist: boolean = false;
  for (const filter of conditions) {
    // console.log("exemining filter: ", filter)
    if (Array.isArray(filter)) {
      currentGroup.push(makeSimple(filter));
    } else if (
      typeof filter === "object" &&
      filter["relation"] === RelationEnum.or
    ) {
      // if or relation - close current group and add to groups list
      // console.log("filter of or relation type")
      if (currentGroup.length === 1) {
        groupsList.push(currentGroup[0]);
      } else {
        groupsList.push(currentGroup);
      }
      currentGroup = [];
      orExist = true;
    } else if (
      typeof filter === "object" &&
      filter["relation"] === RelationEnum.and
    ) {
      // if "and" relation ignore
      // console.log("filter of and relation type")
      continue;
    } else {
      // else add to current group
      // console.log("addying filter to current group:")
      // console.log("filter: ", filter)
      // console.log("currentGroup: ", currentGroup)
      currentGroup.push(filter);
    }
  }
  if (currentGroup.length === 1) {
    groupsList.push(currentGroup[0]);
  } else if (currentGroup.length > 1) {
    groupsList.push(currentGroup);
  }
  if (orExist) {
    groupsList.push({ relation: RelationEnum.or });
  }
  // console.log("makeSimple: before flattning: ", groupsList)
  if (groupsList.length === 1) {
    return groupsList[0];
  }
  return groupsList;
  // return groupsList.reduce((accumulator, value) => accumulator.concat(value), []);
}

export function determineRelation(conditionsList: any[]): string {
  let relation = defaultRelation;
  const relations = conditionsList.filter(cond => {
    return cond.relation;
  });
  if (!relations || relations.length === 0) {
    return relation;
  }
  return relations[0].relation;
}

function getFilterValue(condition) {
  // console.log("getConditionalFilterValue: condition: ", condition);
  let { type = "string", value, operator, key } = condition;
  switch (type) {
    case "boolean":
      if (operator === "=") {
        return { match: { [key]: value } };
      } else if (operator === "!=") {
        return { bool: { must_not: [{ match: { [key]: value } }] } };
      }
      break;
    case "number":
      if (operator === "=") {
        return { match: { [key]: value } };
      } else if (operator === "!=") {
        return { bool: { must_not: [{ match: { [key]: value } }] } };
      } else if (operator === ">") {
        return { range: { [key]: { gt: value } } };
      } else if (operator === "<") {
        return { range: { [key]: { lt: value } } };
      } else if (operator === ">=") {
        return { range: { [key]: { gte: value } } };
      } else if (operator === "<=") {
        return { range: { [key]: { lte: value } } };
      } else if (operator === "<>") {
        return { range: { [key]: { lte: value[1], gte: value[0] } } };
      }
      break;
    case "string":
      if (operator === "=") {
        return { term: { [key]: { value } } };
      } else if (operator === "!=") {
        return { bool: { must_not: [{ term: { [key]: { value } } }] } };
      } else if (operator === "~") {
        return { match: { [key]: { value } } };
      } else if (operator === "!~") {
        return { bool: { must_not: [{ match: { [key]: { value } } }] } };
      } else if (operator === "regex") {
        return { regexp: { [key]: { value } } };
      }
      break;
  }
}

/* sort */
export function getSortValues(sortList: any[]) {
  return sortList.map(sort => {
    return getSortValue(sort);
  });
}

function getSortValue(sortObject /*: sortObjDeprecated | sortObj*/) {
  /* single sort */
  /* backward compitability */
  let order;
  if (sortObject["reverse"] !== undefined) {
    // preveious version
    order = sortObject["reverse"] ? "desc" : "asc";
  } else {
    // current version
    order = sortObject["order"];
  }
  return {
    [sortObject.key]: { order }
  };
}

/* limit */
export function getLimitValue(limit: limitObj) {
  return {
    from: limit.from,
    size: limit.limit
  };
}
