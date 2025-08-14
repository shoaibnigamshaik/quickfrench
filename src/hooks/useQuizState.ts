import { useState, useEffect } from "react";
import {
  QuizState,
  QuizSettings,
  QuizMode,
  VocabularyItem,
  WrongAnswer,
  Adverb,
  Food,
  BodyItem,
  FamilyItem,
  HomeItem,
  NatureItem,
  ICTItem,
  ShoppingItem,
  EducationItem,
  WorkItem,
  TranslationDirection,
} from "@/types/quiz";
import {
  generateQuestions,
  generateAdverbQuestions,
  generateFoodQuestions,
  generateBodyQuestions,
  generateFamilyQuestions,
  generateHomeQuestions,
  generateNatureQuestions,
  generateICTQuestions,
  generateShoppingQuestions,
  generateEducationQuestions,
  generateWorkQuestions,
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
  wrongAnswers: [],
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
    } else if (topic === "nature") {
        questions = generateNatureQuestions(
      vocabulary as NatureItem[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else if (topic === "ict") {
        // ICT behaves like nature: category-based options
        questions = generateICTQuestions(
          vocabulary as ICTItem[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else if (topic === "shopping") {
        questions = generateShoppingQuestions(
          vocabulary as ShoppingItem[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else if (topic === "education") {
        questions = generateEducationQuestions(
          vocabulary as EducationItem[],
          settings.questionCount,
          settings.translationDirection,
        );
      } else if (topic === "work") {
        questions = generateWorkQuestions(
          vocabulary as WorkItem[],
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
      const updated: QuizState = {
        ...prev,
        selectedAnswer: answer,
        showResult: true,
        score: isCorrect ? prev.score + 1 : prev.score,
        streak: isCorrect ? prev.streak + 1 : 0,
        maxStreak: isCorrect
          ? Math.max(prev.maxStreak, prev.streak + 1)
          : prev.maxStreak,
        wrongAnswers: isCorrect
          ? prev.wrongAnswers
          : [
              ...prev.wrongAnswers,
              {
                question: prev.questions[prev.currentQuestion],
                userAnswer: answer,
                questionIndex: prev.currentQuestion,
              } as WrongAnswer,
            ],
      };
      return updated;
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
      wrongAnswers: isCorrect
        ? prev.wrongAnswers
        : [
            ...prev.wrongAnswers,
            {
              question: prev.questions[prev.currentQuestion],
              userAnswer: prev.typedAnswer,
              questionIndex: prev.currentQuestion,
            } as WrongAnswer,
          ],
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
    // Keep current topic and settings; regenerate questions and reset state
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: 0,
      score: 0,
      selectedAnswer: "",
      showResult: false,
      quizComplete: false,
      streak: 0,
      maxStreak: 0,
      typedAnswer: "",
      wrongAnswers: [],
    }));
    // Trigger regeneration by toggling selectedTopic (noop) to same value, or recompute directly
    // Recompute questions immediately based on current vocabulary, topic, and settings
    // Note: This relies on the latest `vocabulary` and `topic` from hook scope
    let questions;
    if (topic === "adverbs") {
      questions = generateAdverbQuestions(
        (vocabulary as unknown) as Adverb[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "food") {
      questions = generateFoodQuestions(
        (vocabulary as unknown) as Food[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "body") {
      questions = generateBodyQuestions(
        (vocabulary as unknown) as BodyItem[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "family") {
      questions = generateFamilyQuestions(
        (vocabulary as unknown) as FamilyItem[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "home") {
      questions = generateHomeQuestions(
        (vocabulary as unknown) as HomeItem[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "nature") {
      questions = generateNatureQuestions(
        (vocabulary as unknown) as NatureItem[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "ict") {
      questions = generateICTQuestions(
        (vocabulary as unknown) as ICTItem[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "shopping") {
      questions = generateShoppingQuestions(
        (vocabulary as unknown) as ShoppingItem[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "education") {
      questions = generateEducationQuestions(
        (vocabulary as unknown) as EducationItem[],
        settings.questionCount,
        settings.translationDirection,
      );
    } else if (topic === "work") {
      questions = generateWorkQuestions(
        (vocabulary as unknown) as WorkItem[],
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
    // Stay in the quiz view
    setShowTopicSelector(false);
  };

  // Navigate back to the Topic Selector and clear current quiz state
  const goHome = () => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: 0,
      score: 0,
      selectedAnswer: "",
      showResult: false,
      quizComplete: false,
      streak: 0,
      maxStreak: 0,
      typedAnswer: "",
      wrongAnswers: [],
      questions: [],
    }));
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
  goHome,
    startQuiz,
    updateTypedAnswer,
    updateQuizMode,
    updateQuestionCount,
    updateTranslationDirection,
    updateAutoAdvance,
  };
};
