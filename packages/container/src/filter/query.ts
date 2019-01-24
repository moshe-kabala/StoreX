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
    const dividedArgs = {
      onNew: (key, item) => ({ key, count: 1 }),
      onAdd: (key, item, previous) => previous.count++,
      getCount: (item) => item.count

    }
    const { key, path } = group;
    context.grouped = { count: 0, key, path }
    if (divided) {
      for (const [k, v] of data) {
        const tempContext: any = {}
        v.value = data.map(data => groupBy({ data: v.value, group, ...dividedArgs, context: tempContext }))
        if (tempContext.count > context.grouped.count) {
          context.grouped.count = tempContext.count
        }

      }
    } else {
      data = groupBy({ data, group, ...dividedArgs, context: context.grouped })
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

  if (!group && columns) {
    const k = flatSchema({ schema, includeObject: true }).reduce((o, { key, path = "", schema }) => {
      o[`${path ? `${path}.` : ``}${key}`] = schema;
      return o;
    }, {})
    schema = {
      type: "object",
      properties: columns.reduce((o, { key, path = "", alias }) => {
        const d = k[`${path ? `${path}.` : ``}${key}`];
        if (!d) {
          return;
        }
        const title = alias || d.title || key
        d.title = title;
        o[`${path ? `${path}.` : ``}${key}`] = d;
        return o;
      }, {})
    }
    data = data.map(d => {
      const n = {};
      columns.map(({ key, path, alias }) => {
        n[key] = getNestedKey(d, { key, path });

      })
    })
  } else if (group) {
    // todo
  }
  // return schema
  return { data, context, schema };
}


