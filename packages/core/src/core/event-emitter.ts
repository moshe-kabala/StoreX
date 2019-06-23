export class EventEmitter {
  private __funcs: Map<string, Set<Function>> = new Map();

  private __on = (key: string, func: Function) => {
    if (!this.__funcs.has(key)) this.__funcs.set(key, new Set());

    this.__funcs.get(key).add(func);
  };

  on = (key: string | string[], func: Function) => {
    if (typeof func !== "function")
      throw Error(
        `[EventEmitter::on] You must send a function. but received a ${func}`
      );

    singleOrMulti(key, this.__on, func);
  };

  private __emit = (key, args?: any) => {
    const funcs = this.__funcs.get(key);
    if (!funcs) return;

    for (const func of funcs) if (typeof func == "function") func(args);
  };

  emit = (key: string | string[], args?: any) => {
    singleOrMulti(key, this.__emit, args);
  };

  private __removeListener = (key, func) => {
    if (this.__funcs.has(key)) this.__funcs.get(key).delete(func);
  };

  removeListener = (key: string | string[], func) => {
    singleOrMulti(key, this.__removeListener, func);
  };
}

function singleOrMulti(arg, func, ...args) {
  if (arg instanceof Array) {
    for (const a of arg) func(a, ...args);
  } else {
    func(arg, ...args);
  }
}
