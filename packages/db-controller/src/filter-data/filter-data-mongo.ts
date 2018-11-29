import { FilterData, Where, IFilterData } from "./filter-data";

export class FilterDataMongo extends FilterData {
  constructor(filterData?: IFilterData, validateFunc?) {
    super(filterData, validateFunc);
  }

  get mongoFilter() {
    if (!this.where || this.where.length === 0) {
      return {};
    }

    const filter = {};
    for (const w of this.where) {
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

function getFilterValue(where: Where) {
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
      if (operator === "!") {
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
