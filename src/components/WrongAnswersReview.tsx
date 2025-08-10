import { Home, RotateCcw, X, Check } from "lucide-react";
import { WrongAnswer } from "@/types/quiz";

interface WrongAnswersReviewProps {
  wrongAnswers: WrongAnswer[];
  onBackToSummary: () => void;
  onResetQuiz: () => void;
}

export const WrongAnswersReview = ({
  wrongAnswers,
  onBackToSummary,
  onResetQuiz,
}: WrongAnswersReviewProps) => {
  return (
    <div className="max-w-3xl w-full mx-auto">
      <div
        className="rounded-3xl p-8 border shadow-2xl"
        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Review Wrong Answers
          </h2>
          <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
            You missed {wrongAnswers.length} {wrongAnswers.length === 1 ? "question" : "questions"}.
          </p>
        </div>

        {wrongAnswers.length === 0 ? (
          <div className="text-center py-10" style={{ color: "var(--muted-foreground)" }}>
            Nothing to review. Perfect score!
          </div>
        ) : (
          <div className="space-y-4">
            {wrongAnswers.map((wa, idx) => (
              <div
                key={`${wa.question.word}-${wa.questionIndex}-${idx}`}
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
                      Question {wa.questionIndex + 1}
                    </div>
                    <div className="text-xl font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                      {wa.question.word}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-xl border"
                           style={{ backgroundColor: "var(--danger-50)", borderColor: "var(--danger-600)" }}>
                        <X className="h-4 w-4" style={{ color: "var(--danger-600)" }} />
                        <span className="font-medium" style={{ color: "var(--danger-700)" }}>
                          Your answer: {wa.userAnswer || "(blank)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl border"
                           style={{ backgroundColor: "var(--success-50)", borderColor: "var(--success-600)" }}>
                        <Check className="h-4 w-4" style={{ color: "var(--success-600)" }} />
                        <span className="font-medium" style={{ color: "var(--success-700)" }}>
                          Correct: {wa.question.correct}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onBackToSummary}
            className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold border"
            style={{ backgroundColor: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Back to Summary
          </button>
          <button
            type="button"
            onClick={onResetQuiz}
            className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold text-white shadow-lg"
            style={{ background: "linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))" }}
          >
            <Home className="mr-2 h-5 w-5" /> Return Home
          </button>
        </div>
      </div>
    </div>
  );
};
