import { getPropType } from "./get-prop-type";

export interface FlatKey {
    key: string
    title: string,
    type: string,
    path: string
    schema: object
}

export function flatKeys(schema): FlatKey[] {
    return getRow(schema);
}

export function flatObj(obj, prefix = "") {
    let result = {};
    for (const key in obj) {
        let val = obj[key];
        if (Array.isArray(val)) {
            continue;
        }
        let fullKey = (prefix ? `${prefix}.${key}` : key)
        if (isObj(val)) {
            result = { ...result, ...flatObj(val, fullKey) }
        } else {
            result[fullKey] = val;
        }
    }
    return result;
}


function isObj(obj) {
    return (typeof obj === "object") && (obj !== null)
}

export function flatSchema({ schema, includeObject }): FlatKey[] {
    return getRow(schema, "", "", includeObject);
}

function getRow(schema, key = "", path = "", includeObject = false) {
    const type = getPropType(schema);
    const { title = key } = schema;

    if (type === "object") {
        // todo not using in the schema type first search for filter type
        let props = [];

        //to do array of object
        if (key && includeObject) {
            props.push({ schema, type, key, title, path });
        }
        for (const _key in schema.properties) {
            if (!schema.properties[_key]) {
                continue;
            }
            props = props.concat(
                getRow(
                    schema.properties[_key],
                    _key,
                    path ? `${path}/${path}` : key,
                    includeObject
                )
            );
        }
        return props;
    } else {
        return [{ schema, type, key, title, path }];
    }
}