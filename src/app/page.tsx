"use client";

import React, { useState } from "react";
import { TopicSelector } from "@/components/TopicSelector";
import { QuizGame } from "@/components/QuizGame";
import { QuizComplete } from "@/components/QuizComplete";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useQuizState } from "@/hooks/useQuizState";
import { topics } from "@/data/topics";

const FrenchVocabularyQuiz = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>("");
  const [selectedBodyCategory, setSelectedBodyCategory] = useState<string>("");

  const { vocabulary, loading, fetchVocabulary, clearVocabulary } =
    useVocabulary();
  const {
    quizState,
    settings,
    showTopicSelector,
    handleAnswerSelect,
    handleTypedSubmit,
    nextQuestion,
    resetQuiz,
    startQuiz,
    updateTypedAnswer,
    updateTranslationDirection,
  } = useQuizState(vocabulary, selectedTopic);

  // Load translation direction from localStorage and update settings
  React.useEffect(() => {
    const savedDirection = localStorage.getItem("translationDirection") as
      | "french-to-english"
      | "english-to-french";
    if (savedDirection && savedDirection !== settings.translationDirection) {
      updateTranslationDirection(savedDirection);
    }
  }, [settings.translationDirection, updateTranslationDirection]);

  // Handle topic selection
  const handleStartQuiz = async (topic: string) => {
    if (topic === "food" || topic === "body") {
      // Show subtopics within TopicSelector; actual start happens via onStartSubtopic
      setSelectedTopic(topic);
    } else {
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      // Fetch vocabulary data when starting quiz
      await fetchVocabulary(topic);
      startQuiz(topic);
    }
  };

  // Handle food subtopic selection
  const handleFoodSubtopicSelect = async (category: string) => {
    setSelectedFoodCategory(category);
    // Fetch food vocabulary data when starting quiz
    await fetchVocabulary("food", category);
    startQuiz("food");
  };

  // Handle body subtopic selection
  const handleBodySubtopicSelect = async (category: string) => {
    setSelectedBodyCategory(category);
    // Fetch body vocabulary data when starting quiz
    await fetchVocabulary("body", category);
    startQuiz("body");
  };

  // Handle back from food subtopics
  const handleResetQuiz = () => {
    setSelectedTopic("");
    setSelectedFoodCategory("");
    setSelectedBodyCategory("");
    clearVocabulary(); // Clear vocabulary data
    resetQuiz();
  };

  if (loading && selectedTopic) {
    const topicName =
      selectedTopic === "food" && selectedFoodCategory
        ? `${selectedFoodCategory} (Food)`
        : selectedTopic === "body" && selectedBodyCategory
          ? `${selectedBodyCategory} (Body)`
          : topics.find((t) => t.id === selectedTopic)?.name.toLowerCase();

    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
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


  if (showTopicSelector) {
    return (
      <TopicSelector
        topics={topics}
        translationDirection={settings.translationDirection}
        onStartQuiz={handleStartQuiz}
        onStartSubtopic={async (topic, sub) => {
          if (topic === "food") {
            await handleFoodSubtopicSelect(sub);
          } else if (topic === "body") {
            await handleBodySubtopicSelect(sub);
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
        selectedTopic={settings.selectedTopic}
        topics={topics}
        onResetQuiz={handleResetQuiz}
      />
    );
  }

  return (
    <QuizGame
      quizState={quizState}
      settings={settings}
      topics={topics}
      onAnswerSelect={handleAnswerSelect}
      onTypedSubmit={handleTypedSubmit}
      onNextQuestion={nextQuestion}
      onResetQuiz={handleResetQuiz}
      onUpdateTypedAnswer={updateTypedAnswer}
      isFoodQuiz={selectedTopic === "food" || selectedTopic === "body"}
    />
  );
};

export default FrenchVocabularyQuiz;
