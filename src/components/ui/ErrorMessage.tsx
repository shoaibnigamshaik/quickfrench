import { Button } from "./button";

interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-md">
        <div
          className="mb-3 text-lg font-semibold"
          style={{ color: "var(--danger-600)" }}
        >
          {title}
        </div>
        <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>
          {message}
        </p>
        <Button
          className="inline-flex items-center px-5 py-2.5 rounded-lg border"
          style={{
            backgroundColor: "var(--muted)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    </div>
  );
}
