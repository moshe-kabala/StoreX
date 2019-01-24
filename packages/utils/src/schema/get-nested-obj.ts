export function getNestedObj(nestedObj, pathArr) {
    return pathArr.reduce(
        (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined),
        nestedObj
    );
};


export function getNestedKey(nestedObj, { path, key }: { path: string, key: string }) {

    const obj = path ? getNestedObj(nestedObj, path.split(".")) : nestedObj;
    if (obj) {
        return obj[key];
    }
};