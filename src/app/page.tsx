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
  const [selectedFamilyCategory, setSelectedFamilyCategory] =
    useState<string>("");
  const [selectedHomeCategory, setSelectedHomeCategory] = useState<string>("");
  const [selectedNatureCategory, setSelectedNatureCategory] =
    useState<string>("");
  const [selectedICTCategory, setSelectedICTCategory] = useState<string>("");
  const [selectedShoppingCategory, setSelectedShoppingCategory] =
    useState<string>("");
  const [selectedEducationCategory, setSelectedEducationCategory] =
    useState<string>("");
  const [selectedWorkCategory, setSelectedWorkCategory] = useState<string>("");

  const { vocabulary, loading, error, fetchVocabulary, clearVocabulary } =
    useVocabulary();
  const {
    quizState,
    settings,
    showTopicSelector,
    handleAnswerSelect,
    handleTypedSubmit,
    nextQuestion,
  resetQuiz,
  goHome,
  startCustomQuiz,
    startQuiz,
    updateTypedAnswer,
    updateTranslationDirection,
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
  setSelectedShoppingCategory("");
  setSelectedEducationCategory("");
  setSelectedWorkCategory("");
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
  setSelectedShoppingCategory("");
  setSelectedEducationCategory("");
  setSelectedWorkCategory("");
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
  setSelectedShoppingCategory("");
  setSelectedEducationCategory("");
  setSelectedWorkCategory("");
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
  setSelectedShoppingCategory("");
  setSelectedEducationCategory("");
  setSelectedWorkCategory("");
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
  setSelectedShoppingCategory("");
  setSelectedEducationCategory("");
  setSelectedWorkCategory("");
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
      setSelectedShoppingCategory("");
  setSelectedEducationCategory("");
  setSelectedWorkCategory("");
      await fetchVocabulary("ict");
      startQuiz("ict");
    } else if (topic === "shopping") {
      // Entire Shopping topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
      setSelectedICTCategory("");
      setSelectedShoppingCategory("");
      setSelectedEducationCategory("");
  setSelectedWorkCategory("");
      await fetchVocabulary("shopping");
      startQuiz("shopping");
    } else if (topic === "education") {
      // Entire Education topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
      setSelectedICTCategory("");
      setSelectedShoppingCategory("");
      setSelectedEducationCategory("");
      setSelectedWorkCategory("");
      await fetchVocabulary("education");
      startQuiz("education");
    } else if (topic === "work") {
      // Entire Work topic requested
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
      setSelectedICTCategory("");
      setSelectedShoppingCategory("");
      setSelectedEducationCategory("");
      setSelectedWorkCategory("");
      await fetchVocabulary("work");
      startQuiz("work");
    } else {
      setSelectedTopic(topic);
      setSelectedFoodCategory("");
      setSelectedBodyCategory("");
      setSelectedFamilyCategory("");
      setSelectedHomeCategory("");
      setSelectedNatureCategory("");
  setSelectedICTCategory("");
  setSelectedShoppingCategory("");
  setSelectedEducationCategory("");
  setSelectedWorkCategory("");
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

  // Handle Shopping subtopic selection
  const handleShoppingSubtopicSelect = async (category: string) => {
    setSelectedShoppingCategory(category);
    await fetchVocabulary("shopping", category);
    startQuiz("shopping");
  };

  // Handle Education subtopic selection
  const handleEducationSubtopicSelect = async (category: string) => {
    setSelectedEducationCategory(category);
    await fetchVocabulary("education", category);
    startQuiz("education");
  };

  // Handle Work subtopic selection
  const handleWorkSubtopicSelect = async (category: string) => {
    setSelectedWorkCategory(category);
    await fetchVocabulary("work", category);
    startQuiz("work");
  };

  // Handle back from food subtopics
  const handleResetQuiz = () => {
    setSelectedTopic("");
    setSelectedFoodCategory("");
    setSelectedBodyCategory("");
    setSelectedFamilyCategory("");
    setSelectedHomeCategory("");
    setSelectedNatureCategory("");
    setSelectedICTCategory("");
    setSelectedShoppingCategory("");
    setSelectedEducationCategory("");
    setSelectedWorkCategory("");
    clearVocabulary();
    goHome();
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
              : selectedTopic === "shopping" && selectedShoppingCategory
                ? `${selectedShoppingCategory} (Shopping)`
              : selectedTopic === "education" && selectedEducationCategory
                ? `${selectedEducationCategory} (Education)`
              : selectedTopic === "work" && selectedWorkCategory
                ? `${selectedWorkCategory} (Work)`
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

  if (error && selectedTopic) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="mb-3 text-lg font-semibold" style={{ color: "var(--danger-600)" }}>
            Failed to load {selectedTopic}.
          </div>
          <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>
            {error}
          </p>
          <button
            className="inline-flex items-center px-5 py-2.5 rounded-lg border"
            style={{ backgroundColor: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            onClick={() => {
              // Try again with a forced refresh
              fetchVocabulary(selectedTopic, undefined, true);
            }}
          >
            Retry
          </button>
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
          } else if (topic === "shopping") {
            await handleShoppingSubtopicSelect(sub);
          } else if (topic === "education") {
            await handleEducationSubtopicSelect(sub);
          } else if (topic === "work") {
            await handleWorkSubtopicSelect(sub);
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
      onNextQuestion={nextQuestion}
      onResetQuiz={handleResetQuiz}
  onRestartQuiz={resetQuiz}
      onUpdateTypedAnswer={updateTypedAnswer}
      isFoodQuiz={
        selectedTopic === "food" ||
        selectedTopic === "body" ||
        selectedTopic === "family" ||
        selectedTopic === "home" ||
  selectedTopic === "nature" ||
  selectedTopic === "ict" ||
  selectedTopic === "shopping" ||
  selectedTopic === "education" ||
  selectedTopic === "work"
      }
    />
  );
};

export default FrenchVocabularyQuiz;
