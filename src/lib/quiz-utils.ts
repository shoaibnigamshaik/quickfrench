import {
  Question,
  VocabularyItem,
  Adverb,
  TranslationDirection,
} from "@/types/quiz";

export const generateQuestions = (
  vocabulary: VocabularyItem[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english"
): Question[] => {
  const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
  const numQuestions =
    questionCount === "all"
      ? vocabulary.length
      : Math.min(questionCount, vocabulary.length);

  return shuffled.slice(0, numQuestions).map((item) => {
    const isEnglishToFrench = translationDirection === "english-to-french";
    const questionWord = isEnglishToFrench ? item.meaning : item.word;
    const correctAnswer = isEnglishToFrench ? item.word : item.meaning;

    const otherOptions = vocabulary
      .filter((vocabItem) =>
        isEnglishToFrench
          ? vocabItem.word !== item.word
          : vocabItem.meaning !== item.meaning
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((vocabItem) =>
        isEnglishToFrench ? vocabItem.word : vocabItem.meaning
      );

    const options = [correctAnswer, ...otherOptions].sort(
      () => Math.random() - 0.5
    );

    return {
      word: questionWord,
      correct: correctAnswer,
      options: options,
    };
  });
};

// Special function for adverbs that includes category information
export const generateAdverbQuestions = (
  adverbs: Adverb[],
  questionCount: number | "all",
  translationDirection: TranslationDirection = "french-to-english"
): Question[] => {
  const shuffled = [...adverbs].sort(() => Math.random() - 0.5);
  const numQuestions =
    questionCount === "all"
      ? adverbs.length
      : Math.min(questionCount, adverbs.length);

  return shuffled.slice(0, numQuestions).map((adverb) => {
    const isEnglishToFrench = translationDirection === "english-to-french";
    const questionWord = isEnglishToFrench ? adverb.meaning : adverb.word;
    const correctAnswer = isEnglishToFrench ? adverb.word : adverb.meaning;

    // Try to get options from the same category first, then mix with others
    const sameCategoryOptions = adverbs
      .filter(
        (a) =>
          a.category === adverb.category &&
          (isEnglishToFrench
            ? a.word !== adverb.word
            : a.meaning !== adverb.meaning)
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((a) => (isEnglishToFrench ? a.word : a.meaning));

    const otherCategoryOptions = adverbs
      .filter(
        (a) =>
          a.category !== adverb.category &&
          (isEnglishToFrench
            ? a.word !== adverb.word
            : a.meaning !== adverb.meaning)
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 - sameCategoryOptions.length)
      .map((a) => (isEnglishToFrench ? a.word : a.meaning));

    const allOptions = [...sameCategoryOptions, ...otherCategoryOptions];

    // If we don't have enough options, fill with any remaining adverbs
    if (allOptions.length < 3) {
      const remainingOptions = adverbs
        .filter(
          (a) =>
            (isEnglishToFrench
              ? a.word !== adverb.word
              : a.meaning !== adverb.meaning) &&
            !allOptions.includes(isEnglishToFrench ? a.word : a.meaning)
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - allOptions.length)
        .map((a) => (isEnglishToFrench ? a.word : a.meaning));

      allOptions.push(...remainingOptions);
    }

    const options = [correctAnswer, ...allOptions].sort(
      () => Math.random() - 0.5
    );

    return {
      word: questionWord,
      correct: correctAnswer,
      options: options,
    };
  });
};

export const checkTypedAnswer = (correct: string, typed: string): boolean => {
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\([mf]\)/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const normalizedCorrect = normalizeText(correct);
  const normalizedTyped = normalizeText(typed);

  // Check for exact match or close match
  return (
    normalizedCorrect === normalizedTyped ||
    normalizedCorrect.includes(normalizedTyped) ||
    normalizedTyped.includes(normalizedCorrect) ||
    // Handle common variations
    normalizedTyped.replace(/[^a-z]/g, "") ===
      normalizedCorrect.replace(/[^a-z]/g, "")
  );
};

export const getScoreColor = (
  score: number,
  totalQuestions: number
): string => {
  const percentage = (score / totalQuestions) * 100;
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
};

export const getScoreMessage = (
  score: number,
  totalQuestions: number
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
  autoAdvance: boolean = false
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
    "translationDirection"
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
