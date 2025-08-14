"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Palette,
  HelpCircle,
  Info,
  CheckCircle,
  LucideIcon,
  Clock,
  RefreshCw,
  Trash2,
  HardDrive,
} from "lucide-react";
import { useCacheManagement } from "@/hooks/useCacheManagement";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

interface SettingItem {
  icon: LucideIcon;
  label: string;
  description: string;
  type:
    | "select"
    | "quiz-mode"
    | "question-count"
    | "auto-advance"
    | "cache-refresh"
    | "cache-clear"
    | "cache-info";
  value?: boolean | string;
  options?: string[];
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsPage = () => {
  // Theme mode state: Light | Dark | Auto
  const [themeMode, setThemeMode] = React.useState<"Light" | "Dark" | "Auto">(
    "Auto",
  );
  const [quizMode, setQuizMode] = React.useState<"multiple-choice" | "typing">(
    "multiple-choice",
  );
  const [questionCount, setQuestionCount] = React.useState<number | "all">(10);
  const [autoAdvance, setAutoAdvance] = React.useState(false);
  const [autoAdvanceDelayMs, setAutoAdvanceDelayMs] =
    React.useState<number>(1000);
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  // Cache management
  const {
    cacheInfo,
    isRefreshing,
    isClearing,
  isOnline,
    error: cacheError,
    getCacheInfo,
    refreshAllData,
    clearAllCache,
    formatCacheSize,
    formatLastUpdated,
  } = useCacheManagement();

  // Load cache info on component mount
  React.useEffect(() => {
    getCacheInfo();
  }, [getCacheInfo]);

  // Update cache info when background warmup completes
  React.useEffect(() => {
    const handler = () => getCacheInfo();
    if (typeof window !== "undefined") {
      window.addEventListener("quickfrench:cacheWarmupDone", handler as EventListener);
      return () => window.removeEventListener("quickfrench:cacheWarmupDone", handler as EventListener);
    }
  }, [getCacheInfo]);

  // Load saved settings from localStorage
  React.useEffect(() => {
    // Initialize theme from storage or system
    const savedTheme = (localStorage.getItem("theme") || "auto").toLowerCase();
    if (savedTheme === "light") setThemeMode("Light");
    else if (savedTheme === "dark") setThemeMode("Dark");
    else setThemeMode("Auto");

    const savedMode = localStorage.getItem("quizMode") as
      | "multiple-choice"
      | "typing";
    const savedCount = localStorage.getItem("questionCount");
    const savedAutoAdvance = localStorage.getItem("autoAdvance");
    const savedAutoAdvanceDelay = localStorage.getItem("autoAdvanceDelayMs");

    if (savedMode) {
      setQuizMode(savedMode);
    }
    if (savedCount) {
      const count = savedCount === "all" ? "all" : parseInt(savedCount);
      setQuestionCount(count);
      // Show custom input if the saved value isn't one of the preset buttons
      if (typeof count === "number" && ![5, 10, 15, 20].includes(count)) {
        setShowCustomInput(true);
      }
    }
    if (savedAutoAdvance !== null) {
      setAutoAdvance(savedAutoAdvance === "true");
    }
    if (
      savedAutoAdvanceDelay &&
      !Number.isNaN(parseInt(savedAutoAdvanceDelay))
    ) {
      const ms = Math.min(
        Math.max(parseInt(savedAutoAdvanceDelay, 10), 300),
        5000,
      );
      setAutoAdvanceDelayMs(ms);
    }
  }, []);

  // Keep theme in sync with system when in Auto mode
  React.useEffect(() => {
    if (themeMode !== "Auto") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.classList.toggle("dark", media.matches);
    };
    apply();
    // Support older browsers
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    } else {
      media.addListener(apply);
      return () => {
        media.removeListener(apply);
      };
    }
  }, [themeMode]);

  // Apply theme immediately for Light/Dark modes
  React.useEffect(() => {
    if (themeMode === "Auto") return;
    const root = document.documentElement;
    root.classList.toggle("dark", themeMode === "Dark");
  }, [themeMode]);

  // Save quiz mode to localStorage when changed
  const handleQuizModeChange = (mode: "multiple-choice" | "typing") => {
    setQuizMode(mode);
    localStorage.setItem("quizMode", mode);
  };

  // Save question count to localStorage when changed
  const handleQuestionCountChange = (count: number | "all") => {
    setQuestionCount(count);
    localStorage.setItem("questionCount", count.toString());
    // Hide custom input if selecting a preset value
    if (count === "all" || [5, 10, 15, 20].includes(count as number)) {
      setShowCustomInput(false);
    }
  };

  // Handle custom button click
  const handleCustomClick = () => {
    setShowCustomInput(true);
  };

  // Save auto advance to localStorage when changed
  const handleAutoAdvanceChange = () => {
    const newAutoAdvance = !autoAdvance;
    setAutoAdvance(newAutoAdvance);
    localStorage.setItem("autoAdvance", newAutoAdvance.toString());
  };

  const handleAutoAdvanceDelayChange = (ms: number) => {
    const clamped = Math.min(Math.max(ms, 300), 5000);
    setAutoAdvanceDelayMs(clamped);
    localStorage.setItem("autoAdvanceDelayMs", String(clamped));
  };

  const settingsSections: SettingSection[] = [
    // Moved Appearance above Quiz Settings
    {
      title: "Appearance",
      items: [
        {
          icon: Palette,
          label: "Theme",
          description: "Choose your preferred theme",
          type: "select",
          value: "Light",
          options: ["Light", "Dark", "Auto"],
        },
      ],
    },
    {
      title: "Quiz Settings",
      items: [
        {
          icon: CheckCircle,
          label: "Quiz Mode",
          description: "Choose how you want to answer questions",
          type: "quiz-mode" as const,
        },
        {
          icon: HelpCircle,
          label: "Questions per Quiz",
          description: "Choose how many questions per quiz",
          type: "question-count" as const,
        },
        // Translation Direction control removed; toggle now lives on TopicSelector
        {
          icon: Clock,
          label: "Auto Advance",
          description:
            "Automatically move to next question after correct answer",
          type: "auto-advance" as const,
          value: autoAdvance,
        },
        // Delay slider/input rendered alongside toggle
      ],
    },
    {
      title: "Data & Cache",
      items: [
        {
          icon: HardDrive,
          label: "Cache Information",
          description: `${cacheInfo ? cacheInfo.totalEntries : 0} items cached • ${cacheInfo ? formatCacheSize(cacheInfo.totalSize) : "0 B"} • Last updated: ${cacheInfo ? formatLastUpdated(cacheInfo.newestEntry) : "Never"}`,
          type: "cache-info" as const,
        },
        {
          icon: RefreshCw,
          label: "Refresh from Database",
          description: "Fetch fresh data from the database and update cache",
          type: "cache-refresh" as const,
        },
        {
          icon: Trash2,
          label: "Clear Cache",
          description: "Remove all cached data (will be refetched when needed)",
          type: "cache-clear" as const,
        },
      ],
    },
  ];

  // Removed generic toggles/links in favor of only functional settings

  // Generic select handler removed (no non-theme selects left)

  const handleThemeSwitch = (t: "light" | "dark" | "system") => {
    // sync our select state wording with new switcher
    const mode: "Light" | "Dark" | "Auto" =
      t === "system" ? "Auto" : t === "light" ? "Light" : "Dark";
    setThemeMode(mode);
    const root = document.documentElement;
    if (t === "system") {
      localStorage.setItem("theme", "auto");
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      root.classList.toggle("dark", media.matches);
    } else {
      localStorage.setItem("theme", t);
      root.classList.toggle("dark", t === "dark");
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto p-4">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-200 transform hover:scale-105 mr-4"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <ArrowLeft
                className="h-6 w-6"
                style={{ color: "var(--muted-foreground)" }}
              />
            </Link>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                Settings
              </h1>
              <p style={{ color: "var(--muted-foreground)" }}>
                Customize your quiz experience
              </p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl shadow-lg border overflow-hidden"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="bg-gradient-to-r p-6 from-[var(--section-grad-from)] to-[var(--section-grad-to)] rounded-t-3xl">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {section.title}
                </h2>
                {section.title === "Data & Cache" && !isOnline && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs border"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--muted-foreground)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                    Offline: refresh and clear are disabled
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 rounded-xl transition-colors duration-200"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--primary-100)" }}
                      >
                        <item.icon
                          className="h-5 w-5"
                          style={{ color: "var(--primary-600)" }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          {item.label}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {item.type === "quiz-mode" && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="quiz-mode"
                                value="multiple-choice"
                                checked={quizMode === "multiple-choice"}
                                onChange={(e) =>
                                  handleQuizModeChange(
                                    e.target.value as "multiple-choice",
                                  )
                                }
                                className="w-4 h-4"
                                style={{ accentColor: "var(--primary-600)" }}
                              />
                              <span
                                className="text-sm font-medium"
                                style={{ color: "var(--foreground)" }}
                              >
                                Multiple Choice
                              </span>
                              <div className="relative group">
                                <Info
                                  className="h-4 w-4 cursor-help"
                                  style={{ color: "var(--muted-foreground)" }}
                                />
                                <div
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 text-xs rounded-lg shadow-xl z-50 border break-words"
                                  style={{
                                    backgroundColor: "var(--card)",
                                    color: "var(--foreground)",
                                    borderColor: "var(--border)",
                                    maxWidth: "min(18rem, calc(100vw - 2rem))",
                                  }}
                                >
                                  <div
                                    className="mb-2 font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                  >
                                    Multiple Choice Mode:
                                  </div>
                                  <div
                                    className="space-y-1"
                                    style={{ color: "var(--muted-foreground)" }}
                                  >
                                    <div>• Select from 4 options</div>
                                    <div>• Use keys 1-4 to select</div>
                                    <div>• Space/Enter for next</div>
                                    <div>• R to restart</div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="quiz-mode"
                                value="typing"
                                checked={quizMode === "typing"}
                                onChange={(e) =>
                                  handleQuizModeChange(
                                    e.target.value as "typing",
                                  )
                                }
                                className="w-4 h-4"
                                style={{ accentColor: "var(--primary-600)" }}
                              />
                              <span
                                className="text-sm font-medium"
                                style={{ color: "var(--foreground)" }}
                              >
                                Fill in the Blank
                              </span>
                              <div className="relative group">
                                <Info
                                  className="h-4 w-4 cursor-help"
                                  style={{ color: "var(--muted-foreground)" }}
                                />
                                <div
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 text-xs rounded-lg shadow-xl z-50 border break-words"
                                  style={{
                                    backgroundColor: "var(--card)",
                                    color: "var(--foreground)",
                                    borderColor: "var(--border)",
                                    maxWidth: "min(18rem, calc(100vw - 2rem))",
                                  }}
                                >
                                  <div
                                    className="mb-2 font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                  >
                                    Fill in the Blank Mode:
                                  </div>
                                  <div
                                    className="space-y-1"
                                    style={{ color: "var(--muted-foreground)" }}
                                  >
                                    <div>• Type the English meaning</div>
                                    <div>• Type your answer</div>
                                    <div>• Enter to submit</div>
                                    <div>• Space for next question</div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      {item.type === "question-count" && (
                        <div className="space-y-4">
                          {/* Quick Select Buttons */}
                          <div className="flex flex-wrap gap-2 justify-end">
                            {[5, 10, 15, 20].map((count) => (
                              <button
                                key={count}
                                onClick={() => handleQuestionCountChange(count)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${questionCount === count ? "shadow-lg" : "border"}`}
                                style={
                                  questionCount === count
                                    ? {
                                        backgroundColor: "var(--primary-600)",
                                        color: "#fff",
                                      }
                                    : {
                                        backgroundColor: "var(--card)",
                                        color: "var(--foreground)",
                                        borderColor: "var(--border)",
                                      }
                                }
                              >
                                {count}
                              </button>
                            ))}
                            <button
                              onClick={() => handleQuestionCountChange("all")}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${questionCount === "all" ? "shadow-lg" : "border"}`}
                              style={
                                questionCount === "all"
                                  ? {
                                      backgroundColor: "#7c3aed",
                                      color: "#fff",
                                    }
                                  : {
                                      backgroundColor: "var(--card)",
                                      color: "var(--foreground)",
                                      borderColor: "var(--border)",
                                    }
                              }
                            >
                              All
                            </button>
                            <button
                              onClick={handleCustomClick}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${showCustomInput && typeof questionCount === "number" && ![5, 10, 15, 20].includes(questionCount) ? "shadow-lg" : "border"}`}
                              style={
                                showCustomInput &&
                                typeof questionCount === "number" &&
                                ![5, 10, 15, 20].includes(questionCount)
                                  ? {
                                      backgroundColor: "var(--accent-600)",
                                      color: "#fff",
                                    }
                                  : {
                                      backgroundColor: "var(--card)",
                                      color: "var(--foreground)",
                                      borderColor: "var(--border)",
                                    }
                              }
                            >
                              Custom
                            </button>
                          </div>

                          {/* Custom Input - Only shown when custom button is clicked */}
                          {showCustomInput && (
                            <div className="flex items-center justify-end space-x-2">
                              <label
                                className="text-sm"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                Enter amount:
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="50"
                                value={
                                  typeof questionCount === "number"
                                    ? questionCount
                                    : ""
                                }
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value >= 1 && value <= 50) {
                                    handleQuestionCountChange(value);
                                  }
                                }}
                                placeholder={
                                  typeof questionCount === "number"
                                    ? questionCount.toString()
                                    : "10"
                                }
                                className="w-20 px-3 py-2 rounded-lg text-sm focus:outline-none"
                                style={{
                                  backgroundColor: "var(--card)",
                                  color: "var(--foreground)",
                                  border: `1px solid var(--border)`,
                                }}
                                autoFocus
                              />
                            </div>
                          )}

                          <div className="text-right">
                            <p
                              className="text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              Selected:{" "}
                              <strong>
                                {questionCount === "all"
                                  ? "All available questions"
                                  : `${questionCount} questions`}
                              </strong>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* translation-direction removed; handled elsewhere */}

                      {item.type === "auto-advance" && (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={handleAutoAdvanceChange}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                            style={{
                              backgroundColor: autoAdvance
                                ? "var(--primary-600)"
                                : "#d1d5db",
                            }}
                            aria-pressed={autoAdvance}
                            aria-label="Toggle auto advance"
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                autoAdvance ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <div className="flex items-center gap-2">
                            <label
                              className="text-sm"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              Delay:
                            </label>
                            <input
                              type="number"
                              min={300}
                              max={5000}
                              step={100}
                              value={autoAdvanceDelayMs}
                              onChange={(e) =>
                                handleAutoAdvanceDelayChange(
                                  parseInt(e.target.value || "1000", 10),
                                )
                              }
                              disabled={!autoAdvance}
                              className="w-24 px-3 py-1.5 rounded-lg text-sm focus:outline-none border"
                              style={{
                                backgroundColor: "var(--card)",
                                color: "var(--foreground)",
                                borderColor: "var(--border)",
                              }}
                              aria-label="Auto-advance delay in milliseconds"
                            />
                            <span
                              className="text-sm"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              ms
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Removed generic select; Theme uses ThemeSwitcher below */}

                      {item.type === "select" && item.label === "Theme" && (
                        <ThemeSwitcher
                          value={
                            themeMode === "Auto"
                              ? "system"
                              : themeMode === "Light"
                                ? "light"
                                : "dark"
                          }
                          onChange={handleThemeSwitch}
                          className="ml-2"
                        />
                      )}

                      {item.type === "cache-info" && (
                        <div className="text-right">
                          {cacheError && (
                            <p
                              className="text-xs mb-1"
                              style={{ color: "var(--danger-600)" }}
                            >
                              {cacheError}
                            </p>
                          )}
                          <button
                            onClick={getCacheInfo}
                            className="text-sm font-medium"
                            style={{ color: "var(--primary-600)" }}
                          >
                            Refresh Info
                          </button>
                        </div>
                      )}

                      {item.type === "cache-refresh" && (
                        <button
                          onClick={refreshAllData}
                          disabled={isRefreshing || !isOnline}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isRefreshing ? "cursor-not-allowed" : ""}`}
                          style={
                            isRefreshing || !isOnline
                              ? { backgroundColor: "#f3f4f6", color: "#9ca3af" }
                              : {
                                  backgroundColor: "var(--primary-100)",
                                  color: "var(--primary-600)",
                                }
                          }
                        >
                          {isRefreshing ? (
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Refreshing...</span>
                            </div>
                          ) : !isOnline ? (
                            "Refresh (offline)"
                          ) : (
                            "Refresh"
                          )}
                        </button>
                      )}

                      {item.type === "cache-clear" && (
                        <button
                          onClick={clearAllCache}
                          disabled={isClearing || !isOnline}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isClearing ? "cursor-not-allowed" : ""}`}
                          style={
                            isClearing || !isOnline
                              ? { backgroundColor: "#f3f4f6", color: "#9ca3af" }
                              : {
                                  backgroundColor: "var(--danger-100)",
                                  color: "var(--danger-600)",
                                }
                          }
                        >
                          {isClearing ? (
                            <div className="flex items-center space-x-2">
                              <Trash2 className="h-4 w-4 animate-pulse" />
                              <span>Clearing...</span>
                            </div>
                          ) : !isOnline ? (
                            "Clear (offline)"
                          ) : (
                            "Clear"
                          )}
                        </button>
                      )}

                      {/* link-type removed along with non-functional sections */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <span
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Changes will take effect immediately
          </span>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[var(--cta-grad-from)] to-[var(--cta-grad-to)] text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
