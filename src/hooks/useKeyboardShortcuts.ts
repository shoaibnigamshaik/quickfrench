import { useEffect } from "react";
import { QuizMode } from "@/types/quiz";

interface UseKeyboardShortcutsProps {
  showTopicSelector: boolean;
  quizComplete: boolean;
  showResult: boolean;
  quizMode: QuizMode;
  typedAnswer: string;
  currentQuestion: number;
  questions: any[];
  onResetQuiz: () => void;
  onAnswerSelect: (answer: string) => void;
  onTypedSubmit: () => void;
  onNextQuestion: () => void;
}

export const useKeyboardShortcuts = ({
  showTopicSelector,
  quizComplete,
  showResult,
  quizMode,
  typedAnswer,
  currentQuestion,
  questions,
  onResetQuiz,
  onAnswerSelect,
  onTypedSubmit,
  onNextQuestion,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // R to restart quiz (allow restart anytime except topic selector)
      if (e.key.toLowerCase() === "r" && !showTopicSelector) {
        onResetQuiz();
        return;
      }

      if (showTopicSelector || quizComplete) return;

      if (quizMode === "multiple-choice") {
        // Number keys 1-4 for multiple choice
        if (["1", "2", "3", "4"].includes(e.key) && !showResult) {
          const index = parseInt(e.key) - 1;
          if (questions[currentQuestion]?.options[index]) {
            onAnswerSelect(questions[currentQuestion].options[index]);
          }
        }
      } else if (quizMode === "typing") {
        // Enter to submit typed answer
        if (e.key === "Enter" && typedAnswer.trim() && !showResult) {
          onTypedSubmit();
        }
      }

      // Space or Enter to go to next question (when result is shown)
      if ((e.key === " " || e.key === "Enter") && showResult) {
        e.preventDefault();
        onNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    showResult,
    quizComplete,
    currentQuestion,
    questions,
    typedAnswer,
    showTopicSelector,
    quizMode,
    onResetQuiz,
    onAnswerSelect,
    onTypedSubmit,
    onNextQuestion,
  ]);
};
