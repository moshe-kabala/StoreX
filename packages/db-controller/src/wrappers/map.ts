export async function map(data, map) {
    if (!(typeof map === "function")) {
        return data;
    }
    if (data instanceof Array) {
        let res = data.map(map);
        if (res[0] && res[0] instanceof Promise) {

            res = await Promise.all(res)
        }
        return res;
    } else {
        return map(data)
    }
}