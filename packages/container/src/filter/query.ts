import { Where, Sort, FilterFunctions } from "./";
import { createWhereSchema } from "./where";
import { createSortSchema } from "./sort";
import { createGroupBySchema, groupBy } from "./group-by";
import { flatSchema } from "@storex/utils/lib/schema";
import { getNestedKey } from "@storex/utils/lib/schema/get-nested-obj";


export const createQuerySchema = ({ fields } = { fields: undefined }) => {
  const _sortSchema = createSortSchema(fields);
  const _whereSchema = createWhereSchema(fields);

  return {
    id: "#filterData",
    type: "object",
    properties: {
      columns: {
        type: "array",
        item: {
          type: "object",
          properties: {
            key: { type: "string" },
            path: { type: "string" },
            alias: { type: "string" },

          },
          required: ["key"]
        }
      },
      sort: {
        type: "array",
        items: _sortSchema
      },
      where: {
        type: "array",
        item: _whereSchema
      },
      divided: createGroupBySchema(fields),
      group: createGroupBySchema(fields),
      itemPerPage: { type: "integer", minimum: 1 },
      page: { type: "integer", minimum: 0 },
      export: {
        type: "object",
        properties: {
          format: { type: "string", enum: ["json", "pdf", "xlsx", "csv"] }
        }
      }
    },
  };
}

export interface Query {
  columns?: any[]
  where?: Where[];
  sort?: Sort[];
  divided?,
  group?,
  page?: number;
  itemsPerPage?: number;
  schema?;
  filterFunctions?: FilterFunctions;
}

export function runQuery(data, {
  columns,
  where,
  sort,
  divided,
  group,
  page,
  itemsPerPage,
  schema,
}: Query, filterFunctions?: FilterFunctions) {
  if (!filterFunctions) {
    filterFunctions = new FilterFunctions();
  }
  const { where: filterBy, sort: sortBy, getPageItems } = filterFunctions;
  if (where) {
    data = filterBy(data, where, schema);
  }
  if (sort) {
    data = sortBy(data, sort);
  }
  const context: any = {}
  context.length = data.length;


  if (divided) {
    const dividedArgs = {
      onNew: (key, item) => ({ key, value: [item] }),
      onAdd: (key, item, previous) => previous.value.push(item),
      getCount: (item) => item.value.length

    }
    const { key, path } = divided;
    context.divided = { count: 0, key, path }
    data = groupBy({ data, group: divided, ...dividedArgs, context: context.divided })
  }

  if (group) {

    const { key, path, aggregated_fields } = group;
    // function to create the aggragated function fields
    const funcs = getAggregatedFunction(aggregated_fields);

    // update the status
    const updateFunc = (current, state) => {
      if (funcs) {
        for (const { get } of funcs) {
          state = get({ current, state })
        }
      }
      return state
    }

    const updateAfterFunc = (data) => {
      const after = (funcs || []).filter(({ after }) => !!after).map(({ after }) => after);
      if (after.length == 0) {
        return;
      }
      for (let state of data) {

        for (const a of after) {
          let { count } = state;
          state = a({ state, count })
        }
      }
    }

    const dividedArgs = {
      onNew: (key, current) => {
        let state = { key, count: 1 };
        return updateFunc(current, state)
      },
      onAdd: (key, current, state) => {
        state.count++
        updateFunc(current, state);
      },
      getCount: (item) => item.count

    }
    context.grouped = { count: 0, key, path }
    if (divided) {
      for (const [k, v] of data) {
        const tempContext: any = {}
        v.value = data.map(data => groupBy({ data: v.value, group, ...dividedArgs, context: tempContext }))
        if (tempContext.count > context.grouped.count) {
          context.grouped.count = tempContext.count
        }
        updateAfterFunc(v.value);
      }
    } else {
      data = groupBy({ data, group, ...dividedArgs, context: context.grouped })
      updateAfterFunc(data)
    }
  }





  if (page && itemsPerPage) {
    if (divided) {
      for (const v of data) {
        v.value = getPageItems(v.value, page, itemsPerPage);
      }
    } else {

      data = getPageItems(data, page, itemsPerPage);
    }
  }

  // flat key value
  const k = flatSchema({ schema, includeObject: true }).reduce((o, { key, path = "", schema }) => {
    o[`${path ? `${path}.` : ``}${key}`] = schema;
    return o;
  }, {})

  if (!group && columns) {
    schema = {
      type: "object",
      properties: columns.reduce((o, { key, path = "", alias }) => {
        let d = k[`${path ? `${path}.` : ``}${key}`];
        if (!d) {
          return o;
        }
        d = { ...d };
        const title = alias || d.title || key
        d.title = title;
        o[`${path ? `${path}.` : ``}${key}`] = d;
        return o;
      }, {})
    }
    // mapping the data to selected columns
    data = data.map(d => {
      const n = {};
      columns.map(({ key, path, alias }) => {
        n[key] = getNestedKey(d, { key, path });

      })
      return n;
    })
  } else if (group) {
    const { key, path, aggregated_fields = [] } = group;
    const sche = k[`${path ? `${path}.` : ``}${key}`]

    schema = {
      type: "object",
      properties: {
        key: sche,
        count: {
          type: "number"
        },
        ...(aggregated_fields.reduce((o, { key, path, func, alias }) => {

          let d = k[`${path ? `${path}.` : ``}${key}`];
          if (!d) {
            return o;
          }
          d = { ...d };
          const title = alias || d.title || key
          d.title = title;

          o[getGroupFunctionPath({ key, path, func })] = d;
          return o;
        }, {}))
      }
    }

  }
  // return schema
  return { data, context, schema };
}

function getAggregatedFunction(fields) {
  if (!fields) {
    return
  }
  const funcs = [];
  for (const { key, path, func, alias } of fields) {
    funcs.push(_getAggregatedFunction({ key, path, func, alias }))
  }
  return funcs;
}

export enum FuncOpts {
  MAX = "MAX",
  MIN = "MIN",
  SUM = "SUM",
  AVG = "AVG"
}

function _getAggregatedFunction({ key, path, func, alias }) {
  const k = getGroupFunctionPath({ key, path, func });

  let f, after;
  switch (func) {
    case FuncOpts.MAX:
      f = (x, y) => x > y ? x : y;
      break;
    case FuncOpts.MIN:
      f = (x, y) => x > y ? y : x;
      break;
    case FuncOpts.AVG:
      after = ({ value, count }) => value / count;
    case FuncOpts.SUM:
      f = (x, y) => x + y
      break;
  }

  return {
    get: ({ current, state = {} }) => {
      if (current) {
        const curVal = getNestedKey(current, { key, path })
        const stateVal = state[k];
        let v;
        if (stateVal !== undefined && curVal != undefined) {
          v = f(curVal, stateVal)
        } else {
          v = curVal == undefined ? stateVal : curVal
        }

        if (v !== undefined) {
          state[k] = v;
        }

        return state
      }
    },
    after: after ? ({ state, count }) => {
      let v;
      if (state) {
        const value = state[k];
        if (value !== undefined) {
          state[k] = after({ value, count })
        }
      }
      return state;
    } : undefined
  }
}

function getGroupFunctionPath({ key, path, func }) {
  return `${path ? `${path}.` : ``}${key}_${func}`
}