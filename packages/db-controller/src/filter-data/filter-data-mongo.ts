import { FilterData, IFilterData } from "./filter-data";
import { Where, orders, sortObj, typeOperators as op, filtersTypes } from "./types";

export class FilterDataMongo extends FilterData {
  constructor(filterData?: IFilterData, validateFunc?) {
    super(filterData, validateFunc);
  }

  get mongoFilter() {
    if (!this.where || this.where.length === 0) {
      return {};
    }

    const filter = {};
    for (let w of this.where) {
      // temp - TODO - support new filter format
      if(w["key"] === undefined){
        continue;
      }
      w = w as Where;
      // temp
      const filterKeyVal = getFilterValue(w);
      if (filterKeyVal.val !== "" && filterKeyVal.val !== undefined) {
        filter[filterKeyVal.key] = filterKeyVal.val;
      }
    }
    return filter;
  }

  get mongoSortBy() {
    if (!this.sort || this.sort.length === 0) {
      return;
    }
    return this.getSortValues(this.sort, getSortValue);
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
    for (let w of this.where) {
      
      // temp - TODO - support new filter format
      if(w["key"] === undefined){
        continue;
      }
      w = w as Where;
      // temp

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

function getFilterValue(where: Where) {
  let { type = "string", value, operator } = where;
  let key: string /*| object */ = where.key;
  let val;
  switch (type) {
    case "bool":
    case filtersTypes.boolean:
      val = operator === op.operators.not ? { $ne: Number(value) } : { $eq: Number(value) };
      break;
    case filtersTypes.numeric:
      if (operator === op.operators.not) {
        val = { $ne: value };
      } else if (operator === op.operators.gt) {
        val = { $gt: value };
      } else if (operator === op.operators.lt) {
        val = { $lt: value };
      } else {
        val = value;
      }
      break;
    case "multi-range":
      if (operator === op.operators.eq) {
        val = {
          min: value,
          max: value
        };
      } else if (operator === op.operators.not) {
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
      } else if (operator === op.operators.gt) {
        if (typeof value === "object") {
          value = value.max;
        }
        val = { $gt: value };
        key = key + ".max";
      } else if (operator === op.operators.lt) {
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
        if (operator === op.operators.not) {
          val = { $not: val };
        }
      }
      break;
    case filtersTypes.string:
    default:
      val =
        operator === op.operators.unlike
          ? { $not: new RegExp(value, "i") }
          : new RegExp(value, "i");
  }
  return { key: key, val: val };
}

/* sort */
function getSortValue(sortObject: sortObj) {
  return {
    [sortObject.key]: sortObject["order"] === orders.asc ? 1 : -1
  };
}
