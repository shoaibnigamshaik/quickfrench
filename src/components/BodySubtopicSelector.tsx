import React from "react";
import { ArrowLeft, HeartPulse } from "lucide-react";
// Static categories per spec

interface BodySubtopicSelectorProps {
  questionCount: number | "all";
  onSelectSubtopic: (category: string) => void;
  onBack: () => void;
}

export const BodySubtopicSelector = ({
  questionCount,
  onSelectSubtopic,
  onBack,
}: BodySubtopicSelectorProps) => {
  const categories = [
    { name: "Body Parts", color: "from-emerald-500 to-teal-600", icon: "🧠" },
    { name: "Diseases", color: "from-rose-500 to-red-600", icon: "🩹" },
    {
      name: "Verbs and Expressions",
      color: "from-indigo-500 to-violet-600",
      icon: "💬",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl w-full">
        <div
          className="rounded-3xl shadow-2xl p-8 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-200 mr-4"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <ArrowLeft
                className="h-5 w-5"
                style={{ color: "var(--muted-foreground)" }}
              />
            </button>
            <div className="flex-1 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-lime-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartPulse className="h-10 w-10 text-white" />
              </div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Choose Subtopic
              </h1>
              <p className="mb-3" style={{ color: "var(--muted-foreground)" }}>
                Select which body/health category you&apos;d like to practice
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => onSelectSubtopic(category.name)}
                className={`p-6 bg-gradient-to-r ${category.color} rounded-2xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-sm text-white/80">
                  Practice terms in {category.name}
                </p>
              </button>
            ))}
          </div>

          <div
            className="mt-8 p-4 rounded-xl"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <p
              className="text-sm text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              💡 <strong>Tip:</strong> Each subtopic contains different French
              body/health vocabulary.
              {questionCount === "all"
                ? " All available questions"
                : ` ${questionCount} questions`}{" "}
              will be selected per quiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
