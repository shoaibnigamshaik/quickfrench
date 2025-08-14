import { Check, X } from "lucide-react";
import { Question } from "@/types/quiz";
import React from "react";

interface MultipleChoiceOptionsProps {
  question: Question;
  selectedAnswer: string;
  showResult: boolean;
  onAnswerSelect: (answer: string) => void;
}

export const MultipleChoiceOptions = ({
  question,
  selectedAnswer,
  showResult,
  onAnswerSelect,
}: MultipleChoiceOptionsProps) => {
  const firstButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (firstButtonRef.current) firstButtonRef.current.focus();
  }, [question]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {question.options.map((option: string, index: number) => {
        let buttonClass =
          "w-full p-5 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 text-left font-semibold";
        let inlineStyle: React.CSSProperties | undefined = undefined;

        if (showResult) {
          if (option === question.correct) {
            buttonClass += " border";
            inlineStyle = {
              ...(inlineStyle || {}),
              backgroundColor: "var(--success-50)",
              borderColor: "var(--success-600)",
              color: "var(--success-600)",
            };
          } else if (option === selectedAnswer && option !== question.correct) {
            buttonClass += " border";
            inlineStyle = {
              ...(inlineStyle || {}),
              backgroundColor: "var(--danger-50)",
              borderColor: "var(--danger-600)",
              color: "var(--danger-600)",
            };
          } else {
            buttonClass += " border";
            inlineStyle = {
              ...(inlineStyle || {}),
              backgroundColor: "var(--muted)",
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            };
          }
        } else {
          buttonClass += " border hover:shadow-sm";
          inlineStyle = {
            ...(inlineStyle || {}),
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          };
        }

        return (
          <button
            key={index}
            ref={index === 0 ? firstButtonRef : undefined}
            onClick={() => onAnswerSelect(option)}
            disabled={showResult}
            className={buttonClass}
            style={inlineStyle}
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <span>
                <span
                  className="font-bold mr-3"
                  style={{ color: "var(--primary-600)" }}
                >
                  {index + 1}
                </span>
                {option}
              </span>
              {showResult && option === question.correct && (
                <Check
                  className="h-5 w-5"
                  style={{ color: "var(--success-600)" }}
                />
              )}
              {showResult &&
                option === selectedAnswer &&
                option !== question.correct && (
                  <X
                    className="h-5 w-5"
                    style={{ color: "var(--danger-600)" }}
                  />
                )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
