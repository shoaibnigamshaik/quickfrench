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
          className="w-full p-6 text-lg text-gray-800 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors duration-200"
        />
        {!showResult && (
          <div className="mt-4 text-center">
            <button
              onClick={onSubmit}
              disabled={!typedAnswer.trim()}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Submit (Enter)
            </button>
          </div>
        )}
      </div>

      {showResult && (
        <div className="mt-6 text-center">
          <div className="max-w-md mx-auto p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">
              Your answer:
            </div>
            <div className="font-semibold text-gray-800 mb-3">
              {selectedAnswer}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Correct answer:
            </div>
            <div className="font-semibold text-green-700">
              {correctAnswer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
