interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  streak: number;
  score: number;
  timeLeft?: number;
  timerTotal?: number;
}

export const ProgressBar = ({
  currentQuestion,
  totalQuestions,
  streak,
  score,
  timeLeft,
  timerTotal,
}: ProgressBarProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span
          className="text-sm font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <div className="flex items-center space-x-4">
          {typeof timeLeft === "number" && typeof timerTotal === "number" && (
            <span
              className="text-sm font-semibold px-2 py-0.5 rounded-full border"
              style={{
                color: "var(--foreground)",
                borderColor: "var(--border)",
                backgroundColor: "var(--muted)",
              }}
              aria-label={`Time left ${timeLeft}s`}
              title="Time left"
            >
              ⏱ {timeLeft}s
            </span>
          )}
          <span
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Streak: {streak}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--primary-600)" }}
          >
            Score: {score}
          </span>
        </div>
      </div>
      <div className="w-full rounded-full h-2.5 bg-[var(--muted)] dark:bg-white/15 border border-[var(--border)] dark:border-[var(--border)]">
        <div
          className="h-2.5 rounded-full"
          style={{
            width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            background:
              "linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))",
          }}
        />
      </div>
      {/* Removed secondary time remaining bar as requested */}
    </div>
  );
};
