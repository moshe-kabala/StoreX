export interface Sort {
  key: string;
  reverse: boolean;
}

export const createSortSchema = fields => ({
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


export function sort(
  result: any[],
  sortBy: { key: string; reverse: boolean }[]
) {
  if (!sortBy || !sortBy.length) {
    return result;
  }
  return result.sort(dynamicSortMultiple(sortBy));
}

function dynamicSortMultiple(sortBy) {
  return function (rule1, rule2) {
    let i = 0;
    let result = 0;

    while (result === 0 && i < sortBy.length) {
      result = dynamicSort(sortBy[i]["key"], sortBy[i]["reverse"])(
        rule1,
        rule2
      );
      i++;
    }
    return result;
  };
}

function dynamicSort(property, reverse) {
  return function (rule1, rule2) {
    if (rule1[property] > rule2[property]) {
      if (reverse) return -1;
      else {
        return 1;
      }
    } else if (rule1[property] < rule2[property]) {
      if (reverse) return 1;
      else {
        return -1;
      }
    } else {
      return 0;
    }
  };
}
