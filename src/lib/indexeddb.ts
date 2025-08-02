export interface CachedData<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds, default 24 hours
}

class IndexedDBCache {
  private dbName = 'QuickFrenchCache';
  private version = 1;
  private storeName = 'vocabulary';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB initialization error:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => {
        console.error(`IndexedDB get error for key ${key}:`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        const result = request.result as { key: string; value: CachedData<T> } | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        const { value } = result;
        
        // Check if data has expired
        if (Date.now() > value.expiresAt) {
          // Delete expired data
          this.delete(key).catch(console.error);
          resolve(null);
          return;
        }

        resolve(value.data);
      };
    });
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    if (!this.db) await this.init();

    const ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
    const now = Date.now();
    
    const cachedData: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key, value: cachedData });

      request.onerror = () => {
        console.error(`IndexedDB set error for key ${key}:`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllKeys(): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
    });
  }

  async cleanExpired(): Promise<void> {
    if (!this.db) await this.init();

    const now = Date.now();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiresAt');
      
      // Get all entries that have expired
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  async getCacheInfo(): Promise<{
    totalEntries: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  }> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entries = request.result as { key: string; value: CachedData }[];
        
        if (entries.length === 0) {
          resolve({
            totalEntries: 0,
            totalSize: 0,
            oldestEntry: null,
            newestEntry: null
          });
          return;
        }

        const timestamps = entries.map(entry => entry.value.timestamp);
        const totalSize = JSON.stringify(entries).length;

        resolve({
          totalEntries: entries.length,
          totalSize,
          oldestEntry: Math.min(...timestamps),
          newestEntry: Math.max(...timestamps)
        });
      };
    });
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();
