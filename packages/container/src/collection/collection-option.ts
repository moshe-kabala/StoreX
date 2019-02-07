import { getNestedKey } from "@storex/utils/lib/schema";
import { normalize } from "path";

interface Key {
    key: string, path: string, type: string,
}

interface Field extends Key {
    type: string,
}

export interface GetOptionArgs {
    key: string, path: string, query: string, limit: number
}

interface Value {
    value: string, count: number
}
export class CollectionOptions {
    others = new Map()
    itemToId;
    options: Map<string, Map<any, { value: any, name: any, count: number }>> = new Map();

    constructor({ fields, itemToId }: { fields: Field[], itemToId? }) {
        this.itemToId = itemToId;
        for (const d of fields) {
            const { key, path } = d;
            this.options.set(JSON.stringify({ key, path }), new Map());
            this.others.set(JSON.stringify({ key, path }), d);
        }
    }

    reset() {
        for (const [k, v] of this.options) {
            this.options.set(k, new Map());
        }
    }

    getOption(key) {
        if (this.options[key]) {
            return [...this.options[key].values()];
        }
    }


    getOptions({ key, path = "", query = "", limit = 50 }) {
        const options = this.options.get(JSON.stringify({ key, path }))
        if (!options) {
            return [];
        }

        let q;

        try {
            q = new RegExp(escapeRegExp(query), "i");
        } catch (e) {
            return Promise.reject(e);
        }
        const r = [];
        let i = 0;
        for (const [_, o] of options) {

            q.test(o.name) && r.push(o);
            if (i >= limit) {
                break;
            }
        }
        return r;
    }

    toJson() {
        const options = {};

        for (const option in this.options) {
            options[option] = [...this.options[option]];
        }
        return options;
    }

    map(objs) {
        this.reset();
        for (const obj of objs) {
            this.addObj(obj);
        }

    }

    removeObj(obj) { }

    addObj(item) {
        for (const [k, map] of this.options) {
            const { key, path } = this.others.get(k)
            this.addValue({ item, key, path, map })
        }
    }
    addValue = ({ item, key, path, map }) => {
        const val = getNestedKey(item, { key, path });
        if (val === undefined || val === null || val === "") {
            return;
        }

        if (!map.has(val)) {
            let id
            if (this.itemToId) {
                id = this.itemToId(item)
            }
            map.set(val, { value: val, name: val, count: 1, id });
        } else {
            map.get(val).count++
        }
    }
}


/////////// helpers ////////////



function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

