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
type WithOptionalCategory = { word: string; meaning: string; category?: string | null };

const generateCategoryAwareQuestions = <T extends WithOptionalCategory>(
  items: T[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => {
  const shuffled = shuffleArray(items);
  const numQuestions =
    questionCount === "all" ? items.length : Math.min(questionCount, items.length);

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
): Question[] => generateCategoryAwareQuestions(adverbs, questionCount, translationDirection);

// Special function for food that includes category information (similar to adverbs)
export const generateFoodQuestions = (
  foods: Food[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(foods, questionCount, translationDirection);

// Special function for family (similar shape as food/body)
export const generateFamilyQuestions = (
  items: FamilyItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Special function for home (category-based similar to family/food)
export const generateHomeQuestions = (
  items: HomeItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Special function for body that may include category information
export const generateBodyQuestions = (
  items: BodyItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(items, questionCount, translationDirection);

export const checkTypedAnswer = (correct: string, typed: string): boolean => {
  // Normalize text: lowercase, strip gender markers (m/f), remove diacritics,
  // drop punctuation, collapse spaces.
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\((?:m|f)\)/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const a = normalizeText(correct);
  const b = normalizeText(typed);

  if (!a || !b) return false;

  // Fast path: exact normalized equality.
  if (a === b) return true;

  // Small Levenshtein distance allowance for minor typos.
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

  const maxLen = Math.max(a.length, b.length);
  // Threshold tuned to be strict: no typos for very short strings,
  // allow 1 edit for medium (<=6), up to 2 for longer.
  const threshold = maxLen <= 3 ? 0 : maxLen <= 6 ? 1 : 2;
  return levenshtein(a, b) <= threshold;
};

// Nature: restrict options to the same category (including null category)
export const generateNatureQuestions = (
  items: NatureItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(items, questionCount, translationDirection);

// ICT: same pattern as nature (category-restricted options)
export const generateICTQuestions = (
  items: ICTItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Buildings: simple (no category) so base generator works fine
export const generateBuildingsQuestions = (
  items: BuildingItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Shopping: category-based, like nature/ict/home/family
export const generateShoppingQuestions = (
  items: ShoppingItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(items, questionCount, translationDirection);

// Education: category-based
export const generateEducationQuestions = (
  items: EducationItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english",
): Question[] => generateCategoryAwareQuestions(items, questionCount, translationDirection);

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
) => {
  localStorage.setItem("quizMode", quizMode);
  localStorage.setItem("questionCount", questionCount.toString());
  localStorage.setItem("translationDirection", translationDirection);
  localStorage.setItem("autoAdvance", autoAdvance.toString());
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

  return {
    quizMode: savedMode || "multiple-choice",
    questionCount:
      savedCount === "all" ? "all" : savedCount ? parseInt(savedCount) : 10,
    translationDirection: savedDirection || "french-to-english",
    autoAdvance: savedAutoAdvance === "true",
  };
};
