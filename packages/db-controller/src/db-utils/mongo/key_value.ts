import { sleep } from "@storex/utils/lib/async";
import {Collection, UnorderedBulkOperation, FindOneOptions} from "mongodb"
import { KeyValueCache } from "../key_value_cache";

type ValueOf<T> = T[keyof T];
type KeyValueOptions<T extends object> = { [key in keyof T]: KeyOption<T> };
type GroupKeyValueOptions<T extends object> = { [key in keyof T]: GroupOption<T> };

const GROUP_META_PREFIX = "__meta__of__group__:";

interface KeyOption<T> {
    cache?: boolean;
    mapTo?: (data: ValueOf<T>) => any;
    mapFrom?: (data) => ValueOf<T>;
    validator?: () => [boolean, (object | null)];
    default?: () => any;
}


// The aspect of the data handler is that each group is a Map<string, unknown>, 
// but the final group type is defined by 'mapGroupFrom' return value, 
// therefor the function 'mapGroupFrom' is mandatory because the we don't know how to map the group to Map<string, unknown>
// 
// 
interface GroupOption<T> {
    cache?: boolean;
    
    // maps function for the entire group
    mapTo: (data: ValueOf<T>) => Map<string, unknown>;
    mapFrom?: (data: Map<string, any>) => ValueOf<T>;
    
    // maps function for item in the group
    mapItemTo?: (data: ValueOf<T>) => any;
    mapItemFrom?: (data) => ValueOf<T>;

    validate?: () => [boolean, (object | null)];
    validateItem?: () => [boolean, (object | null)];

    default?: () => Map<string, unknown>;
    defaultItem?: () => any;
}

interface KeyValueData {
    transaction();
    commit(trans_id: string);
    uncommit(trans_id: string);
    get(key: string);
    set(trans_id, key: string, value: any);
    getGroup(group: string);
    setGroup(trans_id, group: string, value: any);
    getGroupItem(group: string, key: string);
    setGroupItem(trans_id, group: string, key: string, value: any);
}

const transaction_max_time = 10;
const transaction_distance_time = 12;




/**
 *
 *
 * @export
 * @class KeyValueMongo
 * @implements {KeyValueData}
 * @template T - object that represent types of the keys
 * @template G - object that represent types of the groups
 */
export class KeyValueMongo<T extends Object = { [key: string]: any }, G extends Object = { [key: string]: any }>
    implements KeyValueData {
    _getCollection: () => Promise<Collection>;
    _trans = new Map<String ,UnorderedBulkOperation>();
    
    _cache = new KeyValueCache<ValueOf<T>>();
    _group_cache = new KeyValueCache<any>();

    _options: {
        keys: KeyValueOptions<T>,
        groups: GroupKeyValueOptions<G>
    };
    _waiting = new Map();
    _group_waiting = new Map();

    //todo save cache only where cache == true in options

    constructor({
        getCollection,
        options = {keys: ({} as any), groups:({} as any)}
    }: {
        getCollection: () => Promise<Collection>;
        options?: {
            keys: KeyValueOptions<any>,
            groups: GroupKeyValueOptions<any>
        }
    }) {
        this._getCollection = getCollection;
        this._options = options;
        this.init();
    }

    async init() {
        try {
            const collection = await this._getCollection();
            const result = await collection.updateOne(
                { _id: "meta" },
                {
                    $setOnInsert: { _id: "meta", current_trans_id: null }
                },
                { upsert: true }
            );
        } catch (err) {
            console.error("Failed to init a key value collection", err);
        }

        // for testing

        // options: {
        //     gg: { default: () => "gg" },
        //     mapp: {
        //       mapTo(val) {
        //         return val + "++";
        //       },
        //       mapFrom(val) {
        //         return val + "--";
        //       }
        //     }
        //   }

        // const trans_id = await this.transaction();
        // this.set(trans_id, "name", "1.0.3");
        // const name = await this.get("name");
        // const gg = await this.get("gg"); // get default value;
        // await this.set(trans_id, "mapp", "mapp"); // map to
        // this.commit(trans_id);
        // // get from cache
        // const mapp = await this.get("mapp"); // map from
        // this.uncommit(trans_id);
    }



  

    // helper function
    __map_or_return<T>(value: T, mapFunc:Function): T | any {
        if (typeof mapFunc === "function") {
            return mapFunc(value);
        }
        return value;  
    }

    _map_from(key, value) {
        return this.__map_or_return(value ,this._options.keys[key]?.mapFrom);
    }

    _map_to(key, value) {
        return this.__map_or_return(value ,this._options.keys[key]?.mapTo);
    }

    _get_default(key) {
        const mapFunc = this._options.keys[key]?.default;
        let version = "__default__";
        let value = null;
        if (typeof mapFunc === "function") {
            value = mapFunc();
        }
        return { value, version };
    }

    

    async transaction() {
        try {
            const collection = await this._getCollection();
            let trans_id;
            while (true) {
                trans_id = Date.now();
                const result = await collection.updateOne(
                    {
                        _id: "meta",
                        $or: [
                            { current_trans_id: null },
                            {
                                current_trans_id: {
                                    $lt: trans_id - transaction_distance_time * 1000
                                }
                            }
                        ]
                    },
                    { $set: { current_trans_id: trans_id } }
                );
                // if matched count bigger than zero
                if (result.matchedCount > 0) {
                    break;
                }
                await sleep(500);
            }
            this._trans.set(trans_id, collection.initializeUnorderedBulkOp());
            return trans_id;
        } catch (err) {
            const msg = `Failed to create a transaction`;
            console.error(msg, err);
            return Promise.reject({ msg, err });
        }
    }
    async commit(id) {
        const now = Date.now();

        const collection = this._trans.get(id);
        this._trans.delete(id);

        if (!collection) {
            const msg = `Unknown transaction id ${id}`;
            return Promise.reject({ msg });
        }

        if (now - id > transaction_max_time * 1000) {
            return Promise.reject({
                msg: `The transaction take more them ${transaction_max_time} second `
            });
        }

        try {
            collection
                .find({ _id: "meta", current_trans_id: id })
                .updateOne({ $set: { current_trans_id: null } });
            await collection.execute();
            return "committed";
        } catch (err) {
            const msg = `Failed to commit transaction id ${id}`;
            console.error(msg, err);
            return Promise.reject({ msg, err });
        }
    }

    async uncommit(id) {
        try {
            const isDeleted = this._trans.delete(id);
            if (!isDeleted) {
                return;
            }
            const collection = await this._getCollection();
            const result = await collection.update(
                { _id: "meta", current_trans_id: id },
                { $set: { current_trans_id: null } }
            );
        } catch (err) {
            const msg = `Failed to uncommiet transaction id ${id}`;
            console.error(msg, err);
            return Promise.reject({ msg, err });
        }
    }

    async get(key: string): Promise<ValueOf<T>> {
        try {
            if (this._cache.is_already_getting(key)) {
                return this._cache.await_for(key) 
            }
            this._cache.get_start(key);

            const collection = await this._getCollection();

            // if there is available cache
            {
                const { value, version: cache_version } = this._cache.get(key);
                // if there is version
                if (cache_version !== null && cache_version !== "__default__") {
                    const { version } = await collection.findOne({ key }, { version: 1 } as any) as any;
                    if (version && version == cache_version) {
                        this._cache.get_end(key, version, value);
                        return value;
                    }
                }
            }

            const { value, version } =
                (await collection.findOne({ key }, { value: 1 } as any)) as any ||
                this._get_default(key);
            //

            const mapped_value = this._map_from(key, value);

            this._cache.set(key, mapped_value, version);
            this._cache.get_end(key, version, mapped_value);
            return mapped_value;
        } catch (err) {
            this._cache.get_failed(key, err);
            return Promise.reject(err);
        }
    }

    set(id, key: string, value: ValueOf<T>) {
        const colec = this._trans.get(id);
        if (!colec) {
            const msg = `Unknown transaction id ${id}`;
            return Promise.reject({ msg });
        }

        // map to
        value = this._map_to(key, value);

        colec
            .find({ key })
            .upsert()
            .replaceOne({ key, value, version: id });
    }

    _map_item_group_from(group, key, value) {
        // 
        return this.__map_or_return(value ,this._options.groups[key]?.mapItemFrom);
    }

    _map_item_group_to(group, key, value) {
        // mapItemTo
        return this.__map_or_return(value ,this._options.groups[key]?.mapItemTo);
    }

    _map_group_from(group: string, value) {
        const result = this._options.groups[group]?.mapFromKeyValueMap(value);
        return result ? result : value;
    }

    _map_group_to(group: string, value): any[] {
        const result = this._options.groups[group]?.mapToKeyValueMap(value);
        if (!result) {
            throw new Error(`Unknown group ${group}`);
        }
        return result;
    }

     /**
     * Set item from a specific group by key
     *
     * @param {string} group - group id
     * @param {string} key - item id
     * @returns
     * @memberof KeyValueMongo
     */
    async getGroupItem(group: string, key: string) {
        // todo
    }


    /**
     * Set item from a specific group by key
     *
     * @param {*} id - transaction id
     * @param {string} group - group id
     * @param {string} key - item id
     * @returns
     * @memberof KeyValueMongo
     */
    setGroupItem(id, group: string, key: string, value: any) {
        const colec = this._trans.get(id);
        if (!colec) {
            const msg = `Unknown transaction id ${id}`;
            return Promise.reject({ msg });
        }
    }

    // todo implement cache
    async getGroup( group: string ): Promise<Map<string, ValueOf<G>>> {
        try {
            if (this._group_cache.is_already_getting(group)) {
                return this._group_cache.await_for(group);
            }

            const collection = await this._getCollection();

            const {version} = (await collection.findOne({"_id": GROUP_META_PREFIX + group}, {"version": 1} as FindOneOptions)) as any;

            const {value: cache_value , version: cache_version} = this._group_cache.get(group);

            if (version == cache_version) {
                return cache_value as any;
            } 

            this._group_cache.get_start(group);

            let result = (await (await collection.find({"_id.group": group})).toArray());

            // convert the array to a Map and if configured a custom map use it.  
            const value = this._map_group_from(group, new Map(result.map(({_id: {group, key},value})=> {
                return [key, value]
            })));

            this._group_cache.set(group, value, version);

        } catch(err) {
            this._group_cache.get_failed(group, err);
            return Promise.reject({msg: `Failed to get group: ${group}`, err});
        }
    }

    setGroup(id, group: string, value: ValueOf<G>) {
        const colec = this._trans.get(id);
        if (!colec) {
            const msg = `Unknown transaction id ${id}`;
            return Promise.reject({ msg });
        }
        
        // map to
        const values = this._map_group_to(group, value);

        // upsert 
        let foundGroup = colec.find({"_id.group" : group}).upsert();
        for (const [key, value] of values ) {
            foundGroup.update({
                $setOnInsert: {value, version:id, _id: {group, key}},
                $set: {value, version:id,}
            })
        }

        // remove old;
        colec.find({"_id.group" : group, version: {$not: id}}).remove();

    }
}