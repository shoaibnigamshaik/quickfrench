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
  const [hasFrenchVoice, setHasFrenchVoice] = React.useState<boolean>(false);
  const [speechVolume, setSpeechVolume] = React.useState<number>(1);
  const [speechPitch, setSpeechPitch] = React.useState<number>(1);
  const [speechRate, setSpeechRate] = React.useState<number>(1);
  const [speechVoiceURI, setSpeechVoiceURI] = React.useState<string | null>(
    null,
  );

  // Load speech settings from localStorage and listen for changes from Settings modal
  useEffect(() => {
    const load = () => {
      try {
        const vol = parseFloat(localStorage.getItem("speechVolume") || "1");
        const pitch = parseFloat(localStorage.getItem("speechPitch") || "1");
        const rate = parseFloat(localStorage.getItem("speechRate") || "1");
        const uri = localStorage.getItem("speechVoiceURI");
        if (!Number.isNaN(vol)) setSpeechVolume(Math.min(Math.max(vol, 0), 1));
        if (!Number.isNaN(pitch))
          setSpeechPitch(Math.min(Math.max(pitch, 0), 2));
        if (!Number.isNaN(rate))
          setSpeechRate(Math.min(Math.max(rate, 0.5), 2));
        setSpeechVoiceURI(uri);
      } catch {
        // no-op
      }
    };
    load();
    const handler = () => load();
    window.addEventListener(
      "quickfrench:speechSettingsChanged",
      handler as EventListener,
    );
    return () =>
      window.removeEventListener(
        "quickfrench:speechSettingsChanged",
        handler as EventListener,
      );
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
  enabled: process.env.NEXT_PUBLIC_ENABLE_SHORTCUTS !== "false",
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

    // Wait for voices to be loaded (cross-browser: event + polling)
    const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        const existing = synth.getVoices?.() || [];
        if (existing.length) return resolve(existing);

        let resolved = false;
        const tryResolve = () => {
          if (resolved) return;
          const arr = synth.getVoices?.() || [];
          if (arr.length) {
            resolved = true;
            cleanup();
            resolve(arr);
          }
        };

        const onVoicesChanged = () => tryResolve();
        const interval = setInterval(tryResolve, 250);
        const timeout = setTimeout(() => {
          // Give up after 5s but return whatever we have (possibly empty)
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve(synth.getVoices?.() || []);
          }
        }, 5000);
        const cleanup = () => {
          clearInterval(interval);
          clearTimeout(timeout);
          synth.removeEventListener?.("voiceschanged", onVoicesChanged);
        };
        synth.addEventListener?.("voiceschanged", onVoicesChanged);
        // Kick off one attempt
        tryResolve();
      });
    };

    let cancelled = false;
    const pickVoice = (voices: SpeechSynthesisVoice[]) => {
      // Only allow French voices (fallback: also check name tokens)
      const frVoices = voices.filter((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        return (
          lang.startsWith("fr") ||
          /fr(ancais|ançais)?|french/.test(name)
        );
      });
      setHasFrenchVoice(frVoices.length > 0);

      // If a specific voice is saved, use it first (restricted to FR set)
      const byURI = speechVoiceURI
        ? frVoices.find((v) => v.voiceURI === speechVoiceURI) || null
        : null;
      if (byURI) {
        voiceRef.current = byURI;
        return;
      }
      // Prefer fr-FR (Google/Microsoft tend to tag this), else any fr-*
      const preferred = frVoices.find(
        (v) => (v.lang || "").toLowerCase() === "fr-fr",
      );
      const anyFr = frVoices[0] || null;
      voiceRef.current = preferred || anyFr;
    };

    (async () => {
      const voices = await waitForVoices();
      if (cancelled) return;
      pickVoice(voices);
    })();

    return () => {
      cancelled = true;
    };
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
                title={
                  hasFrenchVoice
                    ? "Pronounce"
                    : "Pronunciation unavailable: no French voice in this browser"
                }
                onClick={() => hasFrenchVoice && speakFrench(currentQuestion?.word || "")}
                disabled={!hasFrenchVoice}
                className={`inline-flex items-center justify-center rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white/70 ${!hasFrenchVoice ? "opacity-60 cursor-not-allowed" : ""}`}
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
