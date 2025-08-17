import { Check, X, HelpCircle } from "lucide-react";
import { Question } from "@/types/quiz";

interface MultipleChoiceOptionsProps {
  question: Question;
  selectedAnswer: string;
  showResult: boolean;
  onAnswerSelect: (answer: string) => void;
  onIDontKnow?: () => void;
}

export const MultipleChoiceOptions = ({
  question,
  selectedAnswer,
  showResult,
  onAnswerSelect,
  onIDontKnow,
}: MultipleChoiceOptionsProps) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

      {!showResult && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onIDontKnow}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm md:text-base font-medium hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            <HelpCircle className="h-4 w-4" /> I don&apos;t know (0 or ?)
          </button>
        </div>
      )}
    </div>
  );
};
