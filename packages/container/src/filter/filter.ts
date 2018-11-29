import { Where, Sort, FilterFunctions } from "./";

export interface dataTransformArgs {
  data: any[];
  where?: Where[];
  sort?: Sort[];
  page?: number;
  itemsPerPage?: number;
  context: any;
  schema?;
  filterFunctions?: FilterFunctions;
}

export function filter({
  data,
  where,
  sort,
  page,
  itemsPerPage,
  schema,
  context,
  filterFunctions
}: dataTransformArgs) {
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
  if (context) {
    context.length = data.length;
  }
  if (page && itemsPerPage) {
    data = getPageItems(data, page, itemsPerPage);
  }
  return data;
}
