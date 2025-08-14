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
  ShoppingItem,
  EducationItem,
  WorkItem,
  BodyItem,
  BodyCategory,
  FamilyItem,
  FamilyCategory,
  HomeItem,
  HomeCategory,
  NatureItem,
  NatureCategory,
  ShoppingCategory,
  EducationCategory,
  WorkCategory,
} from "@/types/quiz";

export interface CacheConfig {
  ttl?: number;
  forceRefresh?: boolean;
}

class VocabularyCacheService {
  private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly pendingRequests = new Map<string, Promise<unknown>>();

  // Retry helper to make warmup resilient to transient failures
  private async withRetry<T>(
    op: () => Promise<T>,
    label: string,
    attempts = 2,
  ): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < Math.max(1, attempts); i++) {
      try {
        return await op();
      } catch (err) {
        lastErr = err;
        const delay = 300 * Math.pow(1.6, i);
        console.warn(`Retry ${i + 1}/${attempts} for ${label} after error:`, err);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr instanceof Error
      ? new Error(`${label} failed after ${attempts} attempts: ${lastErr.message}`)
      : new Error(`${label} failed after ${attempts} attempts`);
  }

  private async fetchWithCache<T>(
    cacheKey: string,
    apiUrl: string,
    config: CacheConfig = {},
  ): Promise<T> {
    const { ttl = this.defaultTTL, forceRefresh = false } = config;

    // If forcing refresh, bypass cache and fetch immediately
    if (forceRefresh) {
      return await this.fetchAndCache<T>(cacheKey, apiUrl, ttl);
    }

    // Try to read cache (regardless of expiry) to enable SWR semantics
    const cached = await indexedDBCache.getWithMeta<T>(cacheKey);
    const isFresh = cached ? Date.now() <= cached.expiresAt : false;

    if (cached) {
      // Return immediately, then kick off background revalidation if stale
      if (!isFresh) {
        this.revalidate<T>(cacheKey, apiUrl, ttl);
      } else {
        // Optionally still revalidate in background to keep hot data fresh
        this.revalidate<T>(cacheKey, apiUrl, ttl);
      }
      return cached.data as T;
    }

    // No cache: fetch and cache before returning
    return await this.fetchAndCache<T>(cacheKey, apiUrl, ttl);
  }
  private async fetchAndCache<T>(
    cacheKey: string,
    apiUrl: string,
    ttl: number,
  ): Promise<T> {
    // Deduplicate outstanding requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }
    const p = this.performNetworkFetch<T>(apiUrl)
      .then(async (data) => {
        try {
          await indexedDBCache.set(cacheKey, data, { ttl });
          console.log(`Cached ${cacheKey} successfully`);
        } catch (error) {
          console.warn(`Cache write error for ${cacheKey}:`, error);
        }
        return data;
      })
      .finally(() => this.pendingRequests.delete(cacheKey));
    this.pendingRequests.set(cacheKey, p);
    return await p;
  }

  private async revalidate<T>(
    cacheKey: string,
    apiUrl: string,
    ttl: number,
  ): Promise<void> {
    try {
      await this.fetchAndCache<T>(cacheKey, apiUrl, ttl);
    } catch (error) {
      console.warn(`Revalidate failed for ${cacheKey}:`, error);
    }
  }

  private async performNetworkFetch<T>(apiUrl: string): Promise<T> {
    console.log(`Fetching from API: ${apiUrl}`);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
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

  async getCulture(config?: CacheConfig) {
    return this.fetchWithCache<{ word: string; meaning: string }[]>(
      "culture",
      "/api/culture",
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

  async getShopping(config?: CacheConfig): Promise<ShoppingItem[]> {
    return this.fetchWithCache<ShoppingItem[]>(
      "shopping",
      "/api/shopping",
      config,
    );
  }

  async getShoppingCategories(
    config?: CacheConfig,
  ): Promise<ShoppingCategory[]> {
    return this.fetchWithCache<ShoppingCategory[]>(
      "shopping-categories",
      "/api/shopping-categories",
      config,
    );
  }

  async getShoppingByCategory(
    category: string,
    config?: CacheConfig,
  ): Promise<ShoppingItem[]> {
    const cacheKey = `shopping-${category}`;
    const apiUrl = `/api/shopping/${encodeURIComponent(category)}`;
    return this.fetchWithCache<ShoppingItem[]>(cacheKey, apiUrl, config);
  }

  async getEducation(config?: CacheConfig): Promise<EducationItem[]> {
    return this.fetchWithCache<EducationItem[]>(
      "education",
      "/api/education",
      config,
    );
  }

  async getEducationCategories(
    config?: CacheConfig,
  ): Promise<EducationCategory[]> {
    return this.fetchWithCache<EducationCategory[]>(
      "education-categories",
      "/api/education-categories",
      config,
    );
  }

  async getEducationByCategory(
    category: string,
    config?: CacheConfig,
  ): Promise<EducationItem[]> {
    const cacheKey = `education-${category}`;
    const apiUrl = `/api/education/${encodeURIComponent(category)}`;
    return this.fetchWithCache<EducationItem[]>(cacheKey, apiUrl, config);
  }

  async getWork(config?: CacheConfig): Promise<WorkItem[]> {
    return this.fetchWithCache<WorkItem[]>("work", "/api/work", config);
  }

  async getWorkCategories(config?: CacheConfig): Promise<WorkCategory[]> {
    return this.fetchWithCache<WorkCategory[]>(
      "work-categories",
      "/api/work-categories",
      config,
    );
  }

  async getWorkByCategory(
    category: string,
    config?: CacheConfig,
  ): Promise<WorkItem[]> {
    const cacheKey = `work-${category}`;
    const apiUrl = `/api/work/${encodeURIComponent(category)}`;
    return this.fetchWithCache<WorkItem[]>(cacheKey, apiUrl, config);
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
    return this.fetchWithCache<
      { word: string; meaning: string; category: string | null }[]
    >("ict", "/api/ict", config);
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
    return this.fetchWithCache<
      { word: string; meaning: string; category: string }[]
    >(cacheKey, apiUrl, config);
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
      // Top-level endpoints with retry; do not fail fast
      const topLevel: Array<() => Promise<unknown>> = [
        () => this.getAdjectives(config) as Promise<unknown>,
        () => this.getNumbers(config) as Promise<unknown>,
        () => this.getPrepositions(config) as Promise<unknown>,
        () => this.getVerbs(config) as Promise<unknown>,
        () => this.getAdverbs(config) as Promise<unknown>,
        () => this.getTransportation(config) as Promise<unknown>,
        () => this.getColours(config) as Promise<unknown>,
        () => this.getHobbies(config) as Promise<unknown>,
        () => this.getWardrobe(config) as Promise<unknown>,
        () => this.getCulture(config) as Promise<unknown>,
        () => this.getBuildings(config) as Promise<unknown>,
        () => this.getShopping(config) as Promise<unknown>,
        () => this.getEducation(config) as Promise<unknown>,
        () => this.getWork(config) as Promise<unknown>,
        () => this.getFoodCategories(config) as Promise<unknown>,
        () => this.getBody(config) as Promise<unknown>,
        () => this.getBodyCategories(config) as Promise<unknown>,
        () => this.getFamily(config) as Promise<unknown>,
        () => this.getFamilyCategories(config) as Promise<unknown>,
        () => this.getHome(config) as Promise<unknown>,
        () => this.getHomeCategories(config) as Promise<unknown>,
        () => this.getNature(config) as Promise<unknown>,
        () => this.getNatureCategories(config) as Promise<unknown>,
        () => this.getICT(config) as Promise<unknown>,
        () => this.getICTCategories(config) as Promise<unknown>,
        () => this.getShoppingCategories(config) as Promise<unknown>,
        () => this.getEducationCategories(config) as Promise<unknown>,
        () => this.getWorkCategories(config) as Promise<unknown>,
      ];

      const topResults = await Promise.allSettled(
        topLevel.map((fn, i) =>
          this.withRetry<unknown>(fn, `top-level-${i + 1}`, 2),
        ),
      );
      const topFailed = topResults.filter((r) => r.status === "rejected");
      if (topFailed.length) {
        console.warn(`Top-level warmup had ${topFailed.length} failures; continuing`);
      }

      // Also preload food data for all categories
      const foodCategories = await this.withRetry(
        () => this.getFoodCategories(config),
        "food-categories",
        2,
      );
      const foodPromises = foodCategories.map((category) =>
        this.withRetry(
          () => this.getFood(category.name, config),
          `food-${category.name}`,
          2,
        ),
      );
      await Promise.allSettled(foodPromises);

      // Preload family categories and per-category items
      const familyCategories = await this.withRetry(
        () => this.getFamilyCategories(config),
        "family-categories",
        2,
      );
      const familyPromises = familyCategories.map((category) =>
        this.withRetry(
          () => this.getFamilyByCategory(category.name, config),
          `family-${category.name}`,
          2,
        ),
      );
      await Promise.allSettled(familyPromises);

      // Preload home categories and per-category items
      const homeCategories = await this.withRetry(
        () => this.getHomeCategories(config),
        "home-categories",
        2,
      );
      const homePromises = homeCategories.map((category) =>
        this.withRetry(
          () => this.getHomeByCategory(category.name, config),
          `home-${category.name}`,
          2,
        ),
      );
      await Promise.allSettled(homePromises);

      // Preload nature categories and per-category items
      const natureCategories = await this.withRetry(
        () => this.getNatureCategories(config),
        "nature-categories",
        2,
      );
      const naturePromises = natureCategories.map((category) =>
        this.withRetry(
          () => this.getNatureByCategory(category.name, config),
          `nature-${category.name}`,
          2,
        ),
      );
      await Promise.allSettled(naturePromises);

      // Preload ICT categories and per-category items
      const ictCategories = await this.withRetry(
        () => this.getICTCategories(config),
        "ict-categories",
        2,
      );
      const ictPromises = ictCategories.map((category) =>
        this.withRetry(
          () => this.getICTByCategory(category.name, config),
          `ict-${category.name}`,
          2,
        ),
      );
      await Promise.allSettled(ictPromises);

      // Preload Shopping categories and per-category items
      const shoppingCategories = await this.withRetry(
        () => this.getShoppingCategories(config),
        "shopping-categories",
        2,
      );
      const shoppingPromises = shoppingCategories.map((category) =>
        this.withRetry(
          () => this.getShoppingByCategory(category.name, config),
          `shopping-${category.name}`,
          2,
        ),
      );
      await Promise.allSettled(shoppingPromises);

      // Preload Education categories and per-category items
      const educationCategories = await this.withRetry(
        () => this.getEducationCategories(config),
        "education-categories",
        2,
      );
      const educationPromises = educationCategories.map((category) =>
        this.withRetry(
          () => this.getEducationByCategory(category.name, config),
          `education-${category.name}`,
          2,
        ),
      );
      await Promise.allSettled(educationPromises);

      // Preload Work categories and per-category items
      const workCategories = await this.withRetry(
        () => this.getWorkCategories(config),
        "work-categories",
        2,
      );
      const workPromises = workCategories.map((category) =>
        this.withRetry(
          () => this.getWorkByCategory(category.name, config),
          `work-${category.name}`,
          2,
        ),
      );
      await Promise.allSettled(workPromises);

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
