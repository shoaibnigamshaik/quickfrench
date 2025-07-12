import { Question, Adjective } from "@/types/quiz";

export const generateQuestions = (
  adjectives: Adjective[],
  questionCount: number | "all"
): Question[] => {
  const shuffled = [...adjectives].sort(() => Math.random() - 0.5);
  const numQuestions = questionCount === "all" ? adjectives.length : Math.min(questionCount, adjectives.length);
  
  return shuffled.slice(0, numQuestions).map((word) => {
    const otherOptions = adjectives
      .filter((adj) => adj.meaning !== word.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((adj) => adj.meaning);

    const options = [word.meaning, ...otherOptions].sort(
      () => Math.random() - 0.5
    );

    return {
      word: word.word,
      correct: word.meaning,
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
