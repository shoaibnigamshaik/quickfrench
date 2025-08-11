"use client";

import React, { useState } from "react";
import { TopicSelector } from "@/components/TopicSelector";
import { QuizGame } from "@/components/QuizGame";
import { QuizComplete } from "@/components/QuizComplete";
import { WrongAnswersReview } from "@/components/WrongAnswersReview";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useQuizState } from "@/hooks/useQuizState";
import { topics } from "@/data/topics";

const FrenchVocabularyQuiz = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>("");
  const [selectedBodyCategory, setSelectedBodyCategory] = useState<string>("");
  const [selectedFamilyCategory, setSelectedFamilyCategory] =
    useState<string>("");
  const [selectedHomeCategory, setSelectedHomeCategory] = useState<string>("");
  const [selectedNatureCategory, setSelectedNatureCategory] =
    useState<string>("");
  const [selectedICTCategory, setSelectedICTCategory] = useState<string>("");

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

  const [showReview, setShowReview] = useState(false);

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
    if (topic === "food") {
      // Entire Food topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
  setSelectedICTCategory("");
      await fetchVocabulary("food");
      startQuiz("food");
    } else if (topic === "body") {
      // Entire Body topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
  setSelectedICTCategory("");
      await fetchVocabulary("body");
      startQuiz("body");
    } else if (topic === "family") {
      // Entire Family topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
  setSelectedICTCategory("");
      await fetchVocabulary("family");
      startQuiz("family");
    } else if (topic === "home") {
      // Entire Home topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
  setSelectedICTCategory("");
      await fetchVocabulary("home");
      startQuiz("home");
    } else if (topic === "nature") {
      // Entire Nature topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
      setSelectedICTCategory("");
      await fetchVocabulary("nature");
      startQuiz("nature");
    } else if (topic === "ict") {
      // Entire ICT topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
      setSelectedICTCategory("");
      await fetchVocabulary("ict");
      startQuiz("ict");
    } else {
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
      setSelectedICTCategory("");
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

  // Handle family subtopic selection
  const handleFamilySubtopicSelect = async (category: string) => {
    setSelectedFamilyCategory(category);
    // Fetch family vocabulary data when starting quiz
    await fetchVocabulary("family", category);
    startQuiz("family");
  };

  // Handle home subtopic selection
  const handleHomeSubtopicSelect = async (category: string) => {
    setSelectedHomeCategory(category);
    await fetchVocabulary("home", category);
    startQuiz("home");
  };

  // Handle nature subtopic selection
  const handleNatureSubtopicSelect = async (category: string) => {
    setSelectedNatureCategory(category);
    await fetchVocabulary("nature", category);
    startQuiz("nature");
  };

  // Handle ICT subtopic selection
  const handleICTSubtopicSelect = async (category: string) => {
    setSelectedICTCategory(category);
    await fetchVocabulary("ict", category);
    startQuiz("ict");
  };

  // Handle back from food subtopics
  const handleResetQuiz = () => {
  setShowReview(false);
    setSelectedTopic("");
    setSelectedFoodCategory("");
    setSelectedBodyCategory("");
    setSelectedFamilyCategory("");
    setSelectedHomeCategory("");
    setSelectedNatureCategory("");
  setSelectedICTCategory("");
    clearVocabulary(); // Clear vocabulary data
    resetQuiz();
  };

  if (loading && selectedTopic) {
    const topicName =
      selectedTopic === "food" && selectedFoodCategory
        ? `${selectedFoodCategory} (Food)`
        : selectedTopic === "body" && selectedBodyCategory
          ? `${selectedBodyCategory} (Body)`
          : selectedTopic === "family" && selectedFamilyCategory
            ? `${selectedFamilyCategory} (Family)`
            : selectedTopic === "home" && selectedHomeCategory
              ? `${selectedHomeCategory} (Home)`
              : selectedTopic === "nature" && selectedNatureCategory
                ? `${selectedNatureCategory} (Nature)`
              : selectedTopic === "ict" && selectedICTCategory
                ? `${selectedICTCategory} (ICT)`
              : topics.find((t) => t.id === selectedTopic)?.name.toLowerCase();

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
          if (topic === "food") {
            await handleFoodSubtopicSelect(sub);
          } else if (topic === "body") {
            await handleBodySubtopicSelect(sub);
          } else if (topic === "family") {
            await handleFamilySubtopicSelect(sub);
          } else if (topic === "home") {
            await handleHomeSubtopicSelect(sub);
          } else if (topic === "nature") {
            await handleNatureSubtopicSelect(sub);
          } else if (topic === "ict") {
            await handleICTSubtopicSelect(sub);
          }
        }}
      />
    );
  }

  if (quizState.quizComplete) {
    if (showReview) {
      return (
        <WrongAnswersReview
          wrongAnswers={quizState.wrongAnswers}
          onBackToSummary={() => setShowReview(false)}
          onResetQuiz={handleResetQuiz}
        />
      );
    }
    return (
      <QuizComplete
        score={quizState.score}
        totalQuestions={quizState.questions.length}
        maxStreak={quizState.maxStreak}
        onResetQuiz={handleResetQuiz}
        wrongCount={quizState.wrongAnswers.length}
        onReviewWrongAnswers={() => setShowReview(true)}
      />
    );
  }

  return (
    <QuizGame
      quizState={quizState}
      settings={settings}
      onAnswerSelect={handleAnswerSelect}
      onTypedSubmit={handleTypedSubmit}
      onNextQuestion={nextQuestion}
      onResetQuiz={handleResetQuiz}
      onUpdateTypedAnswer={updateTypedAnswer}
      isFoodQuiz={
        selectedTopic === "food" ||
        selectedTopic === "body" ||
        selectedTopic === "family" ||
        selectedTopic === "home" ||
  selectedTopic === "nature" ||
  selectedTopic === "ict"
      }
    />
  );
};

export default FrenchVocabularyQuiz;
