import { FilterData, IFilterData } from "./filter-data";
import {
  limitObj,
  Where,
  WhereRelationFilter,
  WhereFilterList,
  RelationEnum,
  defaultRelation,
  sortObj,
  filtersTypes,
  defaultFilterType,
  typeOperators as op
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
    return getFilterValue(condition as Where);
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
    return getConditionalFilterValue(cond as Where);
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

function getFilterValue(condition: Where) {
  let { type = defaultFilterType, value, operator, key } = condition;
  switch (type) {
    case filtersTypes.boolean:
      if (operator === op.operators.eq) {
        return { match: { [key]: value } };
      } else if (operator === op.operators.ne) {
        return { bool: { must_not: [{ match: { [key]: value } }] } };
      }
      break;
    case filtersTypes.numeric:
      if (operator === op.operators.eq) {
        return { match: { [key]: value } };
      } else if (operator === op.operators.ne) {
        return { bool: { must_not: [{ match: { [key]: value } }] } };
      } else if (operator === op.operators.gt) {
        return { range: { [key]: { gt: value } } };
      } else if (operator === op.operators.lt) {
        return { range: { [key]: { lt: value } } };
      } else if (operator === op.operators.gte) {
        return { range: { [key]: { gte: value } } };
      } else if (operator === op.operators.lte) {
        return { range: { [key]: { lte: value } } };
      } else if (operator === op.operators.inrange) {
        return { range: { [key]: { lte: value[1], gte: value[0] } } };
      }
      break;
    case filtersTypes.string:
      if (operator === op.operators.eq) {
        return { term: { [key]: { value } } };
      } else if (operator === op.operators.ne) {
        return { bool: { must_not: [{ term: { [key]: { value } } }] } };
      } else if (operator === op.operators.like) {
        return { match: { [key]: { value } } };
      } else if (operator === op.operators.unlike) {
        return { bool: { must_not: [{ match: { [key]: { value } } }] } };
      } else if (operator === op.operators.regex) {
        return { regexp: { [key]: { value } } };
      }
      break;

    case filtersTypes.freeSearch:
      const q = { query_string: { query: value } };
      if (operator === op.operators.like) {
        return q;
      } else if (operator === op.operators.unlike) {
        return { bool: { must_not: [q] } };
      } else if (operator === op.operators.regex) {
        q.query_string.query = createRegex(value);
        return q;
      } else if (operator === op.operators.regexnot) {
        q.query_string.query = createRegex(value);
        return { bool: { must_not: [q] } };
      }
      break;
  }
}

function createRegex(expression: string) {
  return `/${expression}/`;
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
