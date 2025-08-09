import Link from "next/link";
import { RotateCcw, Trophy, Settings } from "lucide-react";
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
            <div className="w-20 h-20 bg-gradient-to-r from-[var(--primary-600)] to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Quiz Complete!
            </h1>
            <p style={{ color: "var(--muted-foreground)" }}>
              Great job learning French{" "}
              {topics.find((t) => t.id === selectedTopic)?.name.toLowerCase() ||
                "adjectives"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-gradient-to-r from-[var(--primary-50)] to-indigo-50 rounded-2xl p-6 border"
              style={{ borderColor: "var(--primary-100)" }}
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
              className="bg-gradient-to-r from-[var(--success-50)] to-emerald-50 rounded-2xl p-6 border"
              style={{ borderColor: "var(--success-100)" }}
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
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "#7c3aed" }}
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

          <div className="space-y-4">
            <div
              className={`text-2xl font-bold ${getScoreColor(score, totalQuestions)}`}
            >
              {getScoreMessage(score, totalQuestions)}
            </div>
            <div
              className="text-sm mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              Press R to restart or click the button below
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button
                onClick={onResetQuiz}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[var(--primary-600)] to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Try Again
              </button>
              <Link
                href="/settings"
                className="inline-flex items-center px-8 py-4 border-2 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: "var(--card)",
                  color: "var(--foreground)",
                  borderColor: "var(--border)",
                }}
              >
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
