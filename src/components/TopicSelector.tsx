"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Settings, ChevronRight, Play } from "lucide-react";
import {
  BODY_SUBTOPICS,
  FOOD_SUBTOPICS,
  FAMILY_SUBTOPICS,
  HOME_SUBTOPICS,
  NATURE_SUBTOPICS,
  ICT_SUBTOPICS,
  SHOPPING_SUBTOPICS,
  EDUCATION_SUBTOPICS,
  WORK_SUBTOPICS,
} from "@/data/subtopics";
import { Topic, TranslationDirection } from "@/types/quiz";

interface TopicSelectorProps {
  topics: Topic[];
  translationDirection: TranslationDirection;
  onStartQuiz: (topic: string) => void;
  onStartSubtopic?: (topic: string, subtopic: string) => void;
  onToggleDirection: () => void;
}

const TOPIC_COUNTS: Record<string, number> = {
  adjectives: 96,
  numbers: 27,
  prepositions: 26,
  verbs: 116,
  adverbs: 28,
  food: 183,
  transportation: 101,
  body: 119,
  family: 194,
  home: 240,
  nature: 137,
  ict: 90,
  colours: 17,
  hobbies: 87,
  wardrobe: 66,
  buildings: 60,
  shopping: 72,
  education: 115,
  culture: 30,
  work: 73,
};

export const TopicSelector = ({
  topics,
  translationDirection,
  onStartQuiz,
  onStartSubtopic,
  onToggleDirection,
}: TopicSelectorProps) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("topicSelector:selectedId");
    if (saved) setSelectedId(saved);
  }, []);

  React.useEffect(() => {
    if (selectedId)
      localStorage.setItem("topicSelector:selectedId", selectedId);
  }, [selectedId]);

  const selectedTopic: Topic | null = selectedId
    ? topics.find((t) => t.id === selectedId) || null
    : null;

  const SUBTOPIC_MAP: Record<string, readonly string[]> = {
    food: FOOD_SUBTOPICS,
    body: BODY_SUBTOPICS,
    family: FAMILY_SUBTOPICS,
    home: HOME_SUBTOPICS,
    nature: NATURE_SUBTOPICS,
    ict: ICT_SUBTOPICS,
    shopping: SHOPPING_SUBTOPICS,
    education: EDUCATION_SUBTOPICS,
    work: WORK_SUBTOPICS,
  };

  const hasSubtopics = (id: string) => Boolean(SUBTOPIC_MAP[id]);
  const subtopicsFor = (id: string): readonly string[] =>
    SUBTOPIC_MAP[id] ?? [];

  return (
    <div className="max-w-2xl lg:max-w-5xl w-full mx-auto min-h-[100dvh]">
      <div
        className="rounded-3xl p-6 md:p-7"
        style={{
          backgroundColor: "var(--background)",
        }}
      >
        {/* Header: compact row with brand, toggle, and settings */}
        <div className="mb-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            {/* Left: brand */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))",
                }}
                aria-hidden
              >
                <BookOpen
                  className="h-5 w-5 md:h-6 md:w-6"
                  style={{ color: "white" }}
                />
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                French Quizzes
              </h1>
            </div>

            {/* Right: direction toggle + settings */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={onToggleDirection}
                aria-label={`Toggle translation direction (currently ${
                  translationDirection === "french-to-english"
                    ? "French to English"
                    : "English to French"
                })`}
                title="Toggle translation direction"
                className="inline-flex items-center px-2 py-1 rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-600)]"
                style={{
                  background:
                    "linear-gradient(90deg, var(--badge-grad-from), var(--badge-grad-to))",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {translationDirection === "french-to-english"
                    ? "FR → EN"
                    : "EN → FR"}
                </span>
              </button>
              <Link
                href="/settings"
                aria-label="Settings"
                title="Settings"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:shadow border"
                style={{
                  backgroundColor: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              >
                <Settings
                  className="h-4 w-4"
                  style={{ color: "var(--muted-foreground)" }}
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* List column */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
            {/* Scroll only within the topic list on desktop to keep actions in view */}
            <div
              className="lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto lg:overscroll-contain scrollbar-sleek"
              aria-label="Topics list (scrollable)"
              tabIndex={0}
            >
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
                        <span className="flex-1 font-medium text-balance">
                          {topic.name}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{
                            color: "var(--muted-foreground)",
                            borderColor: "var(--border)",
                          }}
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
          </div>

          {/* Details column */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
            {selectedTopic ? (
              <div
                className={`rounded-xl border ${hasSubtopics(selectedTopic.id) ? "p-6" : "p-4"} lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto lg:overscroll-contain scrollbar-sleek`}
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className={`flex items-start justify-between gap-4 ${hasSubtopics(selectedTopic.id) ? "mb-4" : "mb-2"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>
                      {selectedTopic.icon}
                    </span>
                    <div>
                      <h3
                        className="text-2xl font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
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
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <h4
                        className="text-sm font-medium"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Subtopics
                      </h4>
                      <button
                        type="button"
                        aria-label="Start quiz for entire topic"
                        onClick={() => onStartQuiz(selectedTopic.id)}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                        title="Quiz entire topic"
                      >
                        <Play className="h-3 w-3" />
                        Entire topic
                      </button>
                    </div>
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
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Select a topic to see details and subtopics.
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="mt-6 p-3 rounded-xl lg:hidden"
          style={{ backgroundColor: "var(--muted)" }}
        >
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Tip: On desktop, click a topic to preview details and subtopics;
            click the play button to start. On mobile, tap to start immediately
            (topics with subtopics will first show choices). Use FR ↔ EN above
            to switch translation direction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopicSelector;
