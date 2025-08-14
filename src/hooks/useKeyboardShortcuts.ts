import { useEffect } from "react";
import { QuizMode, Question } from "@/types/quiz";

interface UseKeyboardShortcutsProps {
  showTopicSelector: boolean;
  quizComplete: boolean;
  showResult: boolean;
  quizMode: QuizMode;
  typedAnswer: string;
  currentQuestion: number;
  questions: Question[];
  onResetQuiz: () => void;
  onRestartQuiz: () => void;
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
  onRestartQuiz,
  onAnswerSelect,
  onTypedSubmit,
  onNextQuestion,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);

      // ESC to return to topics (when not typing in an input)
      if (e.key === "Escape" && !showTopicSelector && !isEditable) {
        // Reuse reset behavior which parent wires to goHome
        onResetQuiz();
        return;
      }

      // Space or Enter to go to next question (when result is shown)
      if ((e.key === " " || e.key === "Enter") && showResult) {
        e.preventDefault();
        onNextQuestion();
        return;
      }

      // R to restart quiz (allow restart anytime except topic selector)
      // Ignore when typing in an input/textarea/contentEditable
      if (e.key.toLowerCase() === "r" && !showTopicSelector && !isEditable) {
        onRestartQuiz();
        return;
      }

      if (showTopicSelector || quizComplete) return;

      if (quizMode === "multiple-choice") {
        // Number keys 1-4 for multiple choice
        if (
          ["1", "2", "3", "4"].includes(e.key) &&
          !showResult &&
          !isEditable
        ) {
          const index = parseInt(e.key) - 1;
          if (questions[currentQuestion]?.options[index]) {
            onAnswerSelect(questions[currentQuestion].options[index]);
          }
        }
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
    onRestartQuiz,
    onAnswerSelect,
    onTypedSubmit,
    onNextQuestion,
  ]);
};
