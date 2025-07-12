"use client";

import React from "react";
import { TopicSelector } from "@/components/TopicSelector";
import { QuizGame } from "@/components/QuizGame";
import { QuizComplete } from "@/components/QuizComplete";
import { useAdjectives } from "@/hooks/useAdjectives";
import { useQuizState } from "@/hooks/useQuizState";
import { topics } from "@/data/topics";

const FrenchAdjectivesQuiz = () => {
  const { adjectives, loading } = useAdjectives();
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
  } = useQuizState(adjectives);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showTopicSelector) {
    return (
      <TopicSelector
        topics={topics}
        questionCount={settings.questionCount}
        onStartQuiz={startQuiz}
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
        onResetQuiz={resetQuiz}
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
      onResetQuiz={resetQuiz}
      onUpdateTypedAnswer={updateTypedAnswer}
    />
  );
};

export default FrenchAdjectivesQuiz;
