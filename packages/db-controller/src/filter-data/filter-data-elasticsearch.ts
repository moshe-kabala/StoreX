import { FilterData, IFilterData } from "./filter-data";
import {
  limitObj,
  Where,
  WhereRelationFilter,
  WhereFilterList,
  RelationEnum,
  defaultRelation,
  sortObj
} from "./types";

export class FilterDataElasticSearch extends FilterData {
  constructor(filterData?: IFilterData, validateFunc?) {
    super(filterData, validateFunc);
  }

  get esFilter() {
    if (!this.where || this.where.length === 0) {
      return;
    }

    // console.log("array before simplifying: ", this.where);
    let simpleWhereStructure = this.makeSimple(this.where);
    if (!Array.isArray(simpleWhereStructure)) {
      simpleWhereStructure = [simpleWhereStructure];
    }
    // console.log("array after simplifying: ", simpleWhereStructure);

    return {
      query: getConditionalFilterValue(simpleWhereStructure)
    };
  }

  get esSortBy() {
    if (!this.sort || this.sort.length === 0) {
      return;
    }
    return {
      sort: this.getSortValues(this.sort, getSortValue)
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
function getSortValue(sortObject: sortObj) {
  return {
    [sortObject.key]: { order: sortObject.order }
  };
}

/* limit */
export function getLimitValue(limit: limitObj) {
  return {
    from: limit.from,
    size: limit.limit
  };
}
