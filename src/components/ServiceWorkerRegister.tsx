"use client";

import { useEffect } from "react";

// Registers the service worker at /sw.js and handles updates
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          // updateViaCache controls how SW script itself is cached
          updateViaCache: "none",
          type: "classic",
        } as RegistrationOptions);

        // Listen for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New SW waiting; ask it to skip waiting so app updates quickly
              reg.waiting?.postMessage?.("SKIP_WAITING");
            }
          });
        });

        // If there's already a waiting SW (from a prior visit), nudge it
        if (reg.waiting) {
          reg.waiting.postMessage("SKIP_WAITING");
        }
      } catch (e) {
        // Non-fatal
        console.warn("Service worker registration failed", e);
      }
    };

    // Register after the page is loaded for reliability
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
