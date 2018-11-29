import { getPageItems, sort, where } from "./";

export class FilterFunctions {
  where = where;
  sort = sort;
  getPageItems = getPageItems;
}

function createDefaultItemsPerPage() {
  return function(items, filterData) {
    return getPageItems(items, filterData.page, filterData.itemsPerPage);
  };
}

function createDefaultFreeSearch() {
  // var filterFunc ="" $filter("freeSearch");
  var filterFunc = freeSearch;
  return function(items, filterData, metaData) {
    // todo create general free search filter function
    var query = filterData.freeSearch;
    return filterFunc(items, query, metaData);
  };
}

// todo
function freeSearch(items, query, metaData) {
  if (!query) return items;
  query = query.toLowerCase();
  var newItems = items.filter(function(log) {
    // search..
  });
  return newItems;
}
