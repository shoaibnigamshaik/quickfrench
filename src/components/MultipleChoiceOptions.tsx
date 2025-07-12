import { Check, X } from "lucide-react";
import { Question } from "@/types/quiz";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {question.options.map((option: string, index: number) => {
        let buttonClass =
          "w-full p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 text-left font-semibold";

        if (showResult) {
          if (option === question.correct) {
            buttonClass += " bg-green-50 border-green-500 text-green-700";
          } else if (option === selectedAnswer && option !== question.correct) {
            buttonClass += " bg-red-50 border-red-500 text-red-700";
          } else {
            buttonClass += " bg-gray-50 border-gray-300 text-gray-500";
          }
        } else {
          buttonClass +=
            " bg-gray-50 border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300";
        }

        return (
          <button
            key={index}
            onClick={() => onAnswerSelect(option)}
            disabled={showResult}
            className={buttonClass}
          >
            <div className="flex items-center justify-between">
              <span>
                <span className="text-indigo-600 font-bold mr-3">
                  {index + 1}
                </span>
                {option}
              </span>
              {showResult && option === question.correct && (
                <Check className="h-5 w-5 text-green-600" />
              )}
              {showResult &&
                option === selectedAnswer &&
                option !== question.correct && (
                  <X className="h-5 w-5 text-red-600" />
                )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
