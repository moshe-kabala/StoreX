export class IsEmpty {
  static obj(val) {
    return val === undefined || val === null || Object.keys(val).length === 0;
  }

  static array(val) {
    return !val || val.length == 0;
  }
  static string(val) {
    return !!val;
  }
  static number(val) {
    return val !== null && val !== undefined;
  }

  static bool(val) {
    return !(typeof val === "boolean");
  }
}

export interface IStringifyDataOptions {
  ignoreEmpty?: boolean;
  keyValueSeparate?: string;
  emptyValue?: string;
  separateBetweenKeys?: string;
}

export class StringifyDataOptions {
  static defaults = {
    ignoreEmpty: true,
    keyValueSeparate: ": ",
    emptyValue: "",
    separateBetweenKeys: "  |  "
  };

  ignoreEmpty?: boolean;
  keyValueSeparate?: string;
  emptyValue?: string;
  separateBetweenKeys?: string;

  constructor(args: IStringifyDataOptions = {}) {
    this.ignoreEmpty = !IsEmpty.bool(args.ignoreEmpty)
      ? args.ignoreEmpty
      : StringifyDataOptions.defaults.ignoreEmpty;
    this.keyValueSeparate =
      args.keyValueSeparate || StringifyDataOptions.defaults.keyValueSeparate;
    this.emptyValue =
      args.emptyValue || StringifyDataOptions.defaults.emptyValue;
    this.separateBetweenKeys =
      args.separateBetweenKeys ||
      StringifyDataOptions.defaults.separateBetweenKeys;
  }
}

export interface ITranslateDataOptions {
  ignoreEmpty?: boolean;
  emptyValue?: any;
  displayed?: string[];
  ignored?: string[];
  keysMap?: object;
  valsMap?: object;
  computed?: { [key: string]: any };
  keysTransform?: (key) => string;
}

export class DataTranslatorOptions {
  static defaults = {
    ignoreEmpty: true,
    emptyValue: null,
    displayed: null,
    ignored: null,
    keysMap: {},
    valsMap: {},
    computed: {},
    keysTransform: key => key
  };

  ignoreEmpty?: boolean;
  emptyValue?: any;
  displayed?: string[];
  ignored?: string[];
  keysMap?: object;
  valsMap?: object;
  computed?: object;
  keysTransform?: (key) => string;

  constructor(args: ITranslateDataOptions = {}) {
    this.ignoreEmpty = !IsEmpty.bool(args.ignoreEmpty)
      ? args.ignoreEmpty
      : DataTranslatorOptions.defaults.ignoreEmpty;
    this.emptyValue =
      args.emptyValue || DataTranslatorOptions.defaults.emptyValue;
    this.displayed = args.displayed;
    this.ignored = args.ignored;
    this.keysMap = args.keysMap || DataTranslatorOptions.defaults.keysMap;
    this.valsMap = args.valsMap || DataTranslatorOptions.defaults.valsMap;
    this.computed = args.computed;
    this.keysTransform =
      args.keysTransform || DataTranslatorOptions.defaults.keysTransform;
  }
}

export class StringifyData {
  constructor(private options) {
    if (!(this.options instanceof StringifyDataOptions)) {
      throw Error(
        "You must to init StringifyData constructor with StringifyDataOptions"
      );
    }
  }

  obj = (o) => {
    let result = null;
    for (const key in o) {
      let content = null;
      const val = o[key];

      if (val instanceof Array) {
        const _val = val;
        if (!IsEmpty.array(_val)) {
          content =
            key + this.options.keyValueSeparate + this.arrayInShort(_val);
        } else if (!this.options.ignoreEmpty) {
          content =
            key + this.options.keyValueSeparate + this.options.emptyValue;
        }
      } else if (typeof val === "string") {
        if (IsEmpty.string(val)) {
          content = key + this.options.keyValueSeparate + val;
        } else if (!this.options.ignoreEmpty) {
          content =
            key + this.options.keyValueSeparate + this.options.emptyValue;
        }
      } else if (typeof val === "number") {
        if (IsEmpty.number(val)) {
          content = key + this.options.keyValueSeparate + val;
        } else if (!this.options.ignoreEmpty) {
          content =
            key + this.options.keyValueSeparate + this.options.emptyValue;
        }
      } else if (typeof val === "boolean") {
        if (IsEmpty.bool(val)) {
          content = key + this.options.keyValueSeparate + val;
        } else if (!this.options.ignoreEmpty) {
          content =
            key + this.options.keyValueSeparate + this.options.emptyValue;
        }
      } else if (typeof val === "object") {
        if (!IsEmpty.obj(val)) {
          content = key + this.options.keyValueSeparate + `{${this.obj(val)}}`;
        } else if (!this.options.ignoreEmpty) {
          content =
            key + this.options.keyValueSeparate + this.options.emptyValue;
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
    let result = a.slice(0, this.options.limit).join(", ");
    if (a.length > 3) {
      result += `...(${a.length})`;
    }
    return result;
  }

  array(a, mapValue?) {
    if (!a) {
      return "";
    }
    let b = a;
    if (typeof mapValue == "object") {
      b = a.map(i => mapValue[i]);
    }
    return b.join(", ");
  }
}

export class DataTranslator {
  constructor(private options: DataTranslatorOptions) {
    if (!(this.options instanceof DataTranslatorOptions)) {
      throw Error(
        "You must to init TranslateData constructor with TranslateDataOptions"
      );
    }
  }

  private _translateValue(key, val, obj?) {
    if (!this.options.valsMap) {
      return val;
    }
    let opr = this.options.valsMap[key];
    if (!opr) {
      return val;
    } else if (typeof opr == "function") {
      return opr(val, obj);
    } else if (opr instanceof DataTranslatorOptions) {
      return opr;
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

  obj(obj) {
    return this._obj(
      obj,
      this._translateKey.bind(this),
      this._translateValue.bind(this),
      this.options
    );
  }

  _obj = (obj, _translateKey, _translateValue, options) => {
    let keys = Object.keys(obj);
    if (options.ignored) {
      keys = keys.filter(k => options.ignored.indexOf(k) === -1);
    } else if (options.displayed) {
      keys = options.displayed;
    }

    let result = {};
    for (const key of keys) {
      let content = { key, val: {} };
      let isContent = false;
      content.key = _translateKey(key);
      const val = obj[key];
      if (val instanceof Array) {
        if (!IsEmpty.array(val)) {
          isContent = true;
          content.val = this._array(key, val, obj, _translateValue);
        } else if (!options.ignoreEmpty) {
          isContent = true;
          content.val = options.emptyValue;
        }
      } else if (typeof val === "string") {
        if (IsEmpty.string(val)) {
          isContent = true;
          content.val = _translateValue(key, val, obj);
        } else if (!options.ignoreEmpty) {
          isContent = true;
          content.val = options.emptyValue;
        }
      } else if (typeof val === "number") {
        if (IsEmpty.number(val)) {
          isContent = true;
          content.val = _translateValue(key, val, obj);
        } else if (!options.ignoreEmpty) {
          isContent = true;
          content.val = options.emptyValue;
        }
      } else if (typeof val === "boolean") {
        if (!IsEmpty.bool(val)) {
          isContent = true;
          content.val = _translateValue(key, val, obj);
        } else if (!options.ignoreEmpty) {
          isContent = true;
          content.val = options.emptyValue;
        }
      } else if (typeof val === "object") {
        if (!IsEmpty.obj(val)) {
          isContent = true;
          const tr = _translateValue(key, val, obj);
          if (tr instanceof DataTranslatorOptions) {
            content.val = this._obj(
              val,
              this.createNestedTranslateKey(tr),
              this.createNestedTranslateVal(tr),
              tr
            );
          } else {
            content.val = tr;
          }
        } else if (!this.options.ignoreEmpty) {
          isContent = true;
          content.val = this.options.emptyValue;
        }
      }

      if (isContent) {
        result[content.key || key] = content.val;
      }
    }

    if (options.computed) {
      for (const key in options.computed) {
        let val = options.computed[key];
        if (typeof val === "function") {
          val = val(result, obj); // todo send root
        }
        if (val !== undefined) {
          result[key] = val;
        }
      }
    }
    return result;
  };

  createNestedTranslateKey = options => {
    return this._translateKey.bind({ options });
  };
  createNestedTranslateVal = options => {
    return this._translateValue.bind({ options });
  };
  array(key, a, obj) {
    return this._array(key, a, obj, this._translateValue.bind(this));
  }

  _array(key, a, obj, _translateValue) {
    if (!a) {
      return;
    }
    return a.map(i => _translateValue(key, i, obj));
  }
}

export function NormalizeKey(key: string) {
  if (!key) {
    return key;
  }
  const words = key
    .replace(/_/g, " ")
    .replace(/' '+/, " ")
    .split(" ");
  return words.map(w => w && w[0].toUpperCase() + w.slice(1)).join(" ");
}
