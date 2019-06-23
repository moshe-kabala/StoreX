export class EventEmitter {
    funcs: Map<string, Set<Function>> = new Map();

    _on(key: string, func: Function) {
        if (!this.funcs.has(key))
            this.funcs.set(key, new Set());

        this.funcs.get(key).add(func);
    }

    on = (key: string | string[], func: Function) => {
        if (typeof func !== "function")
            throw Error(`[EventEmitter::on] You must send a function. but received a ${func}`);

        singleOrMulti(key, this._on, func);
    };

    _emit = (key, args?: any) => {
        const funcs = this.funcs.get(key);
        if (!funcs) return;

        for (const func of funcs)
            if (typeof func == "function") func(args);
    };

    emit = (key: string | string[], args?: any) => {
        singleOrMulti(key, this._emit, args);
    };

    _removeListener = (key, func) => {
        if (this.funcs.has(key))
            this.funcs.get(key).delete(func);
    }

    removeListener = (key: string | string[], func) => {
        singleOrMulti(key, this._removeListener, func);
    };
}

function singleOrMulti(arg, func, ...args) {
    if (arg instanceof Array) {
        for (const a of arg) func(a, ...args);
    } else {
        func(arg, ...args);
    }
}
