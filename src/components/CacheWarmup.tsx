"use client";

import { useEffect, useRef, useState } from "react";
import { vocabularyCacheService } from "@/lib/cache-service";
import { indexedDBCache } from "@/lib/indexeddb";

// Increment this to force a one-time warmup again after deployments/schema/data changes
const WARMUP_VERSION = "2";
const STORAGE_KEY = "quickfrench.cacheWarmupVersion";

// requestIdleCallback helper removed (warmup runs immediately now)

export default function CacheWarmup() {
  const startedRef = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing === WARMUP_VERSION) {
      // Already warmed up for this version
      return;
    }

    const warmup = async () => {
      try {
        // Best-effort request persistent storage so the cache isn't evicted easily
        if (navigator.storage?.persist) {
          try {
            await navigator.storage.persist();
          } catch {
            // ignore
          }
        }

        // Ensure DB is ready before we start
        try {
          await indexedDBCache.init();
        } catch {}

        // Start warmup immediately to minimize partial cache counts
        try {
          await vocabularyCacheService.preloadAllData({ forceRefresh: false });
          localStorage.setItem(STORAGE_KEY, WARMUP_VERSION);
          setDone(true);
          // Notify listeners (e.g., Settings page) that warmup finished
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("quickfrench:cacheWarmupDone"));
          }
        } catch (e) {
          // If offline or an error occurs, try again on next visit or when connection returns
          console.warn("Cache warmup failed; will retry later:", e);
        }
      } catch (e) {
        console.warn("Cache warmup init failed:", e);
      }
    };

    // Start warmup when the page becomes visible to avoid wasted work in background tabs
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        warmup();
        document.removeEventListener("visibilitychange", onVisible);
      }
    };

    if (document.visibilityState === "visible") warmup();
    else document.addEventListener("visibilitychange", onVisible);

    // Retry once when network comes back if we haven't completed
    const onOnline = () => {
      if (!done) {
        startedRef.current = false; // allow retry
        setTimeout(() => {
          if (!startedRef.current) {
            startedRef.current = true;
            vocabularyCacheService
              .preloadAllData({ forceRefresh: false })
              .then(() => {
                localStorage.setItem(STORAGE_KEY, WARMUP_VERSION);
                setDone(true);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("quickfrench:cacheWarmupDone"));
                }
              })
              .catch(() => {});
          }
        }, 1000);
      }
    };
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [done]);

  return null;
}
