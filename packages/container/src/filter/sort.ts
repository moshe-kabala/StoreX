export interface Sort {
  path?: string;
  key: string;
  reverse: boolean;
}

export const createSortSchema = fields => ({
  id: "#sort",
  type: "object",
  properties: {
    path: {
      type: "string"
    },
    key: {
      type: "string",
      enum: fields
    },
    revers: {
      type: "boolean"
    }
  }
});


export function sort(
  result: any[],
  sortBy: Sort[]
) {
  if (!sortBy || !sortBy.length) {
    return result;
  }
  return result.sort(dynamicSortMultiple(sortBy.map(s => {
    let {reverse, key , path: _path}= { ...s }
    let path;
    if (_path) {
      path = _path.split(".");
    }
    return dynamicSort(key, reverse, path)
  })));
}

function dynamicSortMultiple(sortBy) {
  return function (rule1, rule2) {
    let i = 0;
    let result = 0;

    while (result === 0 && i < sortBy.length) {
      result = sortBy[i](
        rule1,
        rule2
      );
      i++;
    }
    return result;
  };
}

function dynamicSort(key, reverse, path?) {
  return function (item1, item2) {
    item1 = path ? getNestedObject(item1, path) : item1;
    item2 = path ? getNestedObject(item2, path) : item2;
    // 
    if (!item1 || !item2) {
      return onEmpty(item1, item2, reverse)
    }

    const val1 = item1[key];
    const val2 = item2[key]
    if (isEmpty(val1) || isEmpty(val2)) {
      return onEmpty(item1, item2, reverse)
    }

    if (val1 > val2) {
      return (reverse) ? -1 : 1;
    } else if (val1 < val2) {
      return (reverse) ? 1 : -1;
    } else {
      return 0;
    }
  };
}

function onEmpty(val1, val2, reverse) {
  return !isEmpty(val1) ?
    ((reverse) ? -1 : 1)
    :
    !isEmpty(val2) ?
      ((reverse) ? 1 : -1)
      :
      0
}

function isEmpty(val) {
  return val == undefined || val == null
}


const getNestedObject = (nestedObj, pathArr) => {
  return pathArr.reduce(
    (obj, key) => (obj && !isEmpty(obj[key]) ? obj[key] : undefined),
    nestedObj
  );
};