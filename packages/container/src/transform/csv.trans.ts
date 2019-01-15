import { CustomDate } from "../format";
import { StringifyData, StringifyDataOptions } from ".";
import { DataTranslator, DataTranslatorOptions, NormalizeKey } from "./data.trans";

const rowDelim = "\n";
const colDelim = '","';

/**
* Converts an array of objects into a CSV table.
* @param {Array} objArray An array of objects.
* @param {Array} config An array of the fields the table should have
*/


export function csvTransform(objArray, schema) {
  let headings = [];
  for (const val of schema) {
    if (val.hide !== true){
      headings.push(val.title || val.key);
    } 
  }
  
  let output = createRow(headings);
  
  for (var i = 0; i < objArray.length; i++) {
    let element = objArray.data ? objArray.data[i] : objArray[i];
    let obj = element;
    let row = [];
    let val;
    const t = new DataTranslator(
      new DataTranslatorOptions({
        keysMap: {
          schema
        },
        valsMap: {
          transport: t => (t ? t.toUpperCase() : ""),
        },
        keysTransform: NormalizeKey
      })
    );
    
    schema.forEach((column, i) => {
      let key = column.key;
      let res = pathResolution(obj, column.path, key);
      let val = res.val !== undefined ? res.val : "";
      if(val instanceof Object){
        const s = new StringifyData(new StringifyDataOptions( {separateBetweenKeys: "\n"}));
        val = s.obj(t.obj(val)) 
      }
      // else if (typeof column.display === "function") {
      //   val = column.display({ key, val, obj});}
       else {
        val = val;
      }
      if(column.hide !== true){
      row.push(val);
      }
    });
    
    output += rowDelim + createRow(row);
    
    //   for (let schemaKeys of schema) {
    //     for (let dataKey in  obj){
    //       if(dataKey === schemaKeys.key && schemaKeys.hide !== true){
    //         if(obj[dataKey] instanceof Object){
    //           const s = new StringifyData(new StringifyDataOptions( {separateBetweenKeys: "\n"}));
    //           val = s.obj(t.obj(obj[dataKey])) 
    //         } else {
    //           val = obj[dataKey];
    //         }
    //       row.push(val || "");
    //       }
    //     }
    //   }
    //   output += rowDelim + createRow(row);
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
    columnMetaData.options.some(function (item) {
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
  let currentObj = obj, preObj = obj;
  const keys = path ? path.split('.') : [];
  for (const key of keys) {
    if (!key) {
      preObj = currentObj;
    }
    currentObj = currentObj[key];
    if (currentObj === undefined) {
      return {};
    }
  }
  ;
  return key ? { val: currentObj[key], obj: currentObj } : { val: currentObj, obj: preObj };
}

function createRow(row) {
  return '"' + row.join(colDelim) + '"';
}
