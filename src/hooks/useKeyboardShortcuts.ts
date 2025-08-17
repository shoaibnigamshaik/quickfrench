import { useEffect } from "react";
import { QuizMode, Question } from "@/types/quiz";

interface UseKeyboardShortcutsProps {
  enabled?: boolean;
  showTopicSelector: boolean;
  quizComplete: boolean;
  showResult: boolean;
  quizMode: QuizMode;
  typedAnswer: string;
  currentQuestion: number;
  questions: Question[];
  onResetQuiz: () => void;
  onRestartQuiz: () => void;
  onAnswerSelect: (answer: string) => void;
  onTypedSubmit: () => void;
  onNextQuestion: () => void;
  onIDontKnow?: () => void;
}

export const useKeyboardShortcuts = ({
  enabled = true,
  showTopicSelector,
  quizComplete,
  showResult,
  quizMode,
  typedAnswer,
  currentQuestion,
  questions,
  onResetQuiz,
  onRestartQuiz,
  onAnswerSelect,
  onTypedSubmit,
  onNextQuestion,
  onIDontKnow,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const getOptionIndexFromEvent = (e: KeyboardEvent): number => {
      console.log("Key event:", {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
      });
      // Ignore when using system modifiers; allow Shift for layouts that need it for digits
      if (e.metaKey || e.ctrlKey || e.altKey) return -1;

      // Primary: direct numeric keys
      if (e.key && ["1", "2", "3", "4"].includes(e.key)) {
        return parseInt(e.key, 10) - 1;
      }

      // Common alternate glyphs on non-US layouts (e.g., AZERTY without Shift)
      const altGlyphToIndex: Record<string, number> = {
        "&": 0, // 1
        é: 1, // 2
        '"': 2, // 3
        "'": 3, // 4
        "!": 0, // Shift+1 on some layouts
        "@": 1, // Shift+2 (rare fallback)
        "#": 2, // Shift+3
        $: 3, // Shift+4
      };
      if (e.key && e.key in altGlyphToIndex) {
        return altGlyphToIndex[e.key];
      }

      // Use code for top-row and numpad keys
      const codeToIndex: Record<string, number> = {
        Digit1: 0,
        Digit2: 1,
        Digit3: 2,
        Digit4: 3,
        Numpad1: 0,
        Numpad2: 1,
        Numpad3: 2,
        Numpad4: 3,
      };
      const code = e.code;
      if (code && code in codeToIndex) {
        return codeToIndex[code];
      }

      // Legacy fallback for older/mobile browsers
      const kc = e.keyCode;
      if (kc === 49) return 0; // '1'
      if (kc === 50) return 1; // '2'
      if (kc === 51) return 2; // '3'
      if (kc === 52) return 3; // '4'
      if (kc === 97) return 0; // Numpad '1'
      if (kc === 98) return 1; // Numpad '2'
      if (kc === 99) return 2; // Numpad '3'
      if (kc === 100) return 3; // Numpad '4'

      return -1;
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);

      // ESC to return to topics (when not typing in an input)
      if (e.key === "Escape" && !showTopicSelector && !isEditable) {
        // Reuse reset behavior which parent wires to goHome
        e.preventDefault();
        onResetQuiz();
        return;
      }

      // In typing mode, allow Ctrl+Enter to trigger "I don't know"
      if (
        quizMode === "typing" &&
        !showResult &&
        e.key === "Enter" &&
        e.ctrlKey &&
        typeof onIDontKnow === "function"
      ) {
        e.preventDefault();
        onIDontKnow();
        return;
      }

      // In typing mode, Enter submits (when not inside an editable element to avoid double submit)
      if (
        quizMode === "typing" &&
        e.key === "Enter" &&
        !showResult &&
        !isEditable
      ) {
        e.preventDefault();
        onTypedSubmit();
        return;
      }

      // Space or Enter to go to next question (when result is shown)
      if ((e.key === " " || e.key === "Enter") && showResult) {
        e.preventDefault();
        onNextQuestion();
        return;
      }

      // R to restart quiz (allow restart anytime except topic selector)
      // Ignore when typing in an input/textarea/contentEditable
      if (e.key.toLowerCase() === "r" && !showTopicSelector && !isEditable) {
        e.preventDefault();
        onRestartQuiz();
        return;
      }

      if (showTopicSelector || quizComplete) return;

      if (quizMode === "multiple-choice" && !showResult && !isEditable) {
        const idx = getOptionIndexFromEvent(e);
        if (idx >= 0 && questions[currentQuestion]?.options[idx]) {
          e.preventDefault();
          onAnswerSelect(questions[currentQuestion].options[idx]);
          return;
        }

        // 0 / Numpad0 / '?' triggers I don't know
        if (
          typeof onIDontKnow === "function" &&
          (e.key === "0" ||
            e.key === "?" ||
            e.code === "Digit0" ||
            e.code === "Numpad0" ||
            e.keyCode === 48 ||
            e.keyCode === 96)
        ) {
          e.preventDefault();
          onIDontKnow();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    enabled,
    showResult,
    quizComplete,
    currentQuestion,
    questions,
    typedAnswer,
    showTopicSelector,
    quizMode,
    onResetQuiz,
    onRestartQuiz,
    onAnswerSelect,
    onTypedSubmit,
    onNextQuestion,
    onIDontKnow,
  ]);
};
