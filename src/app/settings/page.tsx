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
  Timer,
  FastForward,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { resetProgress } from "@/lib/progress";
// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SettingItem {
  id:
    | "theme"
    | "quiz-mode"
    | "timer"
    | "srs-review"
    | "question-count"
    | "auto-advance"
    | "speech";
  icon: LucideIcon;
  label: string;
  description: string;
  type: "select" | "quiz-mode" | "question-count" | "auto-advance" | "speech";
  value?: boolean | string;
  options?: string[];
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsPage = () => {
  // Constants/helpers
  const SPEECH_EVENT = "quickfrench:speechSettingsChanged" as const;
  const dispatchSpeechChanged = () =>
    window.dispatchEvent?.(new CustomEvent(SPEECH_EVENT));
  const setLS = (k: string, v: string) => localStorage.setItem(k, v);

  // Theme: delegate to ThemeSwitcher (single source of truth)
  const [themeDefault, setThemeDefault] = React.useState<
    "light" | "dark" | "system"
  >("system");
  const [themeReady, setThemeReady] = React.useState(false);
  const [quizMode, setQuizMode] = React.useState<"multiple-choice" | "typing">(
    "multiple-choice",
  );
  const [questionCount, setQuestionCount] = React.useState<number | "all">(10);
  const [autoAdvance, setAutoAdvance] = React.useState(false);
  // Store UI in seconds for consistency (0.3–5.0 s), persist as ms in localStorage
  const [autoAdvanceDelaySec, setAutoAdvanceDelaySec] =
    React.useState<number>(1.0);
  const [timerEnabled, setTimerEnabled] = React.useState<boolean>(false);
  const [timerDurationSec, setTimerDurationSec] = React.useState<number>(30);
  const [isSpeechOpen, setIsSpeechOpen] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement | null>(null);

  // Focus trap + ESC close for Speech modal
  React.useEffect(() => {
    if (!isSpeechOpen) return;
    const root = modalRef.current;
    if (!root) return;

    const previouslyFocused = (document.activeElement as HTMLElement | null) || null;
    // Try to focus the first focusable element inside the modal
    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const focusables = Array.from(root.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
      (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
    );
    if (focusables.length > 0) focusables[0].focus();
    else root.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isSpeechOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsSpeechOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (current === first || !root.contains(current)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (current === last || !root.contains(current)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isSpeechOpen]);
  // Spaced repetition controls (persisted locally)
  const [srsReviewMode, setSrsReviewMode] = React.useState<boolean | undefined>(
    undefined,
  );
  const [, setSrsMaxPerSession] = React.useState<number | undefined>(undefined);
  const [srsNewPerSession, setSrsNewPerSession] = React.useState<
    number | undefined
  >(undefined);

  // Speech settings
  const [availableVoices, setAvailableVoices] = React.useState<
    SpeechSynthesisVoice[]
  >([]);
  const [speechVoiceURI, setSpeechVoiceURI] = React.useState<string | null>(
    null,
  );
  const [speechVolume, setSpeechVolume] = React.useState<number>(1);
  const [speechPitch, setSpeechPitch] = React.useState<number>(1);
  const [speechRate, setSpeechRate] = React.useState<number>(1);
  const isFirefoxLike = React.useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    // Basic detection for Firefox/Gecko and Zen-like variants
    return (
      /firefox|gecko|zen\//i.test(ua) && !/chrome|chromium|edg\//i.test(ua)
    );
  }, []);

  // Speech helpers
  const selectedVoice = React.useMemo(
    () => availableVoices.find((v) => v.voiceURI === speechVoiceURI) || null,
    [availableVoices, speechVoiceURI],
  );
  const updateSpeechSetting = (
    key: "speechVolume" | "speechPitch" | "speechRate",
    value: number,
  ) => {
    if (key === "speechVolume") setSpeechVolume(value);
    if (key === "speechPitch") setSpeechPitch(value);
    if (key === "speechRate") setSpeechRate(value);
    setLS(key, String(value));
    dispatchSpeechChanged();
  };
  const testSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance("Bonjour !");
    const voice = selectedVoice;
    if (voice) utter.voice = voice;
    else utter.lang = "fr-FR";
    utter.volume = speechVolume;
    utter.pitch = speechPitch;
    utter.rate = speechRate;
    if (synth.speaking) synth.cancel();
    synth.speak(utter);
  };

  // Cache management removed

  // Load saved settings from localStorage
  React.useEffect(() => {
  // Initialize theme switcher default from storage
  const savedTheme = (localStorage.getItem("theme") || "auto").toLowerCase();
  const initial = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "system";
  setThemeDefault(initial as "light" | "dark" | "system");
  setThemeReady(true);

    const savedMode = localStorage.getItem("quizMode") as
      | "multiple-choice"
      | "typing";
    const savedCount = localStorage.getItem("questionCount");
    const savedAutoAdvance = localStorage.getItem("autoAdvance");
  const savedAutoAdvanceDelay = localStorage.getItem("autoAdvanceDelayMs");
    const savedVoiceURI = localStorage.getItem("speechVoiceURI");
    const savedSrsReview = localStorage.getItem("srsReviewMode");
    const savedSrsMax = localStorage.getItem("srsMaxPerSession");
    const savedSrsNew = localStorage.getItem("srsNewPerSession");
    const savedVol = localStorage.getItem("speechVolume");
    const savedPitch = localStorage.getItem("speechPitch");
    const savedRate = localStorage.getItem("speechRate");
  const savedTimerEnabled = localStorage.getItem("timerEnabled");
  const savedTimerDuration = localStorage.getItem("timerDurationSec");

    if (savedMode) {
      setQuizMode(savedMode);
    }
  if (savedCount) {
      const count = savedCount === "all" ? "all" : parseInt(savedCount);
      setQuestionCount(count);
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
      setAutoAdvanceDelaySec(ms / 1000);
    }

    if (savedVoiceURI) setSpeechVoiceURI(savedVoiceURI);
    if (savedVol)
      setSpeechVolume(Math.min(Math.max(parseFloat(savedVol), 0), 1));
    if (savedPitch)
      setSpeechPitch(Math.min(Math.max(parseFloat(savedPitch), 0), 2));
    if (savedRate)
      setSpeechRate(Math.min(Math.max(parseFloat(savedRate), 0.5), 2));

    if (savedSrsReview === "true") setSrsReviewMode(true);
    if (savedSrsMax && !Number.isNaN(parseInt(savedSrsMax)))
      setSrsMaxPerSession(Math.max(5, Math.min(100, parseInt(savedSrsMax))));
    if (savedSrsNew && !Number.isNaN(parseInt(savedSrsNew)))
      setSrsNewPerSession(Math.max(1, Math.min(50, parseInt(savedSrsNew))));
    if (savedTimerEnabled !== null) setTimerEnabled(savedTimerEnabled === "true");
    if (savedTimerDuration && !Number.isNaN(parseInt(savedTimerDuration))) {
      const secs = Math.min(Math.max(parseInt(savedTimerDuration, 10), 5), 300);
      setTimerDurationSec(secs);
    }
  }, []);

  // Load speech voices with robust cross-browser strategy
  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    const pickInitialFrench = (voices: SpeechSynthesisVoice[]) => {
      if (speechVoiceURI || !voices.length) return;
      // Prefer exact fr-FR, then any fr-*
      const preferred = voices.find(
        (v) => (v.lang || "").toLowerCase() === "fr-fr",
      );
      const anyFr = voices.find((v) =>
        (v.lang || "").toLowerCase().startsWith("fr"),
      );
      const chosen = preferred || anyFr || null;
      if (chosen) {
        setSpeechVoiceURI(chosen.voiceURI);
      }
    };

    const update = (voices: SpeechSynthesisVoice[]) => {
      setAvailableVoices(voices);
      pickInitialFrench(voices);
    };

    const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        const existing = synth.getVoices?.() || [];
        if (existing.length) return resolve(existing);

        let resolved = false;
        const tryResolve = () => {
          if (resolved) return;
          const arr = synth.getVoices?.() || [];
          if (arr.length) {
            resolved = true;
            cleanup();
            resolve(arr);
          }
        };

        const onVoicesChanged = () => tryResolve();
        const interval = setInterval(tryResolve, 250);
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve(synth.getVoices?.() || []);
          }
        }, 5000);
        const cleanup = () => {
          clearInterval(interval);
          clearTimeout(timeout);
          synth.removeEventListener?.("voiceschanged", onVoicesChanged);
        };
        synth.addEventListener?.("voiceschanged", onVoicesChanged);
        tryResolve();
      });
    };

    let disposed = false;
    (async () => {
      const voices = await waitForVoices();
      if (disposed) return;
      update(voices);
    })();

    return () => {
      disposed = true;
    };
  }, [speechVoiceURI]);

  const frenchVoices = React.useMemo(
    () =>
      availableVoices.filter((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        return lang.startsWith("fr") || /fr(ancais|ançais)?|french/.test(name);
      }),
    [availableVoices],
  );

  // Save quiz mode to localStorage when changed
  const handleQuizModeChange = (mode: "multiple-choice" | "typing") => {
    setQuizMode(mode);
    localStorage.setItem("quizMode", mode);
  };

  // Save question count to localStorage when changed
  const handleQuestionCountChange = (count: number | "all") => {
    setQuestionCount(count);
    localStorage.setItem("questionCount", count.toString());
  };


  // Save auto advance to localStorage when changed
  const handleAutoAdvanceChange = () => {
    const newAutoAdvance = !autoAdvance;
    setAutoAdvance(newAutoAdvance);
    localStorage.setItem("autoAdvance", newAutoAdvance.toString());
  };

  const handleAutoAdvanceDelayChangeSec = (sec: number) => {
    const clampedSec = Math.min(Math.max(sec, 0.3), 5.0);
    setAutoAdvanceDelaySec(clampedSec);
    const ms = Math.round(clampedSec * 1000);
    localStorage.setItem("autoAdvanceDelayMs", String(ms));
  };

  const handleTimerToggle = () => {
    const next = !timerEnabled;
    setTimerEnabled(next);
    localStorage.setItem("timerEnabled", String(next));
  };

  const handleTimerDurationChange = (sec: number) => {
    const clamped = Math.min(Math.max(sec, 5), 300);
    setTimerDurationSec(clamped);
    localStorage.setItem("timerDurationSec", String(clamped));
  };

  const settingsSections: SettingSection[] = [
    // Moved Appearance above Quiz Settings
    {
      title: "Appearance",
      items: [
        {
          id: "theme",
          icon: Palette,
          label: "Theme",
          description: "Choose your preferred theme",
          type: "select",
          options: ["Light", "Dark", "Auto"],
        },
      ],
    },
    {
      title: "Quiz Settings",
      items: [
        {
          id: "quiz-mode",
          icon: CheckCircle,
          label: "Quiz Mode",
          description: "Choose how you want to answer questions",
          type: "quiz-mode" as const,
        },
        {
          id: "timer",
          icon: Timer,
          label: "Timer",
          description: "Countdown per question (off by default)",
          type: "auto-advance" as const,
          value: timerEnabled,
        },
        {
          id: "question-count",
          icon: HelpCircle,
          label: "Questions per Quiz",
          description: "Choose how many questions per quiz",
          type: "question-count" as const,
        },
        // Translation Direction control removed; toggle now lives on TopicSelector
        {
          id: "auto-advance",
          icon: FastForward,
          label: "Auto Advance",
          description:
            "Automatically move to next question after correct answer",
          type: "auto-advance" as const,
          value: autoAdvance,
        },
        {
          id: "speech",
          icon: Sliders,
          label: "Speech",
          description: "Choose voice and fine-tune volume, pitch, speed",
          type: "speech" as const,
        },
      ],
    },
    {
      title: "Review Preferences",
      items: [
        {
          id: "srs-review",
          icon: RefreshCw,
          label: "Review (Spaced Repetition)",
          description:
            "Prioritize due items first; fallback to practice when nothing is due",
          type: "auto-advance" as const, // reuse toggle visuals
          value: !!srsReviewMode,
        },
      ],
    },
  ];


  const SliderRow: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
    fillPct: (v: number) => number;
    onChange: (v: number) => void;
    aria: string;
  }> = ({ label, value, min, max, step, format, fillPct, onChange, aria }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          className="text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {label}
        </label>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none"
        style={{
          background: `linear-gradient(90deg, var(--primary-600) 0%, var(--primary-600) ${fillPct(
            value,
          )}%, var(--border) ${fillPct(value)}%)`,
        }}
        aria-label={aria}
      />
    </div>
  );

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
              <span className="sr-only">Back</span>
            </Link>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                Settings
              </h1>
              <p style={{ color: "var(--muted-foreground)" }}>
                Customize your learning experience
              </p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {settingsSections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2
                className="text-xl font-bold pb-2 border-b"
                style={{ color: "var(--foreground)", borderColor: "var(--border)" }}
              >
                {section.title}
              </h2>

              <div className="">
                {section.items.map((item, idx) => (
                  <div
                    key={item.label}
                    className="py-4 grid grid-cols-1 md:grid-cols-2 gap-3"
                    style={
                      idx !== section.items.length - 1
                        ? { borderBottom: "1px solid var(--border)" }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-3">
                      <item.icon
                        className="h-5 w-5 mt-0.5"
                        style={{ color: "var(--muted-foreground)" }}
                      />
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

                    <div className="flex items-center justify-end md:justify-self-end">
                      {item.type === "quiz-mode" && (
                        <RadioGroup
                          value={quizMode}
                          onValueChange={(v) =>
                            handleQuizModeChange(v as "multiple-choice" | "typing")
                          }
                          className="space-y-2"
                        >
                          {[
                            {
                              value: "multiple-choice" as const,
                              label: "Multiple Choice",
                              tips: [
                                "Select from 4 options",
                                "Use keys 1-4 to select",
                                "Space/Enter for next",
                                "R to restart",
                              ],
                            },
                            {
                              value: "typing" as const,
                              label: "Fill in the Blank",
                              tips: [
                                "Type the English meaning",
                                "Type your answer",
                                "Enter to submit",
                                "Space for next question",
                              ],
                            },
                          ].map((opt) => (
                            <div key={opt.value} className="flex items-center gap-2">
                              <RadioGroupItem value={opt.value} />
                              <Label className="text-sm">{opt.label}</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      aria-label={`More info: ${opt.label}`}
                                      className="inline-flex items-center justify-center p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
                                      style={{
                                        color: "var(--muted-foreground)",
                                        outlineColor: "var(--primary-600)",
                                      }}
                                    >
                                      <Info className="h-4 w-4" aria-hidden />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    className="border"
                                    style={{
                                      backgroundColor: "var(--card)",
                                      color: "var(--foreground)",
                                      borderColor: "var(--border)",
                                    }}
                                  >
                                    <div className="font-semibold mb-1">{opt.label}</div>
                                    <ul className="list-disc pl-4 space-y-0.5">
                                      {opt.tips.map((t) => (
                                        <li key={t}>{t}</li>
                                      ))}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {item.type === "question-count" && (
                        <div className="space-y-3 w-full md:w-auto">
                          {/* Segmented control */}
                          <div className="flex flex-wrap gap-2 md:justify-end">
                            {[5, 10, 15, 20].map((count) => (
                              <Button
                                key={count}
                                onClick={() => handleQuestionCountChange(count)}
                                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                                  questionCount === count ? "border" : "border"
                                }`}
                                style={
                                  questionCount === count
                                    ? {
                                        backgroundColor: "transparent",
                                        color: "var(--foreground)",
                                        borderColor: "var(--primary-600)",
                                      }
                                    : {
                                        backgroundColor: "transparent",
                                        color: "var(--foreground)",
                                        borderColor: "var(--border)",
                                      }
                                }
                              >
                                {count}
                              </Button>
                            ))}
                            <Button
                              onClick={() => handleQuestionCountChange("all")}
                              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 border`}
                              style={
                                questionCount === "all"
                                  ? {
                                      backgroundColor: "transparent",
                                      color: "var(--foreground)",
                                      borderColor: "var(--primary-600)",
                                    }
                                  : {
                                      backgroundColor: "transparent",
                                      color: "var(--foreground)",
                                      borderColor: "var(--border)",
                                    }
                              }
                            >
                              All
                            </Button>
                          </div>

                          {/* Always-visible numeric field */}
                          <div className="flex items-center md:justify-end gap-2">
                            <label
                              className="text-sm"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              Or enter a number:
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={
                                typeof questionCount === "number" ? questionCount : 10
                              }
                              onChange={(e) => {
                                const value = parseInt(e.target.value || "10", 10);
                                if (!Number.isNaN(value)) {
                                  const clamped = Math.max(1, Math.min(50, value));
                                  handleQuestionCountChange(clamped);
                                }
                              }}
                              className="w-24 px-3 py-2 rounded-lg text-sm focus:outline-none"
                              style={{
                                backgroundColor: "var(--card)",
                                color: "var(--foreground)",
                                border: `1px solid var(--border)`,
                              }}
                              aria-label="Custom question count"
                            />
                            <span
                              className="text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              (1–50)
                            </span>
                          </div>

                          <div className="text-right">
                            <p
                              className="text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              Selected: {" "}
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
                          {(() => {
                            const isOn =
                              item.label === "Auto Advance"
                                ? autoAdvance
                                : item.label === "Timer"
                                  ? timerEnabled
                                  : !!srsReviewMode;
                            return (
                              <Switch
                                checked={isOn}
                                onCheckedChange={
                                  item.label === "Auto Advance"
                                    ? () => handleAutoAdvanceChange()
                                    : item.label === "Timer"
                                      ? () => handleTimerToggle()
                                      : (v) => {
                                          setSrsReviewMode(v);
                                          localStorage.setItem(
                                            "srsReviewMode",
                                            String(v),
                                          );
                                        }
                                }
                                aria-label={
                                  item.label === "Auto Advance"
                                    ? "Toggle auto advance"
                                    : item.label === "Timer"
                                      ? "Toggle timer"
                                      : "Toggle SRS review mode"
                                }
                              />
                            );
                          })()}
                          {item.id === "auto-advance" ? (
                            <div className="flex items-center gap-2">
                              <label
                                className="text-sm"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                Delay (s):
                              </label>
                              <Input
                                type="number"
                                min={0.3}
                                max={5.0}
                                step={0.1}
                                value={autoAdvanceDelaySec}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value || '1');
                                  if (!Number.isNaN(v)) handleAutoAdvanceDelayChangeSec(v);
                                }}
                                disabled={!autoAdvance}
                                className="w-24"
                                aria-label="Auto-advance delay in seconds"
                                aria-labelledby={`setting-${section.title}-${idx}`}
                              />
                              <span
                                className="text-sm"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                s
                              </span>
                            </div>
                          ) : item.id === "timer" ? (
                            <div className="flex items-center gap-2">
                              <label
                                className="text-sm"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                Seconds:
                              </label>
                              <Input
                                type="number"
                                min={5}
                                max={300}
                                step={5}
                                value={timerDurationSec}
                                onChange={(e) =>
                                  handleTimerDurationChange(
                                    parseInt(e.target.value || '30', 10),
                                  )
                                }
                                disabled={!timerEnabled}
                                className="w-24"
                                aria-label="Timer duration in seconds"
                                aria-labelledby={`setting-${section.title}-${idx}`}
                              />
                              <span
                                className="text-sm"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                s
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <label
                                className="text-sm"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                Max new per quiz:
                              </label>
                              <Input
                                type="number"
                                min={1}
                                max={50}
                                step={1}
                                value={srsNewPerSession ?? 10}
                                onChange={(e) => {
                                  const n = parseInt(e.target.value || "10", 10);
                                  const clamped = Math.max(1, Math.min(50, n));
                                  setSrsNewPerSession(clamped);
                                  localStorage.setItem("srsNewPerSession", String(clamped));
                                }}
                                className="w-24"
                                aria-label="SRS new items per quiz"
                                disabled={!srsReviewMode}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Removed generic select; Theme uses ThemeSwitcher below */}

                      {item.type === "select" && item.label === "Theme" &&
                        themeReady && (
                          <ThemeSwitcher defaultValue={themeDefault} className="ml-2" />
                        )}

                      {/* Cache controls removed */}

                      {item.type === "speech" && (
                        <Button onClick={() => setIsSpeechOpen(true)}>Open</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
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
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                if (
                  confirm("Reset all learning progress? This cannot be undone.")
                ) {
                  resetProgress();
                }
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
                borderColor: "var(--border)",
              }}
            >
              Reset Progress
            </Button>
          </div>
        </div>
      </div>

      {/* Speech Settings Modal */}
      {isSpeechOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    aria-modal
                    role="dialog"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setIsSpeechOpen(false)}
          />

          <div
            className="relative w-full max-w-lg rounded-2xl shadow-2xl border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
            ref={modalRef}
            aria-labelledby="speech-modal-title"
            aria-describedby="speech-modal-desc"
            tabIndex={-1}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <Sliders
                  className="h-5 w-5"
                  style={{ color: "var(--primary-600)" }}
                />
                <h3
                  className="text-lg font-semibold"
                  id="speech-modal-title"
                  style={{ color: "var(--foreground)" }}
                >
                  Speech Settings
                </h3>
              </div>
              <Button
                onClick={() => setIsSpeechOpen(false)}
                className="px-3 py-1.5 rounded-lg text-sm border"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--muted-foreground)",
                  borderColor: "var(--border)",
                }}
                aria-label="Close speech settings"
              >
                Close
              </Button>
            </div>

            {/* Hidden description for screen readers */}
            <p id="speech-modal-desc" className="sr-only">
              Choose a French voice and adjust volume, pitch, and speed. Press Escape to close.
            </p>

            <div className="px-6 py-5 space-y-5">
              {/* Voice picker */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                  id="voice-label"
                >
                  Voice (French only)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Select
                      value={speechVoiceURI ?? undefined}
                      onValueChange={(v) => {
                        setSpeechVoiceURI(v);
                        setLS("speechVoiceURI", v);
                        dispatchSpeechChanged();
                      }}
                    >
                      <SelectTrigger aria-labelledby="voice-label" aria-label="French voice selector">
                        <SelectValue
                          placeholder={
                            selectedVoice
                              ? `${selectedVoice.name} (${selectedVoice.lang})`
                              : frenchVoices.length
                                ? "Choose a French voice"
                                : "No French voices available"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        className="border"
                        style={{
                          backgroundColor: "var(--card)",
                          color: "var(--foreground)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {frenchVoices.map((v) => (
                          <SelectItem key={v.voiceURI} value={v.voiceURI}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate">{v.name}</span>
                              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{v.lang}</span>
                            </div>
                          </SelectItem>
                        ))}
                        {frenchVoices.length === 0 && (
                          <div className="px-3 py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                            No French voices found.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={testSpeak}
                    disabled={frenchVoices.length === 0}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      frenchVoices.length === 0
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                    style={{
                      backgroundColor: "var(--primary-100)",
                      color: "var(--primary-700)",
                      borderColor: "var(--border)",
                    }}
                    aria-disabled={frenchVoices.length === 0}
                  >
                    Test
                  </Button>
                </div>
                {availableVoices.length === 0 && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Loading voices… If none appear, your browser may block or
                    not fully support the Speech Synthesis API (e.g., some
                    Firefox-based browsers require system voices).
                  </p>
                )}
                {availableVoices.length === 0 && isFirefoxLike && (
                  <div
                    className="mt-2 text-xs space-y-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <div>Tip for Firefox/Zen:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Install a French system TTS voice (required by Firefox).
                      </li>
                      <li>
                        Linux: install speech-dispatcher + a French voice (e.g.,
                        espeak-ng + mbrola-fr) then restart Firefox.
                      </li>
                      <li>
                        Windows: Settings → Time & Language → Speech → Manage
                        voices → Add voices → French.
                      </li>
                      <li>
                        macOS: System Settings → Accessibility → Spoken Content
                        → System Voice → Add… → French.
                      </li>
                      <li>
                        Android: Settings → System/Accessibility →
                        Text-to-speech → Install French voice data.
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Sliders */}
              <SliderRow
                label="Volume"
                value={speechVolume}
                min={0}
                max={1}
                step={0.01}
                format={(v) => v.toFixed(2)}
                fillPct={(v) => v * 100}
                onChange={(v) => updateSpeechSetting("speechVolume", v)}
                aria="Speech volume"
              />
              <SliderRow
                label="Pitch"
                value={speechPitch}
                min={0}
                max={2}
                step={0.01}
                format={(v) => v.toFixed(2)}
                fillPct={(v) => (v / 2) * 100}
                onChange={(v) => updateSpeechSetting("speechPitch", v)}
                aria="Speech pitch"
              />
              <SliderRow
                label="Speed"
                value={speechRate}
                min={0.5}
                max={2}
                step={0.01}
                format={(v) => `${v.toFixed(2)}x`}
                fillPct={(v) => ((v - 0.5) / 1.5) * 100}
                onChange={(v) => updateSpeechSetting("speechRate", v)}
                aria="Speech speed"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  onClick={() => {
                    setSpeechVolume(1);
                    setSpeechPitch(1);
                    setSpeechRate(1);
                    setLS("speechVolume", "1");
                    setLS("speechPitch", "1");
                    setLS("speechRate", "1");
                    dispatchSpeechChanged();
                  }}
                  className="border"
                >
                  Reset
                </Button>
                <Button onClick={() => setIsSpeechOpen(false)}>Done</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
