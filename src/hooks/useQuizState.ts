import { useState, useEffect, useCallback } from "react";
import {
  QuizState,
  QuizSettings,
  QuizMode,
  VocabularyItem,
  WrongAnswer,
  TranslationDirection,
} from "@/types/quiz";
import type { Question } from "@/types/quiz";
import {
  generateQuestionsProgressAware,
  generateQuestionsSrs,
  checkTypedAnswer,
  loadQuizSettings,
  shuffleArray,
} from "@/lib/quiz-utils";
import {
  recordAttempt,
  recordSessionComplete,
  getDueFrenchKeys,
} from "@/lib/progress";

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
    hybridRevealed: [],
    // hybridRevealed: track which question indices the user switched to MCQ
  });

  const [settings, setSettings] = useState<QuizSettings>({
    quizMode: "multiple-choice",
    questionCount: 10,
    selectedTopic: "",
    translationDirection: "french-to-english",
    autoAdvance: false,
    autoAdvanceDelayMs: 1000,
    timerEnabled: false,
    timerDurationSec: 30,
    srsReviewMode: undefined,
    srsMaxPerSession: undefined,
    srsNewPerSession: undefined,
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
      autoAdvanceDelayMs: savedSettings.autoAdvanceDelayMs ?? 1000,
      timerEnabled: savedSettings.timerEnabled ?? false,
      timerDurationSec: savedSettings.timerDurationSec ?? 30,
      // SRS toggles (optional): read if present
      srsReviewMode:
        (localStorage.getItem("srsReviewMode") as "true" | "false" | null) ===
        "true"
          ? true
          : undefined,
      srsMaxPerSession: (() => {
        const v = localStorage.getItem("srsMaxPerSession");
        const n = v ? parseInt(v, 10) : NaN;
        return Number.isFinite(n) ? Math.max(5, Math.min(100, n)) : undefined;
      })(),
      srsNewPerSession: (() => {
        const v = localStorage.getItem("srsNewPerSession");
        const n = v ? parseInt(v, 10) : NaN;
        return Number.isFinite(n) ? Math.max(1, Math.min(50, n)) : undefined;
      })(),
    }));
  }, []);

  // Helper to decide SRS usage
  const shouldUseSrs = useCallback((
    explicitFlag: boolean | undefined,
    topicId: string,
    direction: TranslationDirection,
  ): boolean => {
    if (typeof explicitFlag === "boolean") return explicitFlag;
    try {
      const due = getDueFrenchKeys({
        topicId,
        direction,
        now: Date.now(),
      });
      return due.length > 0;
    } catch {
      return false;
    }
  }, []);

  // Build questions for current topic (SRS + progress aware) in one place
  const buildQuestions = useCallback((
    vocab: VocabularyItem[],
    topicId: string,
    cfg: QuizSettings,
  ) => {
    const shuffled = shuffleArray(vocab);
    const nowTs = Date.now();
    const useSrs = shouldUseSrs(cfg.srsReviewMode, topicId, cfg.translationDirection);
    const maxNew =
      typeof cfg.srsNewPerSession === "number" ? cfg.srsNewPerSession : undefined;
    if (useSrs) {
      return generateQuestionsSrs(
        shuffled,
        cfg.questionCount,
        cfg.translationDirection,
        topicId,
        { maxNew, nowTs },
      );
    }
    return generateQuestionsProgressAware(
      shuffled,
      cfg.questionCount,
      cfg.translationDirection,
      topicId,
    );
  }, [shouldUseSrs]);

  // Generate questions when topic or relevant settings change
  useEffect(() => {
    if (settings.selectedTopic && vocabulary.length > 0) {
      const questions = buildQuestions(vocabulary, topic, settings);
      setQuizState((prev) => ({ ...prev, questions }));
    }
  }, [
    settings.selectedTopic,
    vocabulary,
    settings.questionCount,
    settings.translationDirection,
    topic,
    settings.srsReviewMode,
    settings.srsNewPerSession,
    buildQuestions,
    settings,
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
      // Persist progress (topic is from hook param; question.word is the prompt, map to FR word depending on direction)
      try {
        const q = prev.questions[prev.currentQuestion];
        const frenchWord =
          settings.translationDirection === "french-to-english"
            ? q.word
            : q.correct; // in EN->FR, the correct answer is the French word
        recordAttempt({
          topicId: topic,
          frenchWord,
          isCorrect,
          direction: settings.translationDirection,
        });
      } catch {}
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
    // Persist progress
    try {
      const q = quizState.questions[quizState.currentQuestion];
      const frenchWord =
        settings.translationDirection === "french-to-english"
          ? q.word
          : q.correct;
      recordAttempt({
        topicId: topic,
        frenchWord,
        isCorrect,
        direction: settings.translationDirection,
      });
    } catch {}
  };

  const handleIDontKnow = () => {
    if (quizState.showResult) return;

    // Treat as an incorrect answer, record user's attempt if any else a sentinel
    setQuizState((prev) => ({
      ...prev,
      selectedAnswer: prev.typedAnswer?.trim() || "I don't know",
      showResult: true,
      // do not change score
      streak: 0,
      // maxStreak unchanged on wrong answers
      wrongAnswers: [
        ...prev.wrongAnswers,
        {
          question: prev.questions[prev.currentQuestion],
          userAnswer: prev.typedAnswer?.trim() || "I don't know",
          questionIndex: prev.currentQuestion,
        } as WrongAnswer,
      ],
    }));
    // Persist as incorrect
    try {
      const q = quizState.questions[quizState.currentQuestion];
      const frenchWord =
        settings.translationDirection === "french-to-english"
          ? q.word
          : q.correct;
      recordAttempt({
        topicId: topic,
        frenchWord,
        isCorrect: false,
        direction: settings.translationDirection,
      });
    } catch {}
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
      // Mark session complete
      try {
        recordSessionComplete({ topicId: topic });
      } catch {}
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
      hybridRevealed: [],
    }));
    // Rebuild questions with current vocab & settings
    const questions = buildQuestions(vocabulary, topic, settings);
    setQuizState((prev) => ({ ...prev, questions }));
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
      hybridRevealed: [],
    }));
    setSettings((prev) => ({ ...prev, selectedTopic: "" }));
    setShowTopicSelector(true);
  };

  const startQuiz = (topic: string) => {
    setSettings((prev) => ({ ...prev, selectedTopic: topic }));
    setShowTopicSelector(false);
  };

  const startCustomQuiz = (questions: Question[]) => {
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
      questions,
      hybridRevealed: [],
    }));
    setShowTopicSelector(false);
  };

  const updateTypedAnswer = (answer: string) => {
    setQuizState((prev) => ({ ...prev, typedAnswer: answer }));
  };

  const updateQuizMode = (mode: QuizMode) => {
    setSettings((prev) => ({ ...prev, quizMode: mode }));
  };

  // Hybrid specific: user gives up typing and wants MCQ options for current question
  const revealCurrentQuestionOptions = () => {
    setQuizState((prev) => {
      if (prev.hybridRevealed?.includes(prev.currentQuestion)) return prev;
      return {
        ...prev,
        hybridRevealed: [...(prev.hybridRevealed || []), prev.currentQuestion],
        // Clear any partial typed answer when switching to MCQ to reduce confusion
        typedAnswer: "",
        selectedAnswer: "",
      };
    });
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

  const updateAutoAdvanceDelay = (ms: number) => {
    setSettings((prev) => ({
      ...prev,
      autoAdvanceDelayMs: Math.min(Math.max(ms, 300), 5000),
    }));
    localStorage.setItem("autoAdvanceDelayMs", String(ms));
  };

  const updateTimerEnabled = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, timerEnabled: enabled }));
    localStorage.setItem("timerEnabled", String(enabled));
  };

  const updateTimerDuration = (sec: number) => {
    const clamped = Math.min(Math.max(sec, 5), 300);
    setSettings((prev) => ({ ...prev, timerDurationSec: clamped }));
    localStorage.setItem("timerDurationSec", String(clamped));
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
    startCustomQuiz,
    handleIDontKnow,
    updateTypedAnswer,
    updateQuizMode,
    updateQuestionCount,
    updateTranslationDirection,
    updateAutoAdvance,
    updateAutoAdvanceDelay,
    updateTimerEnabled,
    updateTimerDuration,
    revealCurrentQuestionOptions,
  };
};
