import { CustomDate } from "../format";
import { StringifyData, StringifyDataOptions } from ".";
import {
  DataTranslator,
  DataTranslatorOptions,
  NormalizeKey
} from "./data.trans";

const rowDelim = "\r\n";
const colDelim = '","';

/**
* Converts an array of objects into a CSV table.
* @param {Array} objArray An array of objects.
* @param {Array} config An array of the fields the table should have
  @param {Any} translator An array of the fields the table should have
*/

export function csvTransform(objArray, schema) {
  let headings = [];
  for (const key in schema.properties) {
    const key_schema = schema.properties[key];
    const { title, path } = schema.properties[key] || key;
    headings.push({ title, key, path, schema: key_schema });
  }

  let output = createRow(headings.map(i => i.title));

  for (var i = 0; i < objArray.length; i++) {
    let element = objArray.data ? objArray.data[i] : objArray[i];
    let obj = element;
    let row = [];
    let val;
    for (const { key, path, schema } of headings) {
      if (path) {
        let res = pathResolution(obj, path, key);
        val = res.val;
      } else {
        val = obj[key];
      }
      if (val !== undefined && val !== null){
        val = cell(schema, val)
      } else {
        val = ""
      }
      row.push(val);
    }

    output += rowDelim + createRow(row);
  }
  return output;
}
// todo: this function exist also in file template-creator.js
function getParamByPath(path, obj) {
  var arrayPath = path.split(".");
  var type = obj.type;
  var key = arrayPath[0];
  var obj = obj;

  for (var i = 1; i < arrayPath.length; i++) {
    if (!obj.hasOwnProperty(key)) return -1; // ("the path: "+path+"  is not correct on the obj.type:" +type);
    obj = obj[key];
    key = arrayPath[i];
  }
  return {
    obj: obj,
    key: key
  };
}

// todo: this is separate filter
function convertToType(val, columnMetaData) {
  switch (columnMetaData.type) {
    case "date":
      return new CustomDate().update(val).asCsv();
    case "enum":
      if (columnMetaData.options instanceof Array)
        // if exist options take the name of the enum
        columnMetaData.options.some(function(item) {
          if (item.value == val) {
            val == item.name;
            return true;
          }
        });
      return val;
    default:
      return val;
  }
}

function pathResolution(obj, path, key) {
  if (!obj) {
    return {};
  }
  if (!path && !key) {
    return {};
  }
  let currentObj = obj,
    preObj = obj;
  const keys = path ? path.split(".") : [];
  for (const key of keys) {
    if (!key) {
      preObj = currentObj;
    }
    currentObj = currentObj[key];
    if (currentObj === undefined) {
      return {};
    }
  }
  return key
    ? { val: currentObj[key], obj: currentObj }
    : { val: currentObj, obj: preObj };
}

function createRow(row) {
  return '"' + row.join(colDelim) + '"';
}

function cell(schema, cell) {
  const type = typeof cell;
  switch (type) {
    case "string":
    case "number":
    case "boolean":
      return cell;
    case "object": {
      const t =  new DataTranslator(
        new DataTranslatorOptions({
           keysTransform: NormalizeKey
        })
      );
      const s = new StringifyData(
        new StringifyDataOptions({ separateBetweenKeys: "\r\n" })
      );
      return s.obj(t.obj(cell));
    }
  }
}

// -  const t = new DataTranslator(
//   -    new DataTranslatorOptions({
//   -      keysMap: {
//   -        schema
//   -      },
//   -      valsMap: maps,
//   -      keysTransform: NormalizeKey
//   -    })
//   -  );