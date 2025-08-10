import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface QuizHeaderProps {
  onResetQuiz: () => void;
  isFoodQuiz?: boolean;
}

export const QuizHeader = ({
  onResetQuiz,
  isFoodQuiz = false,
}: QuizHeaderProps) => {
  const handleBackClick = () => onResetQuiz();

  return (
    <div className="text-center mb-8 relative">
      {isFoodQuiz ? (
        <button
          onClick={handleBackClick}
          className="absolute top-4 left-0 flex items-center transition-colors duration-200 hover:underline"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-semibold">Back</span>
        </button>
      ) : (
        <Link
          href="/"
          onClick={onResetQuiz}
          className="absolute top-4 left-0 flex items-center transition-colors duration-200"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-semibold">Back</span>
        </Link>
      )}

      <div className="pt-10">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Translate the Word
        </h1>
      </div>
    </div>
  );
};
