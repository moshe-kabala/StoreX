import { FilterData, Where, IFilterData } from "./filter-data";

export class FilterDataElasticSearch extends FilterData {
  constructor(filterData?: IFilterData, validateFunc?) {
    super(filterData, validateFunc);
  }

  get esFilter() {
    if (!this.where || this.where.length === 0) {
      return {};
    }

    const filters = getConditionalFilterValue(this.where);

    // const f = this.where.map(condition => {
    //   return getConditionalFilterValue(condition);
    // })

    return {
      query: filters
    };
  }

  get esSortBy() {
    if (!this.sort || this.sort.length === 0) {
      return;
    }
    const sortObj = {};
    this.sort.forEach(item => {
      sortObj[item.key] = item.reverse ? 1 : -1;
    });
    return sortObj;
  }

  filter = (f: (w, i?) => Boolean): this => {
    this.where = this.where.filter(f);
    return this;
  };

  map = (m: (w, i?) => Where): this => {
    this.where = this.where.map(m);
    return this;
  };

  insertPath = (): this => {
    for (const w of this.where) {
      if (w.path) {
        w.key = `${w.path}.${w.key}`;
      }
    }
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

export function determineRelation(conditionsList: any[]): string{
  let relation = "and";
  const relations = conditionsList.filter(cond => { return cond.relation });
  if(!relations || relations.length === 0){
    return relation;
  }
  return relations[0].relation;
}

export function getConditionalFilterValue(condition) {
  // console.log("getConditionalFilterValue: condition: ", condition);
  /* array of conditions */
  if (Array.isArray(condition)) {
    // determine relation
    const relation = determineRelation(condition);
    // filter relation objects
    const conditions_no_relations = condition.filter(cond => { return cond.relation === undefined });
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
      }
      break;
  }
}

function getFilterValue2(where: Where) {
  let { type = "string", value, operator } = where;
  let key: string | object = where.key;
  let val;
  switch (type) {
    case "bool":
    case "boolean":
      val = operator === "!" ? { $ne: Number(value) } : { $eq: Number(value) };
      break;
    case "number":
      if (operator === "!") {
        val = { $ne: value };
      } else if (operator === ">") {
        val = { $gt: value };
      } else if (operator === "<") {
        val = { $lt: value };
      } else {
        val = value;
      }
      break;
    case "multi-range":
      if (operator === "=") {
        val = {
          min: value,
          max: value
        };
      } else if (operator === "!") {
        if (typeof value === "object") {
          val = {
            $not: {
              $elemMatch: { min: { $lte: value.max }, max: { $gte: value.min } }
            }
          };
        } else {
          val = {
            $not: { $elemMatch: { min: { $lte: value }, max: { $gte: value } } }
          };
        }
      } else if (operator === ">") {
        if (typeof value === "object") {
          value = value.max;
        }
        val = { $gt: value };
        key = key + ".max";
      } else if (operator === "<") {
        if (typeof value === "object") {
          value = value.min;
        }
        val = { $lt: value };
        key = key + ".min";
      } else {
        if (typeof value === "object") {
          val = {
            $elemMatch: { min: { $lte: value.max }, max: { $gte: value.min } }
          };
        } else {
          val = { $elemMatch: { min: { $lte: value }, max: { $gte: value } } };
        }
      }
      break;
    case "array":
    case "enum":
      if (value && value instanceof Array && value.length > 0) {
        val = { $in: value };
        if (operator === "!") {
          val = { $not: val };
        }
      }
      break;
    case "string":
    default:
      val =
        operator === "!~"
          ? { $not: new RegExp(value, "i") }
          : new RegExp(value, "i");
  }
  return { key: key, val: val };
}
