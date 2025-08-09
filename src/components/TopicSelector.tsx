"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Settings, ChevronRight, Play } from "lucide-react";
import { BODY_SUBTOPICS, FOOD_SUBTOPICS } from "@/data/subtopics";
import { Topic, TranslationDirection } from "@/types/quiz";

interface TopicSelectorProps {
  topics: Topic[];
  translationDirection: TranslationDirection;
  onStartQuiz: (topic: string) => void;
  onStartSubtopic?: (topic: string, subtopic: string) => void;
}

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
  onStartSubtopic,
}: TopicSelectorProps) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("topicSelector:selectedId");
    if (saved) setSelectedId(saved);
  }, []);

  React.useEffect(() => {
    if (selectedId) localStorage.setItem("topicSelector:selectedId", selectedId);
  }, [selectedId]);

  const selectedTopic: Topic | null = selectedId
    ? topics.find((t) => t.id === selectedId) || null
    : null;

  const hasSubtopics = (id: string) => id === "food" || id === "body";
  const subtopicsFor = (id: string): readonly string[] => {
    if (id === "food") return FOOD_SUBTOPICS;
    if (id === "body") return BODY_SUBTOPICS;
    return [];
  };

  return (
    <div className="min-h-screen flex lg:items-center lg:justify-center p-4 bg-[var(--background)]">
      <div className="max-w-2xl lg:max-w-5xl w-full">
        <div
          className="rounded-3xl shadow-2xl p-8 text-center border"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Settings Button */}
          <div className="flex justify-end mb-4">
            <Link
              href="/settings"
              aria-label="Settings"
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 hover:shadow"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <Settings className="h-5 w-5" style={{ color: "var(--muted-foreground)" }} />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: "linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))",
              }}
            >
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
              Choose a Topic
            </h1>
            <div
              className="inline-flex items-center px-4 py-2 rounded-full border"
              style={{
                background: "linear-gradient(90deg, var(--badge-grad-from), var(--badge-grad-to))",
                borderColor: "var(--border)",
              }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {translationDirection === "french-to-english"
                  ? "French → English"
                  : "English → French"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            {/* List column */}
            <div className="lg:col-span-1">
              <ul
                role="list"
                className="divide-y rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--border)" }}
              >
                {topics.map((topic) => {
                  const itemCount = TOPIC_COUNTS[topic.id];
                  const isSelected = selectedId === topic.id;
                  const _hasSub = hasSubtopics(topic.id);
                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => {
                          const isDesktop =
                            typeof window !== "undefined" &&
                            window.matchMedia &&
                            window.matchMedia("(min-width: 1024px)").matches;
                          if (isDesktop) setSelectedId(topic.id);
                          else {
                            if (_hasSub) setSelectedId(topic.id);
                            else onStartQuiz(topic.id);
                          }
                        }}
                        aria-label={`${topic.name}${_hasSub ? " (has subtopics)" : ""}`}
                        className={`w-full flex items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-600)] ${isSelected ? "bg-[var(--muted)]" : ""}`}
                        style={{ color: "var(--foreground)" }}
                      >
                        <span className="text-2xl" aria-hidden>
                          {topic.icon}
                        </span>
                        {isSelected && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "var(--accent-500)" }}
                            aria-hidden
                          />
                        )}
                        <span className="flex-1 font-medium">{topic.name}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}
                        >
                          {itemCount ?? "—"}
                        </span>
                        {_hasSub && (
                          <ChevronRight
                            className="h-4 w-4"
                            style={{ color: "var(--muted-foreground)" }}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Details column */}
            <div className="lg:col-span-2">
              {selectedTopic ? (
                <div
                  className={`rounded-xl border ${hasSubtopics(selectedTopic.id) ? "p-6" : "p-4"}`}
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className={`flex items-start justify-between gap-4 ${hasSubtopics(selectedTopic.id) ? "mb-4" : "mb-2"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" aria-hidden>
                        {selectedTopic.icon}
                      </span>
                      <div>
                        <h3 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
                          {selectedTopic.name}
                        </h3>
                      </div>
                    </div>
                    {!hasSubtopics(selectedTopic.id) && (
                      <button
                        type="button"
                        aria-label="Start quiz"
                        onClick={() => onStartQuiz(selectedTopic.id)}
                        className="inline-flex items-center justify-center rounded-lg border h-9 w-9"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                        title="Start"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {hasSubtopics(selectedTopic.id) ? (
                    <div>
                      <h4 className="text-sm font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                        Subtopics
                      </h4>
                      <ul
                        role="list"
                        className="divide-y rounded-xl border overflow-hidden"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {subtopicsFor(selectedTopic.id).map((sub) => (
                          <li key={sub}>
                            <button
                              type="button"
                              onClick={() =>
                                onStartSubtopic
                                  ? onStartSubtopic(selectedTopic.id, sub)
                                  : onStartQuiz(selectedTopic.id)
                              }
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-600)]"
                              style={{ color: "var(--foreground)" }}
                              aria-label={`Start ${selectedTopic.name} – ${sub}`}
                            >
                              <span className="text-sm">{sub}</span>
                              <Play
                                className="h-3 w-3"
                                style={{ color: "var(--muted-foreground)" }}
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className="rounded-xl border p-6"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Select a topic to see details and subtopics.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Tip: Use desktop to browse topics with details and subtopics; on mobile, tap a topic to start quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSelector;
