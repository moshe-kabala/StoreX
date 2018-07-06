import { Store } from "../store"


export interface ViewArgs {
    transfrom: (data: any[]) => any[];
    source
}

export interface ViewMeta {

}

export interface ViewStatus {

}


/**
 * 
 * 
 * @export
 * @class View
 */
export class View extends Store {
    loading = false;
    _is_need_to_update = true;
    _transfrom;
    _sources;
    _data;

    constructor({ sources, transfrom }) {
        super(); // todo
        regester(this.update, sources);
        this._transfrom = transfrom;
        this._sources = sources;
    }

    set data(value) {
        this._data = value;
    }

    get data() {
        return this._data;
    }

    async update() {
        this.loading = true;
        try {
            this.data = await transfrom(this._sources);
        } catch (err) {
            console.error(err)
        }

        this.loading = false;
    }
}


function transfrom(value) {
    return value;
}

function regester(func, stores: Store[]) {
    for (const store of stores) {
        store.listen(func)
    }

}