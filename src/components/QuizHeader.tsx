import { BookOpen } from "lucide-react";
import { Topic, QuizMode } from "@/types/quiz";

interface QuizHeaderProps {
  selectedTopic: string;
  topics: Topic[];
  totalQuestions: number;
  quizMode: QuizMode;
}

export const QuizHeader = ({ selectedTopic, topics, totalQuestions, quizMode }: QuizHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 mb-4">
        <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
        <span className="text-sm font-semibold text-gray-700">
          French {topics.find(t => t.id === selectedTopic)?.name || 'Adjectives'} Quiz ({totalQuestions} questions) -{" "}
          {quizMode === "multiple-choice"
            ? "Multiple Choice"
            : "Fill in the Blank"}
        </span>
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Test Your Knowledge
      </h1>
      <p className="text-gray-600">
        {quizMode === "multiple-choice"
          ? "Use keys 1-4 to select answers quickly"
          : "Type the English meaning of each French word"}
      </p>
    </div>
  );
};
