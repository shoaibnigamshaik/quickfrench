interface QuizResultProps {
    currentQuestion: number;
    totalQuestions: number;
    onNextQuestion: () => void;
}

export const QuizResult = ({
    currentQuestion,
    totalQuestions,
    onNextQuestion,
}: QuizResultProps) => {
    return (
        <div className="text-center">
            <button
                onClick={onNextQuestion}
                className="inline-flex items-center px-5 py-2.5 text-sm md:text-base text-white rounded-lg font-semibold transition-all duration-200 hover:brightness-110 active:brightness-95 shadow focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                style={{
                    background:
                        'linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))',
                }}
            >
                {currentQuestion < totalQuestions - 1 ? 'Next' : 'Finish'}
            </button>
        </div>
    );
};
