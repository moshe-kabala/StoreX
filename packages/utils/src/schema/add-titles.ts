import { getPropType } from "./get-prop-type";

interface args {
  keyDict?;
  keyFunc?;
}
export function addTitles(jsonSchema, { keyDict, keyFunc }: args = {}) {
  let type;

  if (jsonSchema && jsonSchema.type) {
    type = getPropType(jsonSchema);
  }

  if (!jsonSchema || type !== "object") {
    throw TypeError("[AddTitle]:: Invalid Json Schema");
  }
  if (typeof jsonSchema.properties !== "object") {
    return;
  }

  for (const key in jsonSchema.properties) {
    const prop = jsonSchema.properties[key];
    const type = getPropType(prop);
    if (!prop.title) {
      prop.title = transform(key);
    }
    if (type === "object") {
      addTitles(prop, { keyDict: (keyDict || {})[key], keyFunc });
    }
  }

  function transform(key) {
    if (keyDict && keyDict[key]) {
      return keyDict[key];
    }
    if (typeof keyFunc === "function") {
      return keyFunc(key);
    }
    return key;
  }
}
