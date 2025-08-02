import { ArrowLeft, BookOpen } from "lucide-react";
import { Topic, QuizMode } from "@/types/quiz";
import Link from "next/link";

interface QuizHeaderProps {
  selectedTopic: string;
  topics: Topic[];
  totalQuestions: number;
  quizMode: QuizMode;
  onResetQuiz: () => void;
}

export const QuizHeader = ({
  selectedTopic,
  topics,
  totalQuestions,
  quizMode,
  onResetQuiz,
}: QuizHeaderProps) => {
  return (
    <div className="text-center mb-8 relative">
      <Link
        href="/"
        onClick={onResetQuiz}
        className="absolute top-4 left-0 flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span className="font-semibold">Back</span>
      </Link>

      <div className="pt-12 space-y-3">
        <div className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full shadow-sm border border-indigo-100">
          <BookOpen className="h-4 w-4 text-indigo-600 mr-2" />
          <div className="text-sm font-medium text-gray-700">
            <span className="text-indigo-700 font-semibold">French </span>
            <span className="text-gray-600">
              {topics.find((t) => t.id === selectedTopic)?.name || "Adjectives"}
            </span>
            <span className="text-gray-500 mx-2">•</span>
            <span className="text-gray-600">{totalQuestions} questions</span>
            <span className="text-gray-500 mx-2">•</span>
            <span className="text-indigo-600 font-medium">
              {quizMode === "multiple-choice"
                ? "Multiple Choice"
                : "Fill in the Blank"}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Translate the Word
          </h1>
        </div>
      </div>
    </div>
  );
};
