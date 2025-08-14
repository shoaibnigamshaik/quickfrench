import React, { useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";
import { QuizHeader } from "./QuizHeader";
import { ProgressBar } from "./ui/ProgressBar";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import { TypingInput } from "./ui/TypingInput";
import { QuizResult } from "./QuizResult";
import { QuizState, QuizSettings } from "@/types/quiz";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface QuizGameProps {
  quizState: QuizState;
  settings: QuizSettings;
  onAnswerSelect: (answer: string) => void;
  onTypedSubmit: () => void;
  onNextQuestion: () => void;
  onResetQuiz: () => void;
  onUpdateTypedAnswer: (answer: string) => void;
  isFoodQuiz?: boolean;
}

export const QuizGame = ({
  quizState,
  settings,
  onAnswerSelect,
  onTypedSubmit,
  onNextQuestion,
  onResetQuiz,
  onUpdateTypedAnswer,
  isFoodQuiz = false,
}: QuizGameProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

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

  // Prepare a French voice if available
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const synth = window.speechSynthesis;

    const pickVoice = () => {
      const voices = synth.getVoices?.() || [];
      // Prefer fr-FR, else any fr-*
      const preferred = voices.find((v) => v.lang?.toLowerCase() === "fr-fr");
      const anyFr = voices.find((v) => v.lang?.toLowerCase().startsWith("fr"));
      voiceRef.current = preferred || anyFr || null;
    };

    // Some browsers populate voices asynchronously
    pickVoice();
    if (!voiceRef.current) {
      const handler = () => pickVoice();
      synth.addEventListener?.("voiceschanged", handler);
      // Cleanup
      return () => synth.removeEventListener?.("voiceschanged", handler);
    }
  }, []);

  // Speak a French phrase using Web Speech API
  const speakFrench = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const synth = window.speechSynthesis;
    try {
      // Cancel any ongoing speech
      if (synth.speaking) synth.cancel();

      // Remove gender indicators like (m) or (f) to avoid reading them aloud
      const cleaned = (text || "").replace(/\(\s*[mf]\s*\)/gi, "").replace(/\s{2,}/g, " ").trim();
      const utter = new SpeechSynthesisUtterance(cleaned);
      // Use a cached French voice if available; otherwise set lang
      if (voiceRef.current) utter.voice = voiceRef.current;
      utter.lang = "fr-FR";
      utter.rate = 1;
      utter.pitch = 1;
      synth.speak(utter);
    } catch {
      // no-op
    }
  };

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
  // Set timeout to auto-advance after configured delay
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        onNextQuestion();
        autoAdvanceTimeoutRef.current = null;
  }, settings.autoAdvanceDelayMs ?? 1000);
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
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--primary-600)" }}
          ></div>
          <p style={{ color: "var(--muted-foreground)" }}>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestion];

  return (
  <div className="max-w-4xl mx-auto">
      <QuizHeader
        onResetQuiz={onResetQuiz}
        isFoodQuiz={isFoodQuiz}
      />

      <ProgressBar
        currentQuestion={quizState.currentQuestion}
        totalQuestions={quizState.questions.length}
        streak={quizState.streak}
        score={quizState.score}
      />

      {/* Quiz Card */}
      <div
        className="rounded-3xl shadow-2xl overflow-hidden border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Question */}
        <div
          className="p-5 sm:p-6 text-center"
          style={{
            background:
              "linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))",
          }}
        >
          <div className="inline-flex items-center gap-2">
            <div
              className="text-3xl sm:text-4xl font-bold text-white rounded-2xl py-3 sm:py-4 px-5 sm:px-6 inline-block"
              style={{
                background:
                  "linear-gradient(90deg, var(--section-grad-from), var(--section-grad-to))",
              }}
            >
              {currentQuestion?.word}
            </div>
            {settings.translationDirection === "french-to-english" && (
              <button
                type="button"
                aria-label="Pronounce the French word"
                title="Pronounce"
                onClick={() => speakFrench(currentQuestion?.word || "")}
                className="inline-flex items-center justify-center rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white/70"
                style={{ color: "white" }}
              >
                <Volume2 className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="p-6">
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
              placeholder={
                settings.translationDirection === "french-to-english"
                  ? "Type the English meaning..."
                  : "Tape le mot en français..."
              }
            />
          )}

          {/* Next Button */}
          {quizState.showResult && (
            <QuizResult
              currentQuestion={quizState.currentQuestion}
              totalQuestions={quizState.questions.length}
              onNextQuestion={onNextQuestion}
            />
          )}
        </div>
      </div>
    </div>
  );
};
