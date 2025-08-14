import { useState, useCallback, useEffect } from "react";
import { vocabularyCacheService } from "@/lib/cache-service";

interface CacheInfo {
  totalEntries: number;
  totalSize: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

export const useCacheManagement = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  // Track online/offline status
  useEffect(() => {
    const update = () => setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    update();
    if (typeof window !== "undefined") {
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      return () => {
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    }
  }, []);

  const getCacheInfo = useCallback(async () => {
    try {
      const info = await vocabularyCacheService.getCacheInfo();
      setCacheInfo(info);
    } catch (err) {
      console.error("Error getting cache info:", err);
      setError("Failed to get cache information");
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      // Prevent refresh while offline (server APIs unavailable)
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("offline");
      }
      await vocabularyCacheService.preloadAllData({ forceRefresh: true });
      await getCacheInfo(); // Update cache info after refresh
    } catch (err) {
      console.error("Error refreshing data:", err);
      if ((err as Error)?.message === "offline") {
        setError("You're offline. Connect to refresh from database.");
      } else {
        setError("Failed to refresh data from database");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [getCacheInfo]);

  const clearAllCache = useCallback(async () => {
    setIsClearing(true);
    setError(null);

    try {
      // UX: avoid clearing cache while offline to prevent data loss with no way to refetch
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("offline");
      }
      await vocabularyCacheService.clearAllCache();
      setCacheInfo({
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      });
    } catch (err) {
      console.error("Error clearing cache:", err);
      if ((err as Error)?.message === "offline") {
        setError("You're offline. Clearing cache is disabled to prevent data loss.");
      } else {
        setError("Failed to clear cache");
      }
    } finally {
      setIsClearing(false);
    }
  }, []);

  const clearTopicCache = useCallback(
    async (topic: string) => {
      try {
        await vocabularyCacheService.clearTopicCache(topic);
        await getCacheInfo(); // Update cache info after clearing
      } catch (err) {
        console.error(`Error clearing cache for topic ${topic}:`, err);
        setError(`Failed to clear cache for ${topic}`);
      }
    },
    [getCacheInfo],
  );

  const clearFoodCache = useCallback(
    async (category?: string) => {
      try {
        await vocabularyCacheService.clearFoodCache(category);
        await getCacheInfo(); // Update cache info after clearing
      } catch (err) {
        console.error("Error clearing food cache:", err);
        setError("Failed to clear food cache");
      }
    },
    [getCacheInfo],
  );

  const cleanExpiredCache = useCallback(async () => {
    try {
      await vocabularyCacheService.cleanExpiredCache();
      await getCacheInfo(); // Update cache info after cleaning
    } catch (err) {
      console.error("Error cleaning expired cache:", err);
      setError("Failed to clean expired cache");
    }
  }, [getCacheInfo]);

  const formatCacheSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  }, []);

  const formatLastUpdated = useCallback((timestamp: number | null): string => {
    if (!timestamp) return "Never";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
  }, []);

  return {
    cacheInfo,
    isRefreshing,
    isClearing,
  isOnline,
    error,
    getCacheInfo,
    refreshAllData,
    clearAllCache,
    clearTopicCache,
    clearFoodCache,
    cleanExpiredCache,
    formatCacheSize,
    formatLastUpdated,
  };
};
