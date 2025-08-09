import Link from "next/link";
import { BookOpen, Settings, ChevronRight } from "lucide-react";
import { Topic, TranslationDirection } from "@/types/quiz";

interface TopicSelectorProps {
  topics: Topic[];
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
  transportation: 101,
  body: 119,
};

export const TopicSelector = ({
  topics,
  translationDirection,
  onStartQuiz,
}: TopicSelectorProps) => {
  return (
    <div className="min-h-screen flex lg:items-center lg:justify-center p-4 bg-[var(--background)]">
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
              aria-label="Settings"
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
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background:
                  "linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))",
              }}
            >
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {topics.map((topic) => {
              const itemCount = TOPIC_COUNTS[topic.id];
              const itemCountDisplay = itemCount ?? "—";
              const hasSubtopics = topic.id === "food" || topic.id === "body";

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onStartQuiz(topic.id)}
                  aria-label={`Start ${topic.name} quiz`}
                  className={`relative p-4 sm:p-5 rounded-xl border transition-all duration-200 transform motion-safe:hover:scale-105 motion-reduce:transition-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] hover:shadow-md group`}
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  {/* subtle topic accent bar */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b ${topic.color}`}
                  />
                  <div className="flex items-center mb-3">
                    <div className="text-3xl mr-3" aria-hidden="true">
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-balance" style={{ color: "var(--muted-foreground)" }}>
                        {topic.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                        {itemCountDisplay}
                      </div>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        items
                      </div>
                    </div>
                  </div>
                  {/* Meta badges removed for a cleaner, less redundant card UI */}
                  {hasSubtopics && (
                    <ChevronRight
                      className="h-5 w-5 absolute right-3 bottom-3 opacity-90 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0.5 transition-all duration-200 pointer-events-none"
                      style={{ color: "var(--muted-foreground)" }}
                      aria-hidden="true"
                    />
                  )}
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
