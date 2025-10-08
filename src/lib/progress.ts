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
  // Spaced repetition scheduling per direction
  srs?: Partial<
    Record<
      DirKey,
      {
        ease: number; // SM-2 ease factor (start ~2.5)
        intervalDays: number; // current interval in days
        dueAt: number; // epoch ms for next review
        reps: number; // consecutive successful reps (resets on lapse)
        lapses: number; // total lapses
      }
    >
  >;
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
  // Day-level streaks: number of consecutive days with >= 1 quiz completed
  daily?: {
    currentStreak: number; // current day streak in days
    bestStreak: number; // best day streak
    lastCompletionDate?: string; // YYYY-MM-DD (local)
    completions?: string[]; // YYYY-MM-DD list of days with >= 1 completion
  };
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
      daily: { currentStreak: 0, bestStreak: 0, completions: [] },
    };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      return {
        version: 1,
        totals: { attempts: 0, correct: 0, sessionsCompleted: 0 },
        topics: {},
        words: {},
        daily: { currentStreak: 0, bestStreak: 0, completions: [] },
      };
    }

    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || parsed.version !== 1) {
      return {
        version: 1,
        totals: { attempts: 0, correct: 0, sessionsCompleted: 0 },
        topics: {},
        words: {},
        daily: { currentStreak: 0, bestStreak: 0, completions: [] },
      };
    }

    // Ensure new fields for older saves
    parsed.daily ||= { currentStreak: 0, bestStreak: 0, completions: [] };
    parsed.daily.completions ||= [];
    return parsed;
  } catch (error) {
    console.error(error);
    return {
      version: 1,
      totals: { attempts: 0, correct: 0, sessionsCompleted: 0 },
      topics: {},
      words: {},
      daily: { currentStreak: 0, bestStreak: 0, completions: [] },
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
      srs: {},
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

  // --- SRS scheduling (SM-2 lite) ---
  try {
    word.srs ||= {};
    const s = (word.srs[dir] ||= {
      ease: 2.5,
      intervalDays: 0,
      dueAt: 0,
      reps: 0,
      lapses: 0,
    });
    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v));

    if (!args.isCorrect) {
      // Lapse: make it due tomorrow, reset reps, decrease ease slightly
      s.lapses += 1;
      s.reps = 0;
      s.ease = clamp(s.ease - 0.2, 1.3, 3.2);
      s.intervalDays = 1;
      s.dueAt = t + 24 * 60 * 60 * 1000;
    } else {
      // Success: increase reps and schedule forward
      s.reps += 1;
      if (s.reps === 1) {
        s.intervalDays = 1; // first successful recall
      } else if (s.reps === 2) {
        s.intervalDays = 6; // second
      } else {
        s.intervalDays = Math.max(1, Math.round(s.intervalDays * s.ease));
      }
      s.ease = clamp(s.ease + 0.1, 1.3, 3.2);
      s.dueAt = t + s.intervalDays * 24 * 60 * 60 * 1000;
    }
  } catch {}

  save(state);
  emitUpdate();
};

// Return normalized keys for words that are due for a given topic+direction
export const getDueFrenchKeys = (args: {
  topicId: string;
  direction: TranslationDirection;
  now?: number;
}): string[] => {
  const state = load();
  const dir: DirKey =
    args.direction === "french-to-english" ? "fr→en" : "en→fr";
  const nowTs = args.now ?? now();
  const out: string[] = [];
  for (const [key, w] of Object.entries(state.words)) {
    if (w.topicId !== args.topicId) continue;
    const s = w.srs?.[dir];
    if (!s) continue;
    if ((s.dueAt || 0) <= nowTs) out.push(key);
  }
  // oldest due first
  out.sort((a, b) => {
    const sa = state.words[a]?.srs?.[dir]?.dueAt || 0;
    const sb = state.words[b]?.srs?.[dir]?.dueAt || 0;
    return sa - sb;
  });
  return out;
};

// Return normalized keys for new words (no attempts in this direction)
export const getNewFrenchKeys = (args: {
  topicId: string;
  direction: TranslationDirection;
  limit?: number;
}): string[] => {
  const state = load();
  const dir: DirKey =
    args.direction === "french-to-english" ? "fr→en" : "en→fr";
  const acc: string[] = [];
  for (const [key, w] of Object.entries(state.words)) {
    if (w.topicId !== args.topicId) continue;
    const d = w.byDirection?.[dir];
    if (!d || (d.attempts || 0) === 0) acc.push(key);
    if (args.limit && acc.length >= args.limit) break;
  }
  return acc;
};

// Convenience: from a french word string -> progress key for a topic
export const makeProgressKey = (topicId: string, frenchWord: string) =>
  `${topicId}::${normalizeFrench(frenchWord)}`;

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

  // Update day-level streak
  try {
    state.daily ||= { currentStreak: 0, bestStreak: 0, completions: [] };
    state.daily.completions ||= [];
    const todayStr = formatLocalDate(new Date());
    const last = state.daily.lastCompletionDate;
    // Track unique completion days
    if (!state.daily.completions.includes(todayStr)) {
      state.daily.completions.push(todayStr);
      state.daily.completions.sort();
      if (state.daily.completions.length > 730) {
        state.daily.completions = state.daily.completions.slice(-730);
      }
    }
    if (last !== todayStr) {
      if (last && isYesterday(last, todayStr)) {
        state.daily.currentStreak = (state.daily.currentStreak || 0) + 1;
      } else {
        // First completion today or broken streak
        state.daily.currentStreak = 1;
      }
      if ((state.daily.currentStreak || 0) > (state.daily.bestStreak || 0)) {
        state.daily.bestStreak = state.daily.currentStreak;
      }
      state.daily.lastCompletionDate = todayStr;
    }
  } catch {}

  save(state);
  emitUpdate();
};

export const getTopicProgress = (topicId: string) => {
  const p = load();
  // Aggregate progress from main topic and all its subtopics
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalLearned = 0;
  let totalMastered = 0;

  // Check main topic
  const mainTopic = p.topics[topicId];
  if (mainTopic) {
    totalAttempts += mainTopic.attempts;
    totalCorrect += mainTopic.correct;
    totalLearned += mainTopic.learnedCount;
    totalMastered += mainTopic.masteredCount;
  }

  // Check all subtopics (topicId::subtopic format)
  for (const [key, stats] of Object.entries(p.topics)) {
    if (key.startsWith(`${topicId}::`)) {
      totalAttempts += stats.attempts;
      totalCorrect += stats.correct;
      totalLearned += stats.learnedCount;
      totalMastered += stats.masteredCount;
    }
  }

  return totalAttempts > 0
    ? {
        attempts: totalAttempts,
        correct: totalCorrect,
        learnedCount: totalLearned,
        masteredCount: totalMastered,
      }
    : { attempts: 0, correct: 0, learnedCount: 0, masteredCount: 0 };
};

export const getTopicSummary = (topicId: string) => {
  const p = load();
  // Aggregate topic stats from main topic and all its subtopics
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalLearned = 0;
  let totalMastered = 0;

  // Check main topic
  const mainTopic = p.topics[topicId];
  if (mainTopic) {
    totalAttempts += mainTopic.attempts;
    totalCorrect += mainTopic.correct;
    totalLearned += mainTopic.learnedCount;
    totalMastered += mainTopic.masteredCount;
  }

  // Check all subtopics (topicId::subtopic format)
  for (const [key, stats] of Object.entries(p.topics)) {
    if (key.startsWith(`${topicId}::`)) {
      totalAttempts += stats.attempts;
      totalCorrect += stats.correct;
      totalLearned += stats.learnedCount;
      totalMastered += stats.masteredCount;
    }
  }

  // Count unique correct words from main topic and subtopics.
  // Words may have separate progress entries for a main topic and its
  // subtopics (e.g. "food::Fruits::pomme" and "food::pomme"). To avoid
  // double-counting the same French word, deduplicate by the normalized
  // French key (the suffix after the last '::' in the progress key).
  const uniqueSet = new Set<string>();
  for (const [key, w] of Object.entries(p.words)) {
    if (w.topicId === topicId || w.topicId.startsWith(`${topicId}::`)) {
      if ((w.correct || 0) > 0) {
        // Extract the normalized French part from the storage key. The key
        // format is '<topicId>::<normalizedFrench>' but topicId itself may
        // contain '::' when it's a subtopic like 'food::Fruits'. So take
        // the substring after the last '::'.
        const idx = key.lastIndexOf("::");
        const frenchNorm = idx >= 0 ? key.substring(idx + 2) : key;
        if (frenchNorm) uniqueSet.add(frenchNorm);
      }
    }
  }
  const uniqueCorrect = uniqueSet.size;

  return {
    attempts: totalAttempts,
    correct: totalCorrect,
    learnedCount: totalLearned,
    masteredCount: totalMastered,
    uniqueCorrect,
  } as const;
};

// Helpers for day streaks
const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));
const formatLocalDate = (d: Date): string => {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const parseDate = (yyyyMmDd: string): Date => {
  const [y, m, d] = yyyyMmDd.split("-").map((s) => parseInt(s, 10));
  const dt = new Date();
  dt.setFullYear(y);
  dt.setMonth((m || 1) - 1);
  dt.setDate(d || 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const isYesterday = (lastDateStr: string, todayStr: string): boolean => {
  try {
    const last = parseDate(lastDateStr);
    const today = parseDate(todayStr);
    const diffMs = today.getTime() - last.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    return (
      diffMs > 0 &&
      diffMs <= oneDay + 1000 &&
      last.getDate() !== today.getDate() &&
      formatLocalDate(new Date(last.getTime() + oneDay)) === todayStr
    );
  } catch {
    return false;
  }
};

export const getDailyStreakSummary = () => {
  const p = load();
  const todayStr =
    typeof window !== "undefined" ? formatLocalDate(new Date()) : undefined;
  const last = p.daily?.lastCompletionDate;
  return {
    currentStreak: p.daily?.currentStreak || 0,
    bestStreak: p.daily?.bestStreak || 0,
    todayCompleted: !!todayStr && last === todayStr,
    lastCompletionDate: last,
  } as const;
};

export const getDailyCompletionDates = (): string[] => {
  const p = load();
  const list = (p.daily?.completions || []).slice();
  list.sort();
  return list;
};

export const getCurrentStreakRange = () => {
  const p = load();
  const last = p.daily?.lastCompletionDate;
  if (!last) return undefined as undefined | { start: string; end: string };
  const set = new Set(p.daily?.completions || []);
  if (!set.has(last)) set.add(last);
  let start = last;
  const end = last;
  while (true) {
    const prev = previousDay(start);
    if (!set.has(prev)) break;
    start = prev;
  }
  return { start, end };
};

const previousDay = (yyyyMmDd: string): string => {
  const d = parseDate(yyyyMmDd);
  d.setDate(d.getDate() - 1);
  return formatLocalDate(d);
};
