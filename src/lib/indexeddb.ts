import Dexie, { Table } from "dexie";

export interface CachedData<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds, default 24 hours
}

interface CacheEntry {
  key: string;
  value: CachedData;
}

class QuickFrenchDB extends Dexie {
  vocabulary!: Table<CacheEntry>;

  constructor() {
    super("QuickFrenchCache");
    this.version(1).stores({
      vocabulary: "key, value.expiresAt",
    });
  }
}

class IndexedDBCache {
  private db: QuickFrenchDB;

  constructor() {
    this.db = new QuickFrenchDB();
  }

  async init(): Promise<void> {
    // Dexie handles initialization automatically, but we can open explicitly
    await this.db.open();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.db.vocabulary.get(key);

      if (!entry) {
        return null;
      }

      const { value } = entry;

      // Check if data has expired
      if (Date.now() > value.expiresAt) {
        // Delete expired data
        await this.delete(key);
        return null;
      }

      return value.data as T;
    } catch (error) {
      console.error(`Dexie get error for key ${key}:`, error);
      return null;
    }
  }
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {},
  ): Promise<void> {
    try {
      const ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
      const now = Date.now();

      const cachedData: CachedData<T> = {
        data,
        timestamp: now,
        expiresAt: now + ttl,
      };

      await this.db.vocabulary.put({ key, value: cachedData });
    } catch (error) {
      console.error(`Dexie set error for key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.db.vocabulary.delete(key);
    } catch (error) {
      console.error(`Dexie delete error for key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.db.vocabulary.clear();
    } catch (error) {
      console.error("Dexie clear error:", error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await this.db.vocabulary.orderBy("key").keys();
      return keys as string[];
    } catch (error) {
      console.error("Dexie getAllKeys error:", error);
      return [];
    }
  }

  async cleanExpired(): Promise<void> {
    try {
      const now = Date.now();
      // Use Dexie's where clause to filter expired entries
      await this.db.vocabulary.where("value.expiresAt").below(now).delete();
    } catch (error) {
      console.error("Dexie cleanExpired error:", error);
      throw error;
    }
  }

  async getCacheInfo(): Promise<{
    totalEntries: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  }> {
    try {
      const entries = await this.db.vocabulary.toArray();

      if (entries.length === 0) {
        return {
          totalEntries: 0,
          totalSize: 0,
          oldestEntry: null,
          newestEntry: null,
        };
      }

      const timestamps = entries.map((entry) => entry.value.timestamp);
      const totalSize = JSON.stringify(entries).length;

      return {
        totalEntries: entries.length,
        totalSize,
        oldestEntry: Math.min(...timestamps),
        newestEntry: Math.max(...timestamps),
      };
    } catch (error) {
      console.error("Dexie getCacheInfo error:", error);
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();
