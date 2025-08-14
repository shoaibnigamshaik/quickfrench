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
  onRestartQuiz: () => void;
  onUpdateTypedAnswer: (answer: string) => void;
}

export const QuizGame = ({
  quizState,
  settings,
  onAnswerSelect,
  onTypedSubmit,
  onNextQuestion,
  onResetQuiz,
  onRestartQuiz,
  onUpdateTypedAnswer,
}: QuizGameProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const [speechVolume, setSpeechVolume] = React.useState<number>(1);
  const [speechPitch, setSpeechPitch] = React.useState<number>(1);
  const [speechRate, setSpeechRate] = React.useState<number>(1);
  const [speechVoiceURI, setSpeechVoiceURI] = React.useState<string | null>(null);

  // Load speech settings from localStorage and listen for changes from Settings modal
  useEffect(() => {
    const load = () => {
      try {
        const vol = parseFloat(localStorage.getItem("speechVolume") || "1");
        const pitch = parseFloat(localStorage.getItem("speechPitch") || "1");
        const rate = parseFloat(localStorage.getItem("speechRate") || "1");
        const uri = localStorage.getItem("speechVoiceURI");
        if (!Number.isNaN(vol)) setSpeechVolume(Math.min(Math.max(vol, 0), 1));
        if (!Number.isNaN(pitch)) setSpeechPitch(Math.min(Math.max(pitch, 0), 2));
        if (!Number.isNaN(rate)) setSpeechRate(Math.min(Math.max(rate, 0.5), 2));
        setSpeechVoiceURI(uri);
      } catch {
        // no-op
      }
    };
    load();
    const handler = () => load();
    window.addEventListener("quickfrench:speechSettingsChanged", handler as EventListener);
    return () => window.removeEventListener("quickfrench:speechSettingsChanged", handler as EventListener);
  }, []);

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
    onRestartQuiz,
    onAnswerSelect,
    onTypedSubmit,
    onNextQuestion,
  });

  // Prepare a French voice or saved voice if available
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const synth = window.speechSynthesis;

    const pickVoice = () => {
      const voices = synth.getVoices?.() || [];
      // Only allow French voices
      const frVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith("fr"));
      // If a specific voice is saved, use it first (restricted to FR)
      const byURI = speechVoiceURI
        ? frVoices.find((v) => v.voiceURI === speechVoiceURI) || null
        : null;
      if (byURI) {
        voiceRef.current = byURI;
        return;
      }
      // Prefer fr-FR, else any fr-*
      const preferred = frVoices.find((v) => v.lang?.toLowerCase() === "fr-fr");
      const anyFr = frVoices[0];
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
  }, [speechVoiceURI]);

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
      const cleaned = (text || "")
        .replace(/\(\s*[mf]\s*\)/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      const utter = new SpeechSynthesisUtterance(cleaned);
      // Use a cached French voice if available; otherwise set lang
      if (voiceRef.current) utter.voice = voiceRef.current;
      utter.lang = "fr-FR";
  utter.volume = speechVolume;
  utter.rate = speechRate;
  utter.pitch = speechPitch;
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
    settings.autoAdvanceDelayMs,
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
      <QuizHeader onResetQuiz={onResetQuiz} />

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
