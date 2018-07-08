
export class ObjDataView {
    type = 'obj'
    data: PerDataView[] = [];
}


export class PerDataView {
    type = 'per'
    key: string;
    val: any
}

export class ArrayDataView {
    type = 'array'
    data: any[] = []
}


class IsEmpty {
    static obj(val) {
        return !(val === undefined || val === null || Object.keys(val).length === 0);
    }

    static array(val) {
        return !val || val.length == 0;
    }
    static string(val) {
        return !!val
    }
    static number(val) {
        return val !== null && val !== undefined
    }

    static bool(val) {
        return !(typeof val === 'boolean');
    }
}

export interface IStringifyDataOptions {
    ignoreEmpty?: boolean;
    keyValueSeparate?: string;
    emptyValue?: string;
    separateBetweenKeys?: string
}

export class StringifyDataOptions {

    static defaults = {
        ignoreEmpty: true,
        keyValueSeparate: ': ',
        emptyValue: '',
        separateBetweenKeys: '  |  ',
    }

    ignoreEmpty?: boolean;
    keyValueSeparate?: string;
    emptyValue?: string;
    separateBetweenKeys?: string

    constructor(args: IStringifyDataOptions = {}) {
        this.ignoreEmpty = !IsEmpty.bool(args.ignoreEmpty) ? args.ignoreEmpty : StringifyDataOptions.defaults.ignoreEmpty;
        this.keyValueSeparate = args.keyValueSeparate || StringifyDataOptions.defaults.keyValueSeparate
        this.emptyValue = args.emptyValue || StringifyDataOptions.defaults.emptyValue
        this.separateBetweenKeys = args.separateBetweenKeys || StringifyDataOptions.defaults.separateBetweenKeys
    }
}

export interface ITranslateDataOptions {
    ignoreEmpty?: boolean;
    emptyValue?: any;
    displayed?: string[],
    ignored?: string[],
    keysMap?: object;
    valsMap?: object;
    keysTransform?: (key) => string;
}

export class TranslateDataOptions {

    static defaults = {
        ignoreEmpty: true,
        emptyValue: null,
        displayed: null,
        ignored: null,
        keysMap: {},
        valsMap: {},
        keysTransform: (key) => key,
    }

    ignoreEmpty?: boolean;
    emptyValue?: any;
    displayed?: string[];
    ignored?: string[];
    keysMap?: object;
    valsMap?: object;
    keysTransform?: (key) => string;

    constructor(args: ITranslateDataOptions = {}) {
        this.ignoreEmpty = !IsEmpty.bool(args.ignoreEmpty) ? args.ignoreEmpty : TranslateDataOptions.defaults.ignoreEmpty;
        this.emptyValue = args.emptyValue || TranslateDataOptions.defaults.emptyValue
        this.displayed = args.displayed;
        this.ignored = args.ignored;
        this.keysMap = args.keysMap || TranslateDataOptions.defaults.keysMap;
        this.valsMap = args.valsMap || TranslateDataOptions.defaults.valsMap;
        this.keysTransform = args.keysTransform || TranslateDataOptions.defaults.keysTransform
    }
}

export class StringifyData {

    constructor(private options) {
        if (!(this.options instanceof StringifyDataOptions)) {
            throw Error('You must to init StringifyData constructor with StringifyDataOptions');
        }
    }

    obj(o: ObjDataView) {
        let result = null;
        for (const item of o.data) {
            let content = null;
            const { key, val } = item;

            if (val instanceof ArrayDataView) {
                const _val = val.data;
                if (!IsEmpty.array(_val)) {
                    content = key + this.options.keyValueSeparate + this.arrayInShort(_val);
                } else if (!this.options.ignoreEmpty) {
                    content = key + this.options.keyValueSeparate + this.options.emptyValue;
                }

            } else if (typeof val === 'string') {
                if (IsEmpty.string(val)) {
                    content = key + this.options.keyValueSeparate + val;
                } else if (!this.options.ignoreEmpty) {
                    content = key + this.options.keyValueSeparate + this.options.emptyValue;
                }

            } else if (typeof val === 'number') {
                if (IsEmpty.number(val)) {
                    content = key + this.options.keyValueSeparate + val;
                } else if (!this.options.ignoreEmpty) {
                    content = key + this.options.keyValueSeparate + this.options.emptyValue;
                }

            } else if (typeof val === 'boolean') {
                if (IsEmpty.bool(val)) {
                    content = key + this.options.keyValueSeparate + val;
                } else if (!this.options.ignoreEmpty) {
                    content = key + this.options.keyValueSeparate + this.options.emptyValue;
                }
            }

            if (content) {
                if (result === null) {
                    result = content;
                } else {
                    result += this.options.separateBetweenKeys + content;
                }
            }
        }
        return result || this.options.emptyValue;
    }

    arrayInShort(a) {
        let result = a.slice(0, this.options.limit).join(', ')
        if (a.length > 3) {
            result += `...(${a.length})`;
        }
        return result;
    }

    array(a, mapValue?) {
        if (!a) {
            return '';
        }
        let b = a;
        if (typeof mapValue == 'object') {
            b = a.map(i => mapValue[i]);
        }
        return b.join(', ')
    }
}

export class TranslateData {
    constructor(private options: TranslateDataOptions) {
        if (!(this.options instanceof TranslateDataOptions)) {
            throw Error('You must to init TranslateData constructor with TranslateDataOptions');
        }
    }

    private _translateValue(key, val) {
        if (!this.options.valsMap) {
            return val
        }
        let opr = this.options.valsMap[key];
        if (!opr) {
            return val;
        } else if (typeof opr == 'function') {
            return opr(val, key);
        }
        return opr[val] || val;
    }

    private _translateKey(key) {
        let title;
        if (this.options.keysMap) {
            title = this.options.keysMap[key];
        }
        if (!title) {
            title = this.options.keysTransform(key);
        }
        return title;
    }

    obj = (obj): ObjDataView => {
        let keys = Object.keys(obj);
        if (this.options.ignored) {
            keys = keys.filter(k => this.options.ignored.indexOf(k) === -1);
        } else if (this.options.displayed) {
            keys = this.options.displayed;
        }

        let result = new ObjDataView();
        for (const key of keys) {
            let content = new PerDataView;
            let isContent = false;
            let title = this._translateKey(key);
            const val = obj[key];
            if (val instanceof Array) {

                content.key = title;
                if (!IsEmpty.array(val)) {
                    isContent = true;
                    content.val = this.array(key, val);
                } else if (!this.options.ignoreEmpty) {
                    isContent = true;
                    content.val = this.options.emptyValue;
                }

            } else if (typeof val === 'string') {
                content.key = title;
                if (IsEmpty.string(val)) {
                    isContent = true;
                    content.val = this._translateValue(key, val);
                } else if (!this.options.ignoreEmpty) {
                    isContent = true;
                    content.val = this.options.emptyValue;
                }

            } else if (typeof val === 'number') {

                content.key = title;
                if (IsEmpty.number(val)) {
                    isContent = true;
                    content.val = this._translateValue(key, val);
                } else if (!this.options.ignoreEmpty) {
                    isContent = true;
                    content.val = this.options.emptyValue;;
                }

            } else if (typeof val === 'boolean') {

                content.key = title;
                if (!IsEmpty.bool(val)) {
                    isContent = true;
                    content.val = this._translateValue(key, val);
                } else if (!this.options.ignoreEmpty) {
                    isContent = true;
                    content.val = this.options.emptyValue;;
                }

            }
            if (isContent) {
                result.data.push(content);
            }
        }
        return result;
    }

    array(key, a) {
        if (!a) {
            return;
        }
        const adv = new ArrayDataView()
        adv.data = a.map(i => this._translateValue(key, i));
        return adv
    }


}

export function NormalizeKey(key: string) {
    if (!key) {
        return key;
    }
    const words = key.replace(/_/, ' ').replace(/' '+/, ' ').split(' ');
    return words.map(w => w && w[0].toUpperCase() + w.slice(1)).join(' ');
}
