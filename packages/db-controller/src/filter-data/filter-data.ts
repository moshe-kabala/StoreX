import * as Ajv from "ajv";
import { limitObj } from "./types";

const defaultPage = 1;
const defaultItemPerPage = 1000;

export interface IBaseFilter {
  where: Where[];
}

export interface Where {
  key: string;
  path: string;
  value: string | Array<string> | any;
  type?: string;
  operator?: string;
}

export interface IFilterData extends IBaseFilter {
  sort?: { key: string; reverse: boolean }[];
  itemPerPage?: number;
  page?: number;
}

export class BaseFilter implements IBaseFilter {
  where: Where[];
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
    for (const w of this.where) {
      if (w.path) {
        w.key = `${w.path}.${w.key}`;
      }
    }
    return this;
  };
}

export class FilterData extends BaseFilter implements IFilterData {
  sort: { key: string; reverse: boolean }[];
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
    },
  };

  return filterDataSchema;
}
