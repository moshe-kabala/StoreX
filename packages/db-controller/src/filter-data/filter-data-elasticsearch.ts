import { FilterData, Where, IFilterData } from "./filter-data";
import { limitObj } from "./types";
// import { sortObjDeprecated, sortObj, orders } from "./types";

export class FilterDataElasticSearch extends FilterData {
  constructor(filterData?: IFilterData, validateFunc?) {
    super(filterData, validateFunc);
  }

  get esFilter() {
    if (!this.where || this.where.length === 0) {
      return;
    }

    return {
      query: getConditionalFilterValue(this.where)
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

  fixFilterWhereValue(dic) {
    this.fixFilterWhere(dic, "value");
  }

  fixFilterWhereKey(dic) {
    this.fixFilterWhere(dic, "key");
    for (const s of this.sort) {
      if (dic[s.key]) {
        s.key = dic[s.key];
      }
    }
  }

  fixFilterWhereType(dic) {
    this.fixFilterWhere(dic, "type");
  }

  private fixFilterWhere(dic: object, key) {
    for (const w of this.where) {
      const val = dic[w.key];

      if (val === undefined) {
        continue;
      }

      if (typeof val === "function") {
        w[key] = val(w);
        continue;
      }

      if (typeof val === "string") {
        w[key] = val;
        continue;
      }
    }
  }
}

/* filters */
export function getConditionalFilterValue(condition) {
  // console.log("getConditionalFilterValue: condition: ", condition);
  /* array of conditions */
  if (Array.isArray(condition)) {
    // determine relation
    const relation = determineRelation(condition);
    // filter relation objects
    const conditions_no_relations = condition.filter(cond => {
      return cond.relation === undefined;
    });
    // calculate conditions
    const c = conditions_no_relations.map(cond => {
      return getConditionalFilterValue(cond);
    });
    // create skelaton
    let skelaton = { bool: {} };
    if (relation === "and") {
      skelaton.bool = { must: c };
    } else if (relation == "or") {
      skelaton.bool = { should: c };
    }
    // return struct
    return skelaton;
  }

  /* single condition */
  return getFilterValue(condition);
}

export function determineRelation(conditionsList: any[]): string {
  let relation = "and";
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
