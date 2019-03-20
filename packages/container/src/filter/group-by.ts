import { sort } from "./sort";
import { getNestedKey } from "@storex/utils/lib/schema";

export const createGroupBySchema = (fields) => ({
    type: "object",
    properties: {
        key: {
            type: "string",
            enum: fields
        },
        path: {
            type: "string",
        },
        range: {
            type: "number"
        },
        reverse: { type: "boolean" },
        limit: {
            type: "number"
        }
    }
})



export function groupBy({ data, group, onAdd, onNew, getCount, context = {} }: { data, group, onAdd, onNew, getCount, context: any }) {
    const { key, from, to,  limit, path, SortBy } = group
    context.key = key;
    context.path = path
    let m = new Map();
    for (const i of data) {
        const item_key = getKey(i);
        if (item_key == undefined) {
            continue;
        }
        if (m.has(item_key)) {
            const item = m.get(item_key)
            onAdd(item_key, i, item)
        } else {
            m.set(item_key, onNew(item_key, i))
        }
    }

    let d = [];
    for (const [k, v] of m) {
        d.push({ key: k, count: getCount(v) });
    }

    if (limit) {
        d = sort(d, [{ key: SortBy.key, reverse: SortBy.reverse }])
        d = d.slice(0, limit)
        const m1 = new Map();
        for (const { key } of d) {
            m1.set(key, m.get(key));
        }
        m = m1;
    }

    context.count = m.size;

    return [...m.values()];

    function getKey(item) {
        const k = path ? getNestedKey(item, {path, key}) : item[key]
        if (from || to) {
            if (k < from || k > to) {
                return undefined;
            }
            else {
                return k;
            }
        }
        else {
            return k;
        }
    }
}