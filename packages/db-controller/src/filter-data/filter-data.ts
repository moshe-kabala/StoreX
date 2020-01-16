import * as Ajv from "ajv";
import {
  limitObj,
  sortObjDeprecated,
  Filter,
  Where,
  WhereRelationFilter,
  WhereFilterList,
  Sort,
  sortObj,
  orders
} from "./types";

const defaultPage = 1;
const defaultItemPerPage = 1000;

export interface IBaseFilter {
  where?: WhereFilterList;
}

export interface IFilterData extends IBaseFilter {
  sort?: Sort[];
  itemPerPage?: number;
  page?: number;
}

export class BaseFilter implements IBaseFilter {
  where: WhereFilterList;
  constructor(filterData: IBaseFilter, private validatorFunc) {
    this.where = filterData.where || [];
    this.insertPath();
  }
  valid() {
    if (!this.validatorFunc) {
      throw new Error("validatorFunc not defined!!");
    }
    this.validatorFunc(this);
    return this.validatorFunc.errors;
  }

  insertPath = (): this => {
    // flatten where
    const flattenWhereList: Where[] = this.flattenWhere(this.where);
    // iterate over all simple where object and insert path
    for (const w of flattenWhereList) {
      if (w && w.path) {
        w.key = `${w.path}.${w.key}`;
      }
    }
    return this;
  };

  flattenWhere = (
    whereList: WhereFilterList | WhereRelationFilter
  ): Where[] => {
    if (typeof whereList === "object" && whereList["key"] !== undefined) {
      // if Where
      return [whereList as Where];
    } else if (
      typeof whereList === "object" &&
      whereList["realtion"] !== undefined
    ) {
      // if relation
      return;
    } else if (whereList instanceof Array) {
      // if a list
      const list = whereList as WhereFilterList;
      const list2 = list.map(item => {
        return this.flattenWhere(item);
      });
      return list2.reduce((acc, val) => acc.concat(val), []);
    }
  };
}

export class FilterData extends BaseFilter implements IFilterData {
  sort: Sort[];
  itemPerPage: number;
  page: number;
  constructor(filterData: IFilterData, validatorFunc?) {
    super(filterData, validatorFunc);
    this.page = filterData["page"] || defaultPage;
    this.itemPerPage = filterData["itemsPerPage"]; // || defaultItemPerPage;
    this.sort = filterData["sort"] || [];
  }

  /**
   * return the limitation data of the filter if itemPerPage and page was set.
   *
   * @returns
   * @memberof FilterData
   */
  get limitData(): limitObj {
    if (this.itemPerPage && this.page) {
      return {
        from: this.itemPerPage * (this.page - 1),
        to: this.itemPerPage * this.page,
        limit: this.itemPerPage
      };
    }
  }

  valid() {
    const error = super.valid();
    return error;
  }

  convertDepracetedFormatToNewFormat(sortObj: Sort): sortObj {
    /* object undefined */
    if (!sortObj) {
      return;
    }
    /* old format object */
    if (sortObj["reverse"] !== undefined) {
      return {
        key: sortObj.key,
        order: sortObj["reverse"] ? orders.desc : orders.asc
      };
    } else {
      /* current format object */
      return sortObj as sortObj;
    }
  }

  getSortValues(sortList: Sort[], sortConverter: Function) {
    /* convert deprecated format to new format */
    const newSortFormat: sortObj[] = sortList.map(sortObj => {
      return this.convertDepracetedFormatToNewFormat(sortObj);
    });

    return newSortFormat.map(sort => {
      return sortConverter(sort);
    });
  }
}

export function createFilterDataValidator(fields) {
  const v = new Ajv();
  const filterDataSchema = createSchema(fields);
  const validFilterDataFunc = v.compile(filterDataSchema);
  return validFilterDataFunc;
}

/////////////////////////////

export const sortSchema = fields => ({
  id: "#sort",
  type: "object",
  properties: {
    key: {
      type: "string",
      enum: fields
    },
    revers: {
      type: "boolean"
    }
  }
});

const filterTypes = ["string", "number", "bool", "boolean", "enum", "array"];

export const whereSchema = fields => ({
  id: "#where",
  type: "object",
  properties: {
    key: {
      type: "string",
      enum: fields
    },
    path: { type: "string" },
    operator: { type: "string", enum: ["<", ">", "!", "=", "~", "!~"] },
    value: {
      anyOf: [
        { type: "string" },
        { type: "number" },
        { type: "boolean" },
        { type: "array", items: { type: "string" } },
        { type: "array", items: { type: "number" } }
      ]
    },
    type: {
      type: "string",
      enum: filterTypes
    }
  },
  required: ["key", "value"]
});

function createSchema(fields: string[]) {
  const _sortSchema = sortSchema(fields);

  const _whereSchema = whereSchema(fields);

  const filterDataSchema = {
    id: "#filterData",
    type: "object",
    properties: {
      sort: {
        type: "array",
        items: _sortSchema
      },
      where: {
        type: "array",
        item: _whereSchema
      },
      itemPerPage: { type: "integer", minimum: 1 },
      page: { type: "integer", minimum: 0 }
    }
  };

  return filterDataSchema;
}
