import React, { useEffect, useRef } from "react";
import { QuizHeader } from "./QuizHeader";
import { ProgressBar } from "./ProgressBar";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import { TypingInput } from "./TypingInput";
import { QuizResult } from "./QuizResult";
import { QuizState, QuizSettings, Topic } from "@/types/quiz";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface QuizGameProps {
  quizState: QuizState;
  settings: QuizSettings;
  topics: Topic[];
  onAnswerSelect: (answer: string) => void;
  onTypedSubmit: () => void;
  onNextQuestion: () => void;
  onResetQuiz: () => void;
  onUpdateTypedAnswer: (answer: string) => void;
  isFoodQuiz?: boolean;
  onBackToFoodCategories?: () => void;
}

export const QuizGame = ({
  quizState,
  settings,
  topics,
  onAnswerSelect,
  onTypedSubmit,
  onNextQuestion,
  onResetQuiz,
  onUpdateTypedAnswer,
  isFoodQuiz = false,
  onBackToFoodCategories,
}: QuizGameProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    showTopicSelector: false,
    quizComplete: quizState.quizComplete,
    showResult: quizState.showResult,
    quizMode: settings.quizMode,
    typedAnswer: quizState.typedAnswer,
    currentQuestion: quizState.currentQuestion,
    questions: quizState.questions,
    onResetQuiz,
    onAnswerSelect,
    onTypedSubmit,
    onNextQuestion,
  });

  // Focus input in typing mode
  useEffect(() => {
    if (
      settings.quizMode === "typing" &&
      inputRef.current &&
      !quizState.showResult
    ) {
      inputRef.current.focus();
    }
  }, [quizState.currentQuestion, settings.quizMode, quizState.showResult]);

  // Auto-advance to next question when correct answer is given
  useEffect(() => {
    // Clear any existing timeout
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    // Check if we should auto-advance
    if (
      settings.autoAdvance &&
      quizState.showResult &&
      !quizState.quizComplete &&
      quizState.selectedAnswer ===
        quizState.questions[quizState.currentQuestion]?.correct
    ) {
      // Set timeout to auto-advance after 1 second
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        onNextQuestion();
        autoAdvanceTimeoutRef.current = null;
      }, 1000);
    }

    // Cleanup function to clear timeout if component unmounts or dependencies change
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
    };
  }, [
    settings.autoAdvance,
    quizState.showResult,
    quizState.quizComplete,
    quizState.selectedAnswer,
    quizState.currentQuestion,
    quizState.questions,
    onNextQuestion,
  ]);

  if (quizState.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <QuizHeader
          selectedTopic={settings.selectedTopic}
          topics={topics}
          totalQuestions={quizState.questions.length}
          quizMode={settings.quizMode}
          onResetQuiz={onResetQuiz}
          isFoodQuiz={isFoodQuiz}
          onBackToFoodCategories={onBackToFoodCategories}
        />

        <ProgressBar
          currentQuestion={quizState.currentQuestion}
          totalQuestions={quizState.questions.length}
          streak={quizState.streak}
          score={quizState.score}
        />

        {/* Quiz Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Question */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              What does this mean?
            </h2>
            <div className="text-4xl font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 bg-opacity-30 rounded-2xl py-6 px-8 inline-block">
              {currentQuestion?.word}
            </div>
          </div>

          {/* Options */}
          <div className="p-8">
            {settings.quizMode === "multiple-choice" ? (
              <MultipleChoiceOptions
                question={currentQuestion}
                selectedAnswer={quizState.selectedAnswer}
                showResult={quizState.showResult}
                onAnswerSelect={onAnswerSelect}
              />
            ) : (
              <TypingInput
                typedAnswer={quizState.typedAnswer}
                showResult={quizState.showResult}
                selectedAnswer={quizState.selectedAnswer}
                correctAnswer={currentQuestion.correct}
                onTypedAnswerChange={onUpdateTypedAnswer}
                onSubmit={onTypedSubmit}
                inputRef={inputRef}
              />
            )}

            {/* Next Button */}
            {quizState.showResult && (
              <QuizResult
                quizMode={settings.quizMode}
                selectedAnswer={quizState.selectedAnswer}
                question={currentQuestion}
                currentQuestion={quizState.currentQuestion}
                totalQuestions={quizState.questions.length}
                onNextQuestion={onNextQuestion}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
