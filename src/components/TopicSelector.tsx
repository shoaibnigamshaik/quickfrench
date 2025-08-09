import Link from "next/link";
import { BookOpen, Settings } from "lucide-react";
import { Topic, TranslationDirection } from "@/types/quiz";

interface TopicSelectorProps {
  topics: Topic[];
  questionCount: number | "all";
  translationDirection: TranslationDirection;
  onStartQuiz: (topic: string) => void;
}

// Hardcoded topic counts as requested
const TOPIC_COUNTS: Record<string, number> = {
  adjectives: 96,
  numbers: 27,
  prepositions: 26,
  verbs: 116,
  adverbs: 28,
  food: 171,
};

export const TopicSelector = ({
  topics,
  questionCount,
  translationDirection,
  onStartQuiz,
}: TopicSelectorProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="max-w-2xl lg:max-w-5xl w-full">
        <div
          className="rounded-3xl shadow-2xl p-8 text-center border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {/* Settings Button */}
          <div className="flex justify-end mb-4">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 hover:shadow"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <Settings
                className="h-5 w-5"
                style={{ color: "var(--muted-foreground)" }}
              />
            </Link>
          </div>

          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[var(--primary-600)] to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Choose a Topic
            </h1>
            <p className="mb-3" style={{ color: "var(--muted-foreground)" }}>
              Select which French vocabulary you&apos;d like to practice
            </p>
            <div
              className="inline-flex items-center px-4 py-2 rounded-full border"
              style={{
                background:
                  "linear-gradient(90deg, var(--badge-grad-from), var(--badge-grad-to))",
                borderColor: "var(--border)",
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                {translationDirection === "french-to-english"
                  ? "French → English"
                  : "English → French"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topics.map((topic) => {
              const itemCount = TOPIC_COUNTS[topic.id] || 0;
              const isFood = topic.id === "food";

              return (
                <button
                  key={topic.id}
                  onClick={() => onStartQuiz(topic.id)}
                  className={`p-8 bg-gradient-to-r ${topic.color} rounded-2xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-left`}
                >
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{topic.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{topic.name}</h3>
                      <p className="text-blue-100">{topic.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white/90">
                        {itemCount}
                      </div>
                      <div className="text-sm text-blue-100">words</div>
                    </div>
                  </div>
                  <div className="text-sm text-blue-100">
                    <div>
                      •{" "}
                      {isFood
                        ? "Choose from multiple categories"
                        : questionCount === "all"
                          ? "All available questions"
                          : `${questionCount} questions`}{" "}
                      {!isFood && "per quiz"}
                    </div>
                    <div>• Track your progress and streaks</div>
                    <div>• Multiple choice and typing modes</div>
                    {topic.id === "adverbs" && (
                      <div>• Organized by adverb categories</div>
                    )}
                    {isFood && (
                      <div>• Fruits, vegetables, drinks, and more!</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className="mt-8 p-4 rounded-xl"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              💡 <strong>Tip:</strong> Visit Settings to choose quiz mode and
              adjust number of questions per quiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
