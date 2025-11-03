import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
        <div className="flex justify-end">
            <Button
                onClick={onNextQuestion}
                aria-label={
                    currentQuestion < totalQuestions - 1 ? 'Next' : 'Finish'
                }
                className="group inline-flex items-center px-5 py-2.5 text-sm md:text-base text-white rounded-lg font-semibold transition-all hover:brightness-110 active:brightness-95 shadow focus:outline-none focus:ring-2 focus:ring-(--primary-600) focus:ring-offset-2 focus:ring-offset-(--card) animate-in fade-in slide-in-from-right-3 duration-300 ease-out"
                style={{
                    background:
                        'linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))',
                }}
            >
                {currentQuestion < totalQuestions - 1 ? (
                    <>
                        <span>Next</span>
                        <ArrowRight
                            className="h-5 w-5 translate-x-0 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                        />
                    </>
                ) : (
                    'Finish'
                )}
            </Button>
        </div>
    );
};
