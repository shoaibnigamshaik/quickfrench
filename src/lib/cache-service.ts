import { indexedDBCache } from "./indexeddb";
import type {
  Adjective,
  Number,
  Preposition,
  Verb,
  Adverb,
  Food,
  FoodCategory,
  Transportation,
  BuildingItem,
  BodyItem,
  BodyCategory,
  FamilyItem,
  FamilyCategory,
  HomeItem,
  HomeCategory,
  NatureItem,
  NatureCategory,
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

  async getTransportation(config?: CacheConfig): Promise<Transportation[]> {
    return this.fetchWithCache<Transportation[]>(
      "transportation",
      "/api/transportation",
      config,
    );
  }

  async getColours(config?: CacheConfig) {
    return this.fetchWithCache<{ word: string; meaning: string }[]>(
      "colours",
      "/api/colours",
      config,
    );
  }

  async getHobbies(config?: CacheConfig) {
    return this.fetchWithCache<{ word: string; meaning: string }[]>(
      "hobbies",
      "/api/hobbies",
      config,
    );
  }

  async getWardrobe(config?: CacheConfig) {
    return this.fetchWithCache<{ word: string; meaning: string }[]>(
      "wardrobe",
      "/api/wardrobe",
      config,
    );
  }

  async getBuildings(config?: CacheConfig): Promise<BuildingItem[]> {
    return this.fetchWithCache<BuildingItem[]>(
      "buildings",
      "/api/buildings",
      config,
    );
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

  async getAllFood(config?: CacheConfig): Promise<Food[]> {
    return this.fetchWithCache<Food[]>("food", "/api/food", config);
  }

  async getBody(config?: CacheConfig): Promise<BodyItem[]> {
    return this.fetchWithCache<BodyItem[]>("body", "/api/body", config);
  }

  async getBodyCategories(config?: CacheConfig): Promise<BodyCategory[]> {
    return this.fetchWithCache<BodyCategory[]>(
      "body-categories",
      "/api/body-categories",
      config,
    );
  }

  async getBodyByCategory(
    category: string,
    config?: CacheConfig,
  ): Promise<BodyItem[]> {
    const cacheKey = `body-${category}`;
    const apiUrl = `/api/body/${encodeURIComponent(category)}`;
    return this.fetchWithCache<BodyItem[]>(cacheKey, apiUrl, config);
  }

  async getFamily(config?: CacheConfig): Promise<FamilyItem[]> {
    return this.fetchWithCache<FamilyItem[]>("family", "/api/family", config);
  }

  async getFamilyCategories(config?: CacheConfig): Promise<FamilyCategory[]> {
    return this.fetchWithCache<FamilyCategory[]>(
      "family-categories",
      "/api/family-categories",
      config,
    );
  }

  async getFamilyByCategory(
    category: string,
    config?: CacheConfig,
  ): Promise<FamilyItem[]> {
    const cacheKey = `family-${category}`;
    const apiUrl = `/api/family/${encodeURIComponent(category)}`;
    return this.fetchWithCache<FamilyItem[]>(cacheKey, apiUrl, config);
  }

  async getHome(config?: CacheConfig): Promise<HomeItem[]> {
    return this.fetchWithCache<HomeItem[]>("home", "/api/home", config);
  }

  async getHomeCategories(config?: CacheConfig): Promise<HomeCategory[]> {
    return this.fetchWithCache<HomeCategory[]>(
      "home-categories",
      "/api/home-categories",
      config,
    );
  }

  async getHomeByCategory(
    category: string,
    config?: CacheConfig,
  ): Promise<HomeItem[]> {
    const cacheKey = `home-${category}`;
    const apiUrl = `/api/home/${encodeURIComponent(category)}`;
    return this.fetchWithCache<HomeItem[]>(cacheKey, apiUrl, config);
  }

  async getNature(config?: CacheConfig): Promise<NatureItem[]> {
    return this.fetchWithCache<NatureItem[]>("nature", "/api/nature", config);
  }

  async getNatureCategories(config?: CacheConfig): Promise<NatureCategory[]> {
    return this.fetchWithCache<NatureCategory[]>(
      "nature-categories",
      "/api/nature-categories",
      config,
    );
  }

  async getNatureByCategory(
    category: string,
    config?: CacheConfig,
  ): Promise<NatureItem[]> {
    const cacheKey = `nature-${category}`;
    const apiUrl = `/api/nature/${encodeURIComponent(category)}`;
    return this.fetchWithCache<NatureItem[]>(cacheKey, apiUrl, config);
  }

  async getICT(config?: CacheConfig) {
    return this.fetchWithCache<{ word: string; meaning: string; category: string | null }[]>(
      "ict",
      "/api/ict",
      config,
    );
  }

  async getICTCategories(config?: CacheConfig) {
    return this.fetchWithCache<{ id: number; name: string }[]>(
      "ict-categories",
      "/api/ict-categories",
      config,
    );
  }

  async getICTByCategory(category: string, config?: CacheConfig) {
    const cacheKey = `ict-${category}`;
    const apiUrl = `/api/ict/${encodeURIComponent(category)}`;
    return this.fetchWithCache<{ word: string; meaning: string; category: string }[]>(
      cacheKey,
      apiUrl,
      config,
    );
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
        // Also clear the aggregate food key and categories list
        await indexedDBCache.delete("food");
        this.pendingRequests.delete("food");
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
        this.getTransportation(config),
        this.getColours(config),
        this.getHobbies(config),
        this.getWardrobe(config),
    this.getBuildings(config),
        this.getFoodCategories(config),
        this.getBody(config),
        this.getBodyCategories(config),
        this.getFamily(config),
        this.getFamilyCategories(config),
        this.getHome(config),
        this.getHomeCategories(config),
        this.getNature(config),
        this.getNatureCategories(config),
  this.getICT(config),
  this.getICTCategories(config),
      ];

      await Promise.all(promises);

      // Also preload food data for all categories
      const foodCategories = await this.getFoodCategories(config);
      const foodPromises = foodCategories.map((category) =>
        this.getFood(category.name, config),
      );

      await Promise.all(foodPromises);

      // Preload family categories and per-category items
      const familyCategories = await this.getFamilyCategories(config);
      const familyPromises = familyCategories.map((category) =>
        this.getFamilyByCategory(category.name, config),
      );

      await Promise.all(familyPromises);

      // Preload home categories and per-category items
      const homeCategories = await this.getHomeCategories(config);
      const homePromises = homeCategories.map((category) =>
        this.getHomeByCategory(category.name, config),
      );

      await Promise.all(homePromises);

      // Preload nature categories and per-category items
      const natureCategories = await this.getNatureCategories(config);
      const naturePromises = natureCategories.map((category) =>
        this.getNatureByCategory(category.name, config),
      );

      await Promise.all(naturePromises);

      // Preload ICT categories and per-category items
      const ictCategories = await this.getICTCategories(config);
      const ictPromises = ictCategories.map((category) =>
        this.getICTByCategory(category.name, config),
      );

      await Promise.all(ictPromises);

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
