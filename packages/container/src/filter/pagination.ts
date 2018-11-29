export function getPageItems(list, page, itemsPerPage) {
  if (list instanceof Array) {
    return ifArray(list, page, itemsPerPage);
  } else if (list instanceof Object) {
    return ifObject(list, page, itemsPerPage);
  }
  throw new TypeError("Pagination can only be done on an Array or an Object");
}

function ifArray(list, page, itemsPerPage) {
  var listLen = list.length;
  if (listLen <= itemsPerPage) return list;

  var from = itemsPerPage * (page - 1);
  var to = itemsPerPage * page < listLen ? itemsPerPage * page : listLen;
  if (listLen < from) return [];

  return list.slice(from, to);
}

function ifObject(object, page, itemsPerPage) {
  let keysList = Object.keys(object);
  let objectLen = keysList.length;
  if (objectLen <= itemsPerPage) return object;

  let from = itemsPerPage * (page - 1);
  let to = itemsPerPage * page < objectLen ? itemsPerPage * page : objectLen;
  if (objectLen < from) return {};

  var returnObject = {};
  let slicedKeysList = keysList.slice(from, to);
  slicedKeysList.forEach(key => {
    returnObject[key] = object[key];
  });
  return returnObject;
}
