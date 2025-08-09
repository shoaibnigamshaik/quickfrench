import React from "react";

interface TypingInputProps {
  typedAnswer: string;
  showResult: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  onTypedAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const TypingInput = ({
  typedAnswer,
  showResult,
  selectedAnswer,
  correctAnswer,
  onTypedAnswerChange,
  onSubmit,
  inputRef,
}: TypingInputProps) => {
  return (
    <div className="mb-8">
      <div className="max-w-md mx-auto">
        <input
          ref={inputRef}
          type="text"
          value={typedAnswer}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onTypedAnswerChange(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            e.key === "Enter" && onSubmit()
          }
          disabled={showResult}
          placeholder="Type the English meaning..."
          className="w-full p-6 text-lg rounded-2xl focus:outline-none transition-colors duration-200"
          style={{
            color: "var(--foreground)",
            backgroundColor: "var(--card)",
            border: `2px solid var(--border)`,
          }}
        />
        {!showResult && (
          <div className="mt-4 text-center">
            <button
              onClick={onSubmit}
              disabled={!typedAnswer.trim()}
              className="px-8 py-3 bg-gradient-to-r from-[var(--primary-600)] to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Submit (Enter)
            </button>
          </div>
        )}
      </div>

      {showResult && (
        <div className="mt-6 text-center">
          <div
            className="max-w-md mx-auto p-4 rounded-xl border"
            style={{
              backgroundColor: "var(--muted)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="text-sm mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Your answer:
            </div>
            <div
              className="font-semibold mb-3"
              style={{ color: "var(--foreground)" }}
            >
              {selectedAnswer}
            </div>
            <div
              className="text-sm mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Correct answer:
            </div>
            <div
              className="font-semibold"
              style={{ color: "var(--success-600)" }}
            >
              {correctAnswer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
