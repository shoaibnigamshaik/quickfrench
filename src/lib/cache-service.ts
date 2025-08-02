import { indexedDBCache } from "./indexeddb";
import type {
  Adjective,
  Number,
  Preposition,
  Verb,
  Adverb,
  Food,
  FoodCategory,
} from "@/types/quiz";

export interface CacheConfig {
  ttl?: number;
  forceRefresh?: boolean;
}

class VocabularyCacheService {
  private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly pendingRequests = new Map<string, Promise<unknown>>();

  private async fetchWithCache<T>(
    cacheKey: string,
    apiUrl: string,
    config: CacheConfig = {},
  ): Promise<T> {
    const { ttl = this.defaultTTL, forceRefresh = false } = config;

    // Check if there's already a pending request for this key
    if (!forceRefresh && this.pendingRequests.has(cacheKey)) {
      console.log(`Waiting for pending request: ${cacheKey}`);
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedData = await indexedDBCache.get<T>(cacheKey);
        if (cachedData) {
          console.log(`Cache hit for ${cacheKey}`);
          return cachedData;
        }
      } catch (error) {
        console.warn(`Cache read error for ${cacheKey}:`, error);
      }
    }

    // Create and store the fetch promise to prevent duplicate requests
    const fetchPromise = this.performFetch<T>(cacheKey, apiUrl, ttl);
    this.pendingRequests.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      // Clean up the pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async performFetch<T>(
    cacheKey: string,
    apiUrl: string,
    ttl: number,
  ): Promise<T> {
    // Fetch from API
    console.log(`Fetching ${cacheKey} from API`);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the result
      try {
        await indexedDBCache.set(cacheKey, data, { ttl });
        console.log(`Cached ${cacheKey} successfully`);
      } catch (error) {
        console.warn(`Cache write error for ${cacheKey}:`, error);
      }

      return data;
    } catch (error) {
      console.error(`API fetch error for ${cacheKey}:`, error);

      // Try to return stale cache data as fallback
      try {
        const staleData = await indexedDBCache.get<T>(cacheKey);
        if (staleData) {
          console.log(`Returning stale cache data for ${cacheKey}`);
          return staleData;
        }
      } catch (cacheError) {
        console.warn(`Stale cache read error for ${cacheKey}:`, cacheError);
      }

      throw error;
    }
  }

  async getAdjectives(config?: CacheConfig): Promise<Adjective[]> {
    return this.fetchWithCache<Adjective[]>(
      "adjectives",
      "/api/adjectives",
      config,
    );
  }

  async getNumbers(config?: CacheConfig): Promise<Number[]> {
    return this.fetchWithCache<Number[]>("numbers", "/api/numbers", config);
  }

  async getPrepositions(config?: CacheConfig): Promise<Preposition[]> {
    return this.fetchWithCache<Preposition[]>(
      "prepositions",
      "/api/prepositions",
      config,
    );
  }

  async getVerbs(config?: CacheConfig): Promise<Verb[]> {
    return this.fetchWithCache<Verb[]>("verbs", "/api/verbs", config);
  }

  async getAdverbs(config?: CacheConfig): Promise<Adverb[]> {
    return this.fetchWithCache<Adverb[]>("adverbs", "/api/adverbs", config);
  }

  async getFoodCategories(config?: CacheConfig): Promise<FoodCategory[]> {
    return this.fetchWithCache<FoodCategory[]>(
      "food-categories",
      "/api/food-categories",
      config,
    );
  }

  async getFood(category: string, config?: CacheConfig): Promise<Food[]> {
    const cacheKey = `food-${category}`;
    const apiUrl = `/api/food/${encodeURIComponent(category)}`;
    return this.fetchWithCache<Food[]>(cacheKey, apiUrl, config);
  }

  async clearAllCache(): Promise<void> {
    try {
      await indexedDBCache.clear();
      // Also clear pending requests
      this.pendingRequests.clear();
      console.log("All cache cleared successfully");
    } catch (error) {
      console.error("Error clearing cache:", error);
      throw error;
    }
  }

  async clearTopicCache(topic: string): Promise<void> {
    try {
      await indexedDBCache.delete(topic);
      // Remove any pending request for this topic
      this.pendingRequests.delete(topic);
      console.log(`Cache cleared for topic: ${topic}`);
    } catch (error) {
      console.error(`Error clearing cache for topic ${topic}:`, error);
      throw error;
    }
  }

  async clearFoodCache(category?: string): Promise<void> {
    try {
      if (category) {
        const cacheKey = `food-${category}`;
        await indexedDBCache.delete(cacheKey);
        this.pendingRequests.delete(cacheKey);
        console.log(`Cache cleared for food category: ${category}`);
      } else {
        // Clear all food-related cache
        const keys = await indexedDBCache.getAllKeys();
        const foodKeys = keys.filter((key) => key.startsWith("food-"));
        await Promise.all(
          foodKeys.map((key) => {
            this.pendingRequests.delete(key);
            return indexedDBCache.delete(key);
          }),
        );
        await indexedDBCache.delete("food-categories");
        this.pendingRequests.delete("food-categories");
        console.log("All food cache cleared");
      }
    } catch (error) {
      console.error(`Error clearing food cache:`, error);
      throw error;
    }
  }

  async getCacheInfo() {
    try {
      return await indexedDBCache.getCacheInfo();
    } catch (error) {
      console.error("Error getting cache info:", error);
      throw error;
    }
  }

  async cleanExpiredCache(): Promise<void> {
    try {
      await indexedDBCache.cleanExpired();
      console.log("Expired cache entries cleaned");
    } catch (error) {
      console.error("Error cleaning expired cache:", error);
      throw error;
    }
  }

  async preloadAllData(config?: CacheConfig): Promise<void> {
    console.log("Preloading all vocabulary data...");

    try {
      const promises = [
        this.getAdjectives(config),
        this.getNumbers(config),
        this.getPrepositions(config),
        this.getVerbs(config),
        this.getAdverbs(config),
        this.getFoodCategories(config),
      ];

      await Promise.all(promises);

      // Also preload food data for all categories
      const foodCategories = await this.getFoodCategories(config);
      const foodPromises = foodCategories.map((category) =>
        this.getFood(category.name, config),
      );

      await Promise.all(foodPromises);

      console.log("All vocabulary data preloaded successfully");
    } catch (error) {
      console.error("Error preloading data:", error);
      throw error;
    }
  }

  // Debug method to test cache functionality
  async testCache(): Promise<void> {
    console.log("Testing cache functionality...");

    try {
      // Test setting and getting a simple value
      await indexedDBCache.set("test-key", { test: "data" }, { ttl: 60000 }); // 1 minute TTL
      const retrieved = await indexedDBCache.get("test-key");
      console.log("Cache test result:", retrieved);

      // Get cache info
      const info = await this.getCacheInfo();
      console.log("Cache info:", info);

      // Clean up test data
      await indexedDBCache.delete("test-key");
      console.log("Cache test completed successfully");
    } catch (error) {
      console.error("Cache test failed:", error);
    }
  }
}

// Export singleton instance
export const vocabularyCacheService = new VocabularyCacheService();
