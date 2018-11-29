import { BaseCache, BaseCacheArgs } from "./base-cache";

export class Cache extends BaseCache {
  constructor(args: BaseCacheArgs) {
    super(args);
  }

  set(d) {
    this.data = d;
  }

  initData() {
    this.data = undefined;
  }
}
