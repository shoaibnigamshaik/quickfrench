interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  streak: number;
  score: number;
}

export const ProgressBar = ({ currentQuestion, totalQuestions, streak, score }: ProgressBarProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Streak: {streak}</span>
          <span className="text-sm font-semibold text-indigo-600">
            Score: {score}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
          style={{
            width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
