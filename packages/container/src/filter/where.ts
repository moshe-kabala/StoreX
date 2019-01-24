export interface Where {
  key: string;
  value: string | Array<string> | any;
  type?: string;
  operator?: string;
}


const filterTypes = ["string", "number", "bool", "boolean", "enum", "array"];
  
export const createWhereSchema = fields => ({
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

export function where(items, where, schema?) {
  if (!(where instanceof Array)) return items;

  if (items == undefined) return []; //todo:

  var _where = properWhere(where, schema);
  var mewItems = items.filter(function(item) {
    return filterItemByWheres(item, _where);
  });

  return mewItems;
}

////////////////

function filterItemByWheres(item, wheres) {
  for (var i = 0; i < wheres.length; i++) {
    var where = wheres[i];
    var values = where.value;
    var key = where.key;
    let path = where.path;
    var equalToType = where.type || "string";
    if (!key) continue;
    if (path) {
    }
    const obj = path ? getNestedObject(item, path) : item;
    if (!obj) {
      return false; // let to config what to do if there is no path. 
    }
    // if (key && key.indexOf(".") != -1) {
    //   var filterPats = key.split(".");
    //   for (var i = 0; i < filterPats.length - 1; i++) {
    //     var key = filterPats[i];
    //     if (!obj.hasOwnProperty(key)) return;
    //     obj = obj[key];
    //   }
    //   key = filterPats[filterPats.length - 1];
    // }
    let operatorFunc;

    switch (where.operator) {
      case "=":
        operatorFunc = ifEqual;
        break;

      case "!":
        operatorFunc = ifNotEqual;
        break;

      case "~":
        operatorFunc = ifLike;
        break;

      case "!~":
        operatorFunc = ifNotLike;
        break;

      case ">":
        operatorFunc = ifBigger;
        break;

      case "<":
        operatorFunc = ifSmaller;
        break;

      default:
        operatorFunc = ifEqual;
        break;
    }

    let flag = operatorFunc(key, values, obj, equalToType);

    if (!flag) return false;
  }
  return true;
}

// proper the wheres to query
function properWhere(wheres, schema?) {
  var _wheres = [];
  wheres.forEach(item => {
    let { value: val, key, type, operator, path } = item;

    if (path && typeof path === "string") {
      path = path.split(".");
    }

    switch (type) {
      case "bool":
      case "boolean":
        if (typeof item.value == "string") val = item.value == "true";

        break;
      case "number":
        if (typeof item.value == "string") val == parseInt(val);
        break;
      case "array":
      case "enum":
        let obj;
        if (val instanceof Array) {
          obj = new Set();
          for (var j = 0; j < val.length; j++) {
            let key = val[j];
            obj.add(key);
          }
        }
        val = obj.size > 0 ? obj : undefined;
        break;
      case "string":
        // if (schema && Object.keys(schema.properties[key].dict).length > 0) {
        //   let temp = schema.properties[key].dict[val];
        //   if (temp) val = temp;
        // }
        if (operator === "~" || operator === "!~") {
          val = new RegExp(escapeRegExp(val), "i");
        } else {
          val = val.toLowerCase();
        }
      //return (obj[key] == val);
    }
    _wheres.push({ key, value: val, type, operator, path });
  });
  return _wheres;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}:()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function ifNotLike(key, val, obj, equalType) {
  return !ifLike(key, val, obj, equalType);
}

function ifLike(key, val, obj, equalType) {
  if (!obj.hasOwnProperty(key)) return false;

  switch (equalType) {
    case "bool":
    case "boolean":
    case "number":
    case "date":
      return val == undefined || val == obj[key];
    case "string":
      return val.test(obj[key]);
    case "array":
    case "enum":
      return val == undefined || val.has(obj[key]); // when empty
  }
}

function ifEqual(key, val, obj, equalType) {
  if (!obj.hasOwnProperty(key)) return false;

  switch (equalType) {
    case "bool":
    case "boolean":
    case "number":
    case "date":
      return val == undefined || val == obj[key];
    case "string":
      if (val == undefined || val == "" || val == "None") return true;
      return (
        (typeof obj[key] == "string" &&
          obj[key].toLowerCase().indexOf(val) != -1) ||
        (typeof obj[key] == "number" && obj[key] == val)
      );
    case "array":
    case "enum":
      return val == undefined || val.has(obj[key]); // when empty
  }
}

function ifNotEqual(key, val, obj, equalType) {
  return !ifEqual(key, val, obj, equalType);
}

function ifBigger(key, val, obj, equalType) {
  if (!obj.hasOwnProperty(key)) return false;

  switch (equalType) {
    case "number":
    case "date":
      return val == undefined || obj[key] > val;
    case "string":
      if (val == undefined || val == "" || val == "None") return true;
      return (
        (typeof obj[key] == "string" && obj[key].toLowerCase() > val) ||
        (typeof obj[key] == "number" && obj[key] > val)
      );
  }
}

function ifSmaller(key, val, obj, equalType) {
  if (!obj.hasOwnProperty(key)) return false;

  switch (equalType) {
    case "number":
    case "date":
      return val == undefined || obj[key] < val;
    case "string":
      if (val == undefined || val == "" || val == "None") return true;
      return (
        (typeof obj[key] == "string" && obj[key].toLowerCase() < val) ||
        (typeof obj[key] == "number" && obj[key] < val)
      );
  }
}

const getNestedObject = (nestedObj, pathArr) => {
  return pathArr.reduce(
    (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined),
    nestedObj
  );
};
