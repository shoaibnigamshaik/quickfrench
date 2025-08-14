"use client";

import { useEffect, useRef, useState } from "react";
import { vocabularyCacheService } from "@/lib/cache-service";
import { indexedDBCache } from "@/lib/indexeddb";

// Increment this to force a one-time warmup again after deployments/schema/data changes
const WARMUP_VERSION = "1";
const STORAGE_KEY = "quickfrench.cacheWarmupVersion";

// Add an optional typing for requestIdleCallback on Window
// Schedules a callback when the browser is idle enough; falls back to a timeout.
function runWhenIdle(cb: () => void, timeout = 1500) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const ric = (window as Window & {
      requestIdleCallback?: Window["requestIdleCallback"];
    }).requestIdleCallback;
    if (typeof ric === "function") {
      ric(() => cb(), { timeout });
      return;
    }
  } else {
    // no window (SSR) or method missing
  }
  setTimeout(cb, timeout);
}

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

        // Defer heavy network work until after first paint/idle
        runWhenIdle(async () => {
          try {
            // Do not force refresh; we only want to fill if missing
            await vocabularyCacheService.preloadAllData({ forceRefresh: false });
            localStorage.setItem(STORAGE_KEY, WARMUP_VERSION);
            setDone(true);
          } catch (e) {
            // If offline or an error occurs, try again on next visit or when connection returns
            console.warn("Cache warmup failed; will retry later:", e);
          }
        });
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
            runWhenIdle(() => {
              vocabularyCacheService
                .preloadAllData({ forceRefresh: false })
                .then(() => {
                  localStorage.setItem(STORAGE_KEY, WARMUP_VERSION);
                  setDone(true);
                })
                .catch(() => {});
            });
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
