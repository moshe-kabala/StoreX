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

function getRow(schema, key = "", path = "") {
    const type = getPropType(schema);
    const { title = key } = schema;

    if (type === "object") {
        // todo not using in the schema type first search for filter type
        let props = [];

        // to do array of object
        // if (key) {
        //     props.push({ schema, type, key, title, path });
        // }
        for (const _key in schema.properties) {
            if (!schema.properties[_key]) {
                continue;
            }
            props = props.concat(
                getRow(
                    schema.properties[_key],
                    _key,
                    path ? `${path}/${path}` : key
                )
            );
        }
        return props;
    } else {
        return [{ schema, type, key, title, path }];
    }
}