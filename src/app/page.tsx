"use client";

import React, { useState } from "react";
import { TopicSelector } from "@/components/TopicSelector";
import { QuizGame } from "@/components/QuizGame";
import { QuizComplete } from "@/components/QuizComplete";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useQuizState } from "@/hooks/useQuizState";
import { topics, SUBTOPIC_TOPICS } from "@/data/topics";
import { Button } from "@/components/ui/button";

const FrenchVocabularyQuiz = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  // DRY: manage subcategory selections via a single state object
  type SubtopicKey = (typeof SUBTOPIC_TOPICS)[number];
  const createInitialSubtopics = (): Record<SubtopicKey, string> =>
    Object.fromEntries(SUBTOPIC_TOPICS.map((t) => [t, ""])) as Record<
      SubtopicKey,
      string
    >;
  const [selectedSubtopics, setSelectedSubtopics] = useState(
    createInitialSubtopics(),
  );

  const { vocabulary, loading, error, fetchVocabulary } = useVocabulary();
  const {
    quizState,
    settings,
    showTopicSelector,
    handleAnswerSelect,
    handleTypedSubmit,
    handleIDontKnow,
    nextQuestion,
    resetQuiz,
    goHome,
    startCustomQuiz,
    startQuiz,
    updateTypedAnswer,
    updateTranslationDirection,
    revealCurrentQuestionOptions,
  } = useQuizState(vocabulary, selectedTopic);

  // Prevent page scroll while selecting topics (desktop UX)
  React.useEffect(() => {
    if (!showTopicSelector) return;
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showTopicSelector]);

  // Load translation direction from localStorage and update settings
  React.useEffect(() => {
    const savedDirection = localStorage.getItem("translationDirection") as
      | "french-to-english"
      | "english-to-french";
    if (savedDirection && savedDirection !== settings.translationDirection) {
      updateTranslationDirection(savedDirection);
    }
  }, [settings.translationDirection, updateTranslationDirection]);

  const handleStartQuiz = async (topic: string) => {
    setSelectedTopic(topic); // keep in sync for loading/error UI + hook param
    await fetchVocabulary(topic);
    startQuiz(topic);
  };

  // Generic subtopic selection handler (DRY)
  const handleSubtopicSelect = async (topic: SubtopicKey, category: string) => {
    const combinedTopicId = `${topic}::${category}`;
    setSelectedTopic(combinedTopicId); // ensure selectedTopic mirrors active quiz topic
    setSelectedSubtopics((prev) => ({ ...prev, [topic]: category }));
    await fetchVocabulary(topic, category);
    startQuiz(combinedTopicId);
  };

  // Handle back from food subtopics
  const handleResetQuiz = () => {
    setSelectedTopic("");
    setSelectedSubtopics(createInitialSubtopics());
    goHome();
  };

  const getTopicDisplayName = () => {
    // Handle combined topicId format for subtopics (e.g., "food::Fruits")
    if (selectedTopic.includes("::")) {
      const [mainTopic, subtopic] = selectedTopic.split("::");
      const label = mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1);
      return `${subtopic} (${label})`;
    }

    if (SUBTOPIC_TOPICS.includes(selectedTopic as SubtopicKey)) {
      const sub = selectedSubtopics[selectedTopic as SubtopicKey];
      if (sub) {
        const label =
          selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1);
        return `${sub} (${label})`;
      }
    }
    return topics.find((t) => t.id === selectedTopic)?.name.toLowerCase();
  };

  if (loading && selectedTopic) {
    const topicName = getTopicDisplayName();

    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--primary-600)" }}
          ></div>
          <p style={{ color: "var(--muted-foreground)" }}>
            Loading {topicName}...
          </p>
        </div>
      </div>
    );
  }

  if (error && selectedTopic) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div
            className="mb-3 text-lg font-semibold"
            style={{ color: "var(--danger-600)" }}
          >
            Failed to load {selectedTopic}.
          </div>
          <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>
            {error}
          </p>
          <Button
            className="inline-flex items-center px-5 py-2.5 rounded-lg border"
            style={{
              backgroundColor: "var(--muted)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            onClick={() => {
              // Try again
              fetchVocabulary(selectedTopic);
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (showTopicSelector) {
    return (
      <TopicSelector
        topics={topics}
        translationDirection={settings.translationDirection}
        onToggleDirection={() => {
          const next =
            settings.translationDirection === "french-to-english"
              ? "english-to-french"
              : "french-to-english";
          localStorage.setItem("translationDirection", next);
          updateTranslationDirection(next);
        }}
        onStartQuiz={handleStartQuiz}
        onStartSubtopic={async (topic, sub) => {
          if (SUBTOPIC_TOPICS.includes(topic as SubtopicKey)) {
            await handleSubtopicSelect(topic as SubtopicKey, sub);
          }
        }}
      />
    );
  }

  if (quizState.quizComplete) {
    return (
      <QuizComplete
        score={quizState.score}
        totalQuestions={quizState.questions.length}
        maxStreak={quizState.maxStreak}
        onReturnHome={handleResetQuiz}
        onRestartQuiz={() => {
          // Restart in place: regenerate questions and reset progress
          // Use the reset function from hook but preserve selectedTopic and fetched vocabulary
          // We can call next handlers to re-start the same topic: use startQuiz with current selectedTopic
          // Easiest: toggle quizComplete false and rely on useQuizState.resetQuiz which now restarts in place
          resetQuiz();
        }}
        wrongCount={quizState.wrongAnswers.length}
        onRetryWrongOnly={() => {
          if (quizState.wrongAnswers.length === 0) return;
          const questions = quizState.wrongAnswers.map((wa) => wa.question);
          startCustomQuiz(questions);
        }}
      />
    );
  }

  return (
    <QuizGame
      quizState={quizState}
      settings={settings}
      onAnswerSelect={handleAnswerSelect}
      onTypedSubmit={handleTypedSubmit}
      onIDontKnow={handleIDontKnow}
      onNextQuestion={nextQuestion}
      onResetQuiz={handleResetQuiz}
      onRestartQuiz={resetQuiz}
      onUpdateTypedAnswer={updateTypedAnswer}
      onRevealHybrid={revealCurrentQuestionOptions}
    />
  );
};

export default FrenchVocabularyQuiz;
