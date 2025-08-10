import { ChevronRight } from "lucide-react";
import { checkTypedAnswer } from "@/lib/quiz-utils";
import { Question, QuizMode } from "@/types/quiz";

interface QuizResultProps {
  quizMode: QuizMode;
  selectedAnswer: string;
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  onNextQuestion: () => void;
}

export const QuizResult = ({
  quizMode,
  selectedAnswer,
  question,
  currentQuestion,
  totalQuestions,
  onNextQuestion,
}: QuizResultProps) => {
  const isCorrect =
    quizMode === "multiple-choice"
      ? selectedAnswer === question.correct
      : checkTypedAnswer(question.correct, selectedAnswer);

  return (
    <div className="text-center">
      <div className="mb-6">
        {isCorrect ? (
          <div
            className="font-semibold text-lg"
            style={{ color: "var(--success-600)" }}
          >
            ✓ Correct! Great job!
          </div>
        ) : (
          <div
            className="font-semibold text-lg"
            style={{ color: "var(--danger-600)" }}
          >
            ✗ Incorrect. The correct answer is &quot;{question.correct}&quot;
          </div>
        )}
      </div>
      <div
        className="text-sm mb-4"
        style={{ color: "var(--muted-foreground)" }}
      >
        Press Space or Enter to continue
      </div>
      <button
        onClick={onNextQuestion}
        className="inline-flex items-center px-8 py-4 text-white rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 hover:brightness-110 active:brightness-95 shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
        style={{
          background:
            "linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))",
        }}
      >
        {currentQuestion < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
        <ChevronRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  );
};
