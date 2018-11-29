import { getPropType } from "./get-prop-type";

export function overrideObjectSchema(old, n) {
  const schema = clone(old);
  return _override(schema, n);
}

function _override(old, n) {
  const schema = old;
  for (const key in n.properties) {
    const val = n.properties[key];
    if (typeof val === "function") {
      const newVal = val(schema.properties[key] || {});
      if (newVal) {
        schema.properties[key] = newVal;
      }
      continue;
    }
    if (val === null) {
      delete schema.properties[key];
      continue;
    }
    if (schema.properties[key]) {
      const oldType = getPropType(schema.properties[key]);
      const overType = getPropType(val);
      if (oldType === "object" && overType === "object") {
        _override(schema.properties[key], val);
        continue;
      }
    }
    schema.properties[key] = val; // override
  }
  return schema;
}



function clone(obj) {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (null === obj || "object" !== typeof obj) {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }

  if (typeof obj === "function") {
    return obj;
  }

  throw new Error(`Unable to copy obj! Its type isn't supported.`);
}