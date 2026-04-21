import localForage from "localforage";

interface CacheItem {
  value: any;
  expiry: number | null;
}

export default class Cache {
  static instance: LocalForage;

  static {
    Cache.instance = localForage.createInstance({
      name: "fishtank",
      driver: localForage.INDEXEDDB,
      version: 1.0,
    });
  }

  static async set(key: string, value: any, expiry?: number) {
    const item: CacheItem = {
      value,
      expiry: expiry ? Date.now() + expiry * 1000 : null,
    };

    return Cache.instance.setItem(key, item);
  }

  static async get(key: string) {
    try {
      const item: CacheItem | null = await Cache.instance.getItem(key);

      if (!item || typeof item !== "object" || !("value" in item)) {
        return null;
      }

      const cacheItem = item as CacheItem;

      if (cacheItem.expiry && Date.now() > cacheItem.expiry) {
        await Cache.remove(key);
        return null;
      }

      return cacheItem.value;
    } catch {
      return null;
    }
  }

  static async remove(key: string) {
    await Cache.instance.removeItem(key);
  }
}
