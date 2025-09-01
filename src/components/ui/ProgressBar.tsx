import { Flame } from "lucide-react";

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
  const showTimer =
    typeof timeLeft === "number" && typeof timerTotal === "number";
  const timeFraction = showTimer
    ? Math.max(0, Math.min(1, timeLeft! / timerTotal!))
    : 0;
  // We'll use a normalized 100-length circumference for easy dashoffset math
  const circleDashOffset = (1 - timeFraction) * 100;
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
          {showTimer && (
            <div
              className="flex items-center gap-2 text-sm font-semibold px-2 py-0.5 rounded-full border select-none"
              style={{
                color: "var(--foreground)",
                borderColor: "var(--border)",
                backgroundColor: "var(--muted)",
              }}
              aria-label={`Time left ${timeLeft}s out of ${timerTotal}s`}
              title="Time left"
            >
              <div className="relative w-6 h-6" aria-hidden="true">
                <svg
                  viewBox="0 0 36 36"
                  className="w-6 h-6 rotate-[-90deg]"
                  role="presentation"
                >
                  {/* Track */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity={0.35}
                  />
                  {/* Progress */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="url(#timerGradient)"
                    strokeWidth="3"
                    strokeDasharray="100 100"
                    strokeDashoffset={circleDashOffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.4s linear" }}
                  />
                  <defs>
                    <linearGradient
                      id="timerGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="var(--cta-grad-from)" />
                      <stop offset="100%" stopColor="var(--cta-grad-to)" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Inner icon (stopwatch emoji) */}
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                  ⏱
                </div>
              </div>
              <span>{timeLeft}s</span>
            </div>
          )}
          <span
            className="inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: "var(--primary-600)" }}
          >
            <Flame className="h-3 w-3" />
            {streak}
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
