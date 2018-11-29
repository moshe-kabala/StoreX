import { getPropType } from "./get-prop-type";

export function createDefault(jsonSchema) {
  let result = {};

  for (const key in jsonSchema.properties) {
    const val = jsonSchema.properties[key];
    const type = getPropType(val);
    if (type === "object") {
      const isRequired =
        jsonSchema.required && jsonSchema.required.indexOf(key) > -1;
      if (val.default === true || isRequired) {
        result[key] = createDefault(val);
      } else if (val.default) {
        result[key] = JSON.parse(JSON.stringify(val.default));
      }
      continue;
    } else if (type === "array") {
      // what if array >> opject
      if (val.default instanceof Array) {
        result[key] = [...val.default];
      }
    } else {
      result[key] = val.default;
    }
  }
  return result;
}
