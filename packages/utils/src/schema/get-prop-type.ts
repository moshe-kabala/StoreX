export function getPropType(prop) {
  if (!prop || !prop.type) {
    throw new TypeError(`[getPropType]:: invalid prop`)
  }
  const {type} = prop
  if (type instanceof Array && type.length < 3) {
    return type.filter(t => t !== "null")[0];
  }
  return prop.type; // todo
}
