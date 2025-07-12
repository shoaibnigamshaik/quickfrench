import { Question, VocabularyItem, Adverb } from "@/types/quiz";

export const generateQuestions = (
  vocabulary: VocabularyItem[],
  questionCount: number | "all"
): Question[] => {
  const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
  const numQuestions = questionCount === "all" ? vocabulary.length : Math.min(questionCount, vocabulary.length);
  
  return shuffled.slice(0, numQuestions).map((item) => {
    const otherOptions = vocabulary
      .filter((vocabItem) => vocabItem.meaning !== item.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((vocabItem) => vocabItem.meaning);

    const options = [item.meaning, ...otherOptions].sort(
      () => Math.random() - 0.5
    );

    return {
      word: item.word,
      correct: item.meaning,
      options: options,
    };
  });
};

// Special function for adverbs that includes category information
export const generateAdverbQuestions = (
  adverbs: Adverb[],
  questionCount: number | "all"
): Question[] => {
  const shuffled = [...adverbs].sort(() => Math.random() - 0.5);
  const numQuestions = questionCount === "all" ? adverbs.length : Math.min(questionCount, adverbs.length);
  
  return shuffled.slice(0, numQuestions).map((adverb) => {
    // Try to get options from the same category first, then mix with others
    const sameCategoryOptions = adverbs
      .filter((a) => a.category === adverb.category && a.meaning !== adverb.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((a) => a.meaning);

    const otherCategoryOptions = adverbs
      .filter((a) => a.category !== adverb.category && a.meaning !== adverb.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 - sameCategoryOptions.length)
      .map((a) => a.meaning);

    const allOptions = [...sameCategoryOptions, ...otherCategoryOptions];
    
    // If we don't have enough options, fill with any remaining adverbs
    if (allOptions.length < 3) {
      const remainingOptions = adverbs
        .filter((a) => a.meaning !== adverb.meaning && !allOptions.includes(a.meaning))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - allOptions.length)
        .map((a) => a.meaning);
      
      allOptions.push(...remainingOptions);
    }

    const options = [adverb.meaning, ...allOptions].sort(
      () => Math.random() - 0.5
    );

    return {
      word: `${adverb.word} (${adverb.category})`,
      correct: adverb.meaning,
      options: options,
    };
  });
};

export const checkTypedAnswer = (correct: string, typed: string): boolean => {
  const normalizedCorrect = correct.toLowerCase();
  const normalizedTyped = typed.toLowerCase().trim();

  // Check for exact match or close match
  return (
    normalizedCorrect === normalizedTyped ||
    normalizedCorrect.includes(normalizedTyped) ||
    normalizedTyped.includes(normalizedCorrect) ||
    // Handle common variations
    normalizedTyped.replace(/[^a-z]/g, "") === normalizedCorrect.replace(/[^a-z]/g, "")
  );
};

export const getScoreColor = (score: number, totalQuestions: number): string => {
  const percentage = (score / totalQuestions) * 100;
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
};

export const getScoreMessage = (score: number, totalQuestions: number): string => {
  const percentage = (score / totalQuestions) * 100;
  if (percentage >= 80) return "Excellent!";
  if (percentage >= 60) return "Good job!";
  return "Keep practicing!";
};

export const saveQuizSettings = (quizMode: "multiple-choice" | "typing", questionCount: number | "all") => {
  localStorage.setItem('quizMode', quizMode);
  localStorage.setItem('questionCount', questionCount.toString());
};

export const loadQuizSettings = () => {
  const savedMode = localStorage.getItem('quizMode') as "multiple-choice" | "typing" | null;
  const savedCount = localStorage.getItem('questionCount');
  
  return {
    quizMode: savedMode || "multiple-choice",
    questionCount: savedCount === "all" ? "all" : savedCount ? parseInt(savedCount) : 10
  };
};
