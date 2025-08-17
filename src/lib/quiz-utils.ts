import {
  Question,
  VocabularyItem,
  Adverb,
  Food,
  FamilyItem,
  BodyItem,
  HomeItem,
  NatureItem,
  TranslationDirection,
  ICTItem,
  BuildingItem,
  ShoppingItem,
  EducationItem,
  WorkItem,
} from "@/types/quiz";

// Fisher–Yates shuffle (returns a new shuffled copy)
const shuffleArray = <T>(input: T[]): T[] => {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const generateQuestions = (
  vocabulary: VocabularyItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => {
  const shuffled = shuffleArray(vocabulary);
  const numQuestions =
    questionCount === "all"
      ? vocabulary.length
      : Math.min(questionCount, vocabulary.length);

  return shuffled.slice(0, numQuestions).map((item) => {
    const isEnglishToFrench = translationDirection === "english-to-french";
    const questionWord = isEnglishToFrench ? item.meaning : item.word;
    const correctAnswer = isEnglishToFrench ? item.word : item.meaning;

    const otherOptions = shuffleArray(
      vocabulary.filter((vocabItem) =>
        isEnglishToFrench
          ? vocabItem.word !== item.word
          : vocabItem.meaning !== item.meaning,
      ),
    )
      .slice(0, 3)
      .map((vocabItem) =>
        isEnglishToFrench ? vocabItem.word : vocabItem.meaning,
      );

    const options = shuffleArray([correctAnswer, ...otherOptions]);

    return {
      word: questionWord,
      correct: correctAnswer,
      options: options,
    };
  });
};

// DRY helper: category-aware MCQ generator for items shaped like { word, meaning, category? }
type WithOptionalCategory = {
  word: string;
  meaning: string;
  category?: string | null;
};

const generateCategoryAwareQuestions = <T extends WithOptionalCategory>(
  items: T[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => {
  const shuffled = shuffleArray(items);
  const numQuestions =
    questionCount === "all"
      ? items.length
      : Math.min(questionCount, items.length);

  return shuffled.slice(0, numQuestions).map((item) => {
    const isEnglishToFrench = translationDirection === "english-to-french";
    const questionWord = isEnglishToFrench ? item.meaning : item.word;
    const correctAnswer = isEnglishToFrench ? item.word : item.meaning;

    // If category exists (including null), restrict to the same category; otherwise use full set
    const pool =
      "category" in item
        ? items.filter((x) => x.category === item.category)
        : (items as T[]);

    const distractors = shuffleArray(
      pool.filter((x) =>
        isEnglishToFrench ? x.word !== item.word : x.meaning !== item.meaning,
      ),
    )
      .slice(0, 3)
      .map((x) => (isEnglishToFrench ? x.word : x.meaning));

    const options = shuffleArray([correctAnswer, ...distractors]);

    return { word: questionWord, correct: correctAnswer, options };
  });
};

// Special function for adverbs that includes category information
export const generateAdverbQuestions = (
  adverbs: Adverb[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(adverbs, questionCount, translationDirection);

// Special function for food that includes category information (similar to adverbs)
export const generateFoodQuestions = (
  foods: Food[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(foods, questionCount, translationDirection);

// Special function for family (similar shape as food/body)
export const generateFamilyQuestions = (
  items: FamilyItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Special function for home (category-based similar to family/food)
export const generateHomeQuestions = (
  items: HomeItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Special function for body that may include category information
export const generateBodyQuestions = (
  items: BodyItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

export const checkTypedAnswer = (correct: string, typed: string): boolean => {
  // Normalize text: lowercase, strip gender markers (m/f), remove diacritics,
  // drop punctuation, collapse spaces.
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
  // Remove common gender markers like (m), (f), (mpl), (fpl)
  .replace(/\(\s*(?:m|f|mpl|fpl)\s*\)/gi, "")
  // Also strip standalone tokens 'mpl' or 'fpl' if they appear outside parentheses
  .replace(/\b(?:mpl|fpl)\b/gi, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Extract possible alternatives from the correct answer. Supports:
  // - Entire string separated by '/', ',', '|', or ' or '
  // - Parenthetical alternatives like "(corridor / hallway)"
  const extractAlternatives = (text: string): string[] => {
    const alts: string[] = [];

    // Collect parenthetical content
    const parenMatches = Array.from(text.matchAll(/\(([^)]*)\)/g));
    for (const match of parenMatches) {
      const inside = match[1];
      if (inside) alts.push(inside);
    }

    // Base text with parentheticals removed (could itself be a candidate)
    const base = text.replace(/\([^)]*\)/g, " ");
    if (base.trim()) alts.push(base);

    // If no parentheses at all, use original text as candidate
    if (alts.length === 0) alts.push(text);

    // Split all candidates by common separators to yield final atomic options
    const splitOn = /\s*(?:\/|,|\||;|\bor\b)\s*/i;
    const expanded = alts
      .flatMap((s) => s.split(splitOn))
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Deduplicate while preserving order
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const s of expanded) {
      const n = normalizeText(s);
      if (!n) continue;
      if (!seen.has(n)) {
        seen.add(n);
        unique.push(n);
      }
    }
    return unique.length ? unique : [normalizeText(text)];
  };

  const typedNorm = normalizeText(typed);
  if (!typedNorm) return false;

  const candidates = extractAlternatives(correct);

  // Fast path: exact match to any candidate
  if (candidates.some((c) => c === typedNorm)) return true;

  // Small Levenshtein distance allowance for minor typos against any candidate.
  const levenshtein = (s: string, t: string): number => {
    if (s === t) return 0;
    const n = s.length;
    const m = t.length;
    if (n === 0) return m;
    if (m === 0) return n;

    const v0 = new Array(m + 1);
    const v1 = new Array(m + 1);
    for (let i = 0; i <= m; i++) v0[i] = i;

    for (let i = 0; i < n; i++) {
      v1[0] = i + 1;
      const si = s.charCodeAt(i);
      for (let j = 0; j < m; j++) {
        const cost = si === t.charCodeAt(j) ? 0 : 1;
        v1[j + 1] = Math.min(
          v1[j] + 1, // insertion
          v0[j + 1] + 1, // deletion
          v0[j] + cost, // substitution
        );
      }
      for (let j = 0; j <= m; j++) v0[j] = v1[j];
    }
    return v0[m];
  };

  // Determine threshold against the closest candidate length
  const closestLen = candidates.reduce(
    (min, c) => Math.min(min, Math.max(c.length, typedNorm.length)),
    Infinity,
  );
  const threshold = closestLen <= 3 ? 0 : closestLen <= 6 ? 1 : 2;
  return candidates.some((c) => levenshtein(c, typedNorm) <= threshold);
};

// Nature: restrict options to the same category (including null category)
export const generateNatureQuestions = (
  items: NatureItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

// ICT: same pattern as nature (category-restricted options)
export const generateICTQuestions = (
  items: ICTItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Buildings: simple (no category) so base generator works fine
export const generateBuildingsQuestions = (
  items: BuildingItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Shopping: category-based, like nature/ict/home/family
export const generateShoppingQuestions = (
  items: ShoppingItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Education: category-based
export const generateEducationQuestions = (
  items: EducationItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Work: category-based
export const generateWorkQuestions = (
  items: WorkItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] =>
  generateCategoryAwareQuestions(items, questionCount, translationDirection);

export const getScoreColor = (
  score: number,
  totalQuestions: number,
): string => {
  const percentage = (score / totalQuestions) * 100;
  if (percentage >= 80) return "text-[var(--success-600)]";
  if (percentage >= 60) return "text-[var(--warning-600)]";
  return "text-[var(--danger-600)]";
};

export const getScoreMessage = (
  score: number,
  totalQuestions: number,
): string => {
  const percentage = (score / totalQuestions) * 100;
  if (percentage >= 80) return "Excellent!";
  if (percentage >= 60) return "Good job!";
  return "Keep practicing!";
};

export const saveQuizSettings = (
  quizMode: "multiple-choice" | "typing",
  questionCount: number | "all",
  translationDirection: TranslationDirection,
  autoAdvance: boolean = false,
  autoAdvanceDelayMs?: number,
) => {
  localStorage.setItem("quizMode", quizMode);
  localStorage.setItem("questionCount", questionCount.toString());
  localStorage.setItem("translationDirection", translationDirection);
  localStorage.setItem("autoAdvance", autoAdvance.toString());
  if (typeof autoAdvanceDelayMs === "number") {
    localStorage.setItem("autoAdvanceDelayMs", String(autoAdvanceDelayMs));
  }
};

export const loadQuizSettings = () => {
  const savedMode = localStorage.getItem("quizMode") as
    | "multiple-choice"
    | "typing"
    | null;
  const savedCount = localStorage.getItem("questionCount");
  const savedDirection = localStorage.getItem(
    "translationDirection",
  ) as TranslationDirection | null;
  const savedAutoAdvance = localStorage.getItem("autoAdvance");
  const savedAutoAdvanceDelay = localStorage.getItem("autoAdvanceDelayMs");

  const parseCount = (val: string | null): number | "all" => {
    if (val === "all") return "all";
    if (!val) return 10;
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) return 10;
    // Clamp to reasonable bounds
    return Math.min(Math.max(n, 1), 50);
  };

  return {
    quizMode: savedMode || "multiple-choice",
    questionCount: parseCount(savedCount),
    translationDirection: savedDirection || "french-to-english",
    autoAdvance: savedAutoAdvance === "true",
    autoAdvanceDelayMs:
      savedAutoAdvanceDelay && !Number.isNaN(parseInt(savedAutoAdvanceDelay))
        ? Math.min(Math.max(parseInt(savedAutoAdvanceDelay, 10), 300), 5000)
        : 1000,
  };
};
