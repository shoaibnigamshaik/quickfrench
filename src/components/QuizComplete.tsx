import { Trophy, Home } from "lucide-react";
import { Topic } from "@/types/quiz";
import { getScoreColor, getScoreMessage } from "@/lib/quiz-utils";

interface QuizCompleteProps {
  score: number;
  totalQuestions: number;
  maxStreak: number;
  selectedTopic: string;
  topics: Topic[];
  onResetQuiz: () => void;
}

export const QuizComplete = ({
  score,
  totalQuestions,
  maxStreak,
  selectedTopic,
  topics,
  onResetQuiz,
}: QuizCompleteProps) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-2xl w-full">
        <div
          className="rounded-3xl shadow-2xl p-8 text-center border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[var(--badge-grad-from)] to-[var(--badge-grad-to)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Quiz Complete!
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: "var(--muted)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--primary-600)" }}
              >
                {score}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Correct Answers
              </div>
            </div>
            <div
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: "var(--muted)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--success-600)" }}
              >
                {Math.round((score / totalQuestions) * 100)}%
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Accuracy
              </div>
            </div>
            <div
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: "var(--muted)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--primary-600)" }}
              >
                {maxStreak}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Best Streak
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div
              className={`text-2xl font-bold ${getScoreColor(score, totalQuestions)}`}
            >
              {getScoreMessage(score, totalQuestions)}
            </div>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={onResetQuiz}
                className="inline-flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg text-white bg-gradient-to-r from-[var(--cta-grad-from)] to-[var(--cta-grad-to)]"
              >
                <Home className="mr-2 h-5 w-5" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
