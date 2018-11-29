export interface Where {
  key: string;
  value: string | Array<string> | any;
  type?: string;
  operator?: string;
}

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
    var equalToType = where.type || "string";
    if (!key) continue;

    var obj = item;
    if (key && key.indexOf(".") != -1) {
      var filterPats = key.split(".");
      for (var i = 0; i < filterPats.length - 1; i++) {
        var key = filterPats[i];
        if (!obj.hasOwnProperty(key)) return;
        obj = obj[key];
      }
      key = filterPats[filterPats.length - 1];
    }
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
    var val = item.value;
    var key = item.key;
    var type = item.type || "string";
    var operator = item.operator;

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
        if (schema && Object.keys(schema.properties[key].dict).length > 0) {
          let temp = schema.properties[key].dict[val];
          if (temp) val = temp;
        }
        if (operator === "~" || operator === "!~") {
          val = new RegExp(escapeRegExp(val), "i");
        } else {
          val = val.toLowerCase();
        }
      //return (obj[key] == val);
    }
    _wheres.push({ key: key, value: val, type: type, operator: item.operator });
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
