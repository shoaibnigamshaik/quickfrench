import { ArrowLeft, BookOpen } from "lucide-react";
import { Topic, QuizMode } from "@/types/quiz";
import Link from "next/link";

interface QuizHeaderProps {
  selectedTopic: string;
  topics: Topic[];
  totalQuestions: number;
  quizMode: QuizMode;
  onResetQuiz: () => void;
  isFoodQuiz?: boolean;
}

export const QuizHeader = ({
  selectedTopic,
  topics,
  totalQuestions,
  quizMode,
  onResetQuiz,
  isFoodQuiz = false,
}: QuizHeaderProps) => {
  const handleBackClick = () => onResetQuiz();

  return (
    <div className="text-center mb-8 relative">
      {isFoodQuiz ? (
        <button
          onClick={handleBackClick}
          className="absolute top-4 left-0 flex items-center transition-colors duration-200 hover:underline"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-semibold">Back</span>
        </button>
      ) : (
        <Link
          href="/"
          onClick={onResetQuiz}
          className="absolute top-4 left-0 flex items-center transition-colors duration-200"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-semibold">Back</span>
        </Link>
      )}

      <div className="pt-12 space-y-3">
        <div
          className="inline-flex items-center px-5 py-2 rounded-full shadow-sm border"
          style={{
            backgroundColor: "var(--muted)",
            borderColor: "var(--border)",
          }}
        >
          <BookOpen
            className="h-4 w-4 mr-2"
            style={{ color: "var(--primary-600)" }}
          />
          <div
            className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            <span
              className="font-semibold"
              style={{ color: "var(--primary-600)" }}
            >
              French{" "}
            </span>
            <span style={{ color: "var(--muted-foreground)" }}>
              {topics.find((t) => t.id === selectedTopic)?.name || "Adjectives"}
            </span>
            <span className="mx-2" style={{ color: "var(--muted-foreground)" }}>
              •
            </span>
            <span style={{ color: "var(--muted-foreground)" }}>
              {totalQuestions} questions
            </span>
            <span className="mx-2" style={{ color: "var(--muted-foreground)" }}>
              •
            </span>
            <span
              className="font-medium"
              style={{ color: "var(--primary-600)" }}
            >
              {quizMode === "multiple-choice"
                ? "Multiple Choice"
                : "Fill in the Blank"}
            </span>
          </div>
        </div>

        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Translate the Word
          </h1>
        </div>
      </div>
    </div>
  );
};
