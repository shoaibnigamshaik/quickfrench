// Client-side progress tracking for QuickFrench
// Stores aggregated stats per word and per topic in localStorage.

import type { TranslationDirection } from "@/types/quiz";

const LS_KEY = "quickfrench:progress:v1" as const;
export const PROGRESS_EVENT = "quickfrench:progressUpdated" as const;

type DirKey = "fr→en" | "en→fr";

export interface WordStats {
  attempts: number;
  correct: number;
  consecCorrect: number;
  learned?: boolean;
  mastered?: boolean;
  firstSeenAt: number;
  lastSeenAt: number;
  lastResult?: "correct" | "wrong";
  topicId: string;
  byDirection?: Partial<Record<DirKey, { attempts: number; correct: number }>>;
}

export interface TopicStats {
  attempts: number;
  correct: number;
  learnedCount: number;
  masteredCount: number;
}

export interface ProgressState {
  version: 1;
  totals: {
    attempts: number;
    correct: number;
    sessionsCompleted: number;
    firstSeenAt?: number;
    lastSeenAt?: number;
  };
  topics: Record<string, TopicStats>;
  words: Record<string, WordStats>;
}

const LEARNED_CORRECTS = 3;
const MASTERED_CONSEC = 3;

const now = () => Date.now();

const emitUpdate = () => {
  try {
    window.dispatchEvent?.(new Event(PROGRESS_EVENT));
  } catch {}
};

export const normalizeFrench = (text: string): string => {
  return (
    (text || "")
      .toLowerCase()
      .trim()
      // Remove gender markers like (m), (f), (mpl), (fpl)
      .replace(/\(\s*(?:m|f|mpl|fpl)\s*\)/gi, "")
      // Also strip standalone tokens mpl/fpl if present
      .replace(/\b(?:mpl|fpl)\b/gi, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s*\/\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
};

const load = (): ProgressState => {
  if (typeof window === "undefined") {
    // SSR-safe default
    return {
      version: 1,
      totals: { attempts: 0, correct: 0, sessionsCompleted: 0 },
      topics: {},
      words: {},
    };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) throw new Error("no progress");
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || parsed.version !== 1) throw new Error("bad version");
    return parsed;
  } catch {
    return {
      version: 1,
      totals: { attempts: 0, correct: 0, sessionsCompleted: 0 },
      topics: {},
      words: {},
    };
  }
};

const save = (state: ProgressState) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
};

export const getProgress = (): ProgressState => load();

export const resetProgress = () => {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
  emitUpdate();
};

export const recordAttempt = (args: {
  topicId: string;
  frenchWord: string;
  isCorrect: boolean;
  direction: TranslationDirection;
}) => {
  const dir: DirKey =
    args.direction === "french-to-english" ? "fr→en" : "en→fr";
  const frenchKey = normalizeFrench(args.frenchWord);
  if (!frenchKey || !args.topicId) return;

  const key = `${args.topicId}::${frenchKey}`;
  const state = load();
  const t = now();

  // Init containers
  state.totals.firstSeenAt ||= t;
  state.totals.lastSeenAt = t;
  state.topics[args.topicId] ||= {
    attempts: 0,
    correct: 0,
    learnedCount: 0,
    masteredCount: 0,
  };

  const topicStats = state.topics[args.topicId];
  let word = state.words[key];
  if (!word) {
    word = state.words[key] = {
      attempts: 0,
      correct: 0,
      consecCorrect: 0,
      firstSeenAt: t,
      lastSeenAt: t,
      topicId: args.topicId,
      byDirection: {},
    };
  }

  // Update counts
  state.totals.attempts += 1;
  topicStats.attempts += 1;
  word.attempts += 1;
  word.lastSeenAt = t;
  word.lastResult = args.isCorrect ? "correct" : "wrong";

  // Per-direction
  const dirStats = (word.byDirection![dir] ||= { attempts: 0, correct: 0 });
  dirStats.attempts += 1;

  // Correctness and streaks
  if (args.isCorrect) {
    state.totals.correct += 1;
    topicStats.correct += 1;
    word.correct += 1;
    dirStats.correct += 1;
    word.consecCorrect += 1;
  } else {
    word.consecCorrect = 0;
  }

  // Learned transition
  if (!word.learned && word.correct >= LEARNED_CORRECTS) {
    word.learned = true;
    topicStats.learnedCount += 1;
  }

  // Mastered transition
  if (!word.mastered && word.consecCorrect >= MASTERED_CONSEC) {
    word.mastered = true;
    topicStats.masteredCount += 1;
  }

  save(state);
  emitUpdate();
};

export const recordSessionComplete = (args: { topicId: string }) => {
  const state = load();
  state.totals.sessionsCompleted += 1;
  state.totals.lastSeenAt = now();
  // Touch topic bucket to ensure it exists
  state.topics[args.topicId] ||= {
    attempts: 0,
    correct: 0,
    learnedCount: 0,
    masteredCount: 0,
  };
  save(state);
  emitUpdate();
};

export const getTopicProgress = (topicId: string) => {
  const p = load();
  const t = p.topics[topicId];
  return t || { attempts: 0, correct: 0, learnedCount: 0, masteredCount: 0 };
};
