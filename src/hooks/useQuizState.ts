import { useState, useEffect } from "react";
import {
  QuizState,
  QuizSettings,
  QuizMode,
  VocabularyItem,
  Adverb,
  Food,
  BodyItem,
  FamilyItem,
  HomeItem,
  TranslationDirection,
} from "@/types/quiz";
import {
  generateQuestions,
  generateAdverbQuestions,
  generateFoodQuestions,
  generateBodyQuestions,
  generateFamilyQuestions,
  generateHomeQuestions,
  checkTypedAnswer,
  loadQuizSettings,
} from "@/lib/quiz-utils";

export const useQuizState = (vocabulary: VocabularyItem[], topic: string) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    score: 0,
    selectedAnswer: "",
    showResult: false,
    quizComplete: false,
    questions: [],
    streak: 0,
    maxStreak: 0,
    typedAnswer: "",
  });

  const [settings, setSettings] = useState<QuizSettings>({
    quizMode: "multiple-choice",
    questionCount: 10,
    selectedTopic: "",
    translationDirection: "french-to-english",
    autoAdvance: false,
  });

  const [showTopicSelector, setShowTopicSelector] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = loadQuizSettings();
    setSettings((prev) => ({
      ...prev,
      quizMode: savedSettings.quizMode as QuizMode,
      questionCount: savedSettings.questionCount as number | "all",
      translationDirection:
        savedSettings.translationDirection as TranslationDirection,
      autoAdvance: savedSettings.autoAdvance,
    }));
  }, []);

  // Generate questions when topic is selected
  useEffect(() => {
    if (settings.selectedTopic && vocabulary.length > 0) {
      let questions;
      if (topic === "adverbs") {
        questions = generateAdverbQuestions(
          vocabulary as Adverb[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else if (topic === "food") {
        questions = generateFoodQuestions(
          vocabulary as Food[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else if (topic === "body") {
        questions = generateBodyQuestions(
          vocabulary as BodyItem[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else if (topic === "family") {
        questions = generateFamilyQuestions(
          vocabulary as FamilyItem[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else if (topic === "home") {
        questions = generateHomeQuestions(
          vocabulary as HomeItem[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else {
        questions = generateQuestions(
          vocabulary,
          settings.questionCount,
          settings.translationDirection,
        );
      }
      setQuizState((prev) => ({ ...prev, questions }));
    }
  }, [
    settings.selectedTopic,
    vocabulary,
    settings.questionCount,
    settings.translationDirection,
    topic,
  ]);

  const handleAnswerSelect = (answer: string) => {
    if (quizState.showResult) return;

    setQuizState((prev) => {
      const isCorrect = answer === prev.questions[prev.currentQuestion].correct;
      return {
        ...prev,
        selectedAnswer: answer,
        showResult: true,
        score: isCorrect ? prev.score + 1 : prev.score,
        streak: isCorrect ? prev.streak + 1 : 0,
        maxStreak: isCorrect
          ? Math.max(prev.maxStreak, prev.streak + 1)
          : prev.maxStreak,
      };
    });
  };

  const handleTypedSubmit = () => {
    if (quizState.showResult || !quizState.typedAnswer.trim()) return;

    const isCorrect = checkTypedAnswer(
      quizState.questions[quizState.currentQuestion].correct,
      quizState.typedAnswer,
    );

    setQuizState((prev) => ({
      ...prev,
      selectedAnswer: prev.typedAnswer,
      showResult: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      streak: isCorrect ? prev.streak + 1 : 0,
      maxStreak: isCorrect
        ? Math.max(prev.maxStreak, prev.streak + 1)
        : prev.maxStreak,
    }));
  };

  const nextQuestion = () => {
    if (quizState.currentQuestion < quizState.questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: "",
        typedAnswer: "",
        showResult: false,
      }));
    } else {
      setQuizState((prev) => ({ ...prev, quizComplete: true }));
    }
  };

  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      score: 0,
      selectedAnswer: "",
      showResult: false,
      quizComplete: false,
      questions: [],
      streak: 0,
      maxStreak: 0,
      typedAnswer: "",
    });
    setSettings((prev) => ({ ...prev, selectedTopic: "" }));
    setShowTopicSelector(true);
  };

  const startQuiz = (topic: string) => {
    setSettings((prev) => ({ ...prev, selectedTopic: topic }));
    setShowTopicSelector(false);
  };

  const updateTypedAnswer = (answer: string) => {
    setQuizState((prev) => ({ ...prev, typedAnswer: answer }));
  };

  const updateQuizMode = (mode: QuizMode) => {
    setSettings((prev) => ({ ...prev, quizMode: mode }));
  };

  const updateQuestionCount = (count: number | "all") => {
    setSettings((prev) => ({ ...prev, questionCount: count }));
  };

  const updateTranslationDirection = (direction: TranslationDirection) => {
    setSettings((prev) => ({ ...prev, translationDirection: direction }));
  };

  const updateAutoAdvance = (autoAdvance: boolean) => {
    setSettings((prev) => ({ ...prev, autoAdvance }));
  };

  return {
    quizState,
    settings,
    showTopicSelector,
    handleAnswerSelect,
    handleTypedSubmit,
    nextQuestion,
    resetQuiz,
    startQuiz,
    updateTypedAnswer,
    updateQuizMode,
    updateQuestionCount,
    updateTranslationDirection,
    updateAutoAdvance,
  };
};
