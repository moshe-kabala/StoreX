import { KeyCache, KeyCacheEvents } from "./key_cache";
import { KeyCacheLimiter } from "./key_cache_limiter";
import { Key } from "./types";
import { FetchTracker } from "./fetch_tracker";

type createKeyValueCacheArgs<T> = {
  limit?: number;
  wait_map?: (val: T) => any;
  default_value?: () => T | null;
};

export function createKeyCache<T>({
  limit,
  wait_map,
  default_value
}: createKeyValueCacheArgs<T> = {}) {
  // create the key cache
  const cache = new KeyCache<T>({
    default_value
  });

  let limiter: KeyCacheLimiter | undefined;

  // if limit was defined create a limiter
  if (limit !== undefined) {
    limiter = new KeyCacheLimiter(limit);

    const update = (key: Key, value: T) => {
      limiter.up(key);
    };

    // listen on cache actions
    cache.on(KeyCacheEvents.set, update);
    cache.on(KeyCacheEvents.get, update);
    cache.on(KeyCacheEvents.remove, (key, value) => {
      limiter.remove(key);
    });
    cache.on(KeyCacheEvents.clean, () => {
      limiter.clean();
    });

    limiter.onLimited(key => {
      cache.remove(key);
    });
  }

  const tracker = new FetchTracker<T>(60000, wait_map);

  tracker.onEnded((key, value: T) => {
    cache.set(key, value);
  });

  return {
    limiter,
    cache,
    tracker
  };
}
