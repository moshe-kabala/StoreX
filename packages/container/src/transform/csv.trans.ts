import { CustomDate } from "../format";

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
    for (let schemaKeys of schema) {
      for (let dataKey in  obj){
        if(dataKey === schemaKeys.key && schemaKeys.hide !== true){
          if(obj[dataKey] instanceof Object){
            val = JSON.stringify(obj[dataKey],null, " ")
          } else {
            val = obj[dataKey];
          }
        row.push(val || "");
        }
      }
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

function createRow(row) {
  return '"' + row.join(colDelim) + '"';
}
