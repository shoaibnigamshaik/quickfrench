import React from 'react';
import { checkTypedAnswer, stripGenderMarkers } from '@/lib/quiz-utils';

interface TypingInputProps {
    typedAnswer: string;
    showResult: boolean;
    selectedAnswer: string;
    correctAnswer: string;
    onTypedAnswerChange: (answer: string) => void;
    onSubmit: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    placeholder?: string;
    onIDontKnow?: () => void;
}

export const TypingInput = ({
    typedAnswer,
    showResult,
    selectedAnswer,
    correctAnswer,
    onTypedAnswerChange,
    onSubmit,
    inputRef,
    placeholder,
    onIDontKnow,
}: TypingInputProps) => {
    return (
        <div className="mb-6">
            <div className="max-w-md mx-auto">
                <input
                    ref={inputRef}
                    type="text"
                    value={typedAnswer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onTypedAnswerChange(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            // Ctrl+Enter triggers "I don't know"
                            if (!showResult && onIDontKnow) {
                                e.preventDefault();
                                onIDontKnow();
                            }
                        } else if (e.key === 'Enter') {
                            // Only submit when enabled and no result is shown
                            if (!showResult && typedAnswer.trim()) {
                                onSubmit();
                            } else {
                                e.preventDefault();
                            }
                        }
                    }}
                    disabled={showResult}
                    placeholder={placeholder ?? 'Type your answer...'}
                    className="w-full p-5 text-lg rounded-2xl focus:outline-none transition-colors duration-200"
                    style={{
                        color: 'var(--foreground)',
                        backgroundColor: 'var(--card)',
                        border: `2px solid var(--border)`,
                    }}
                />
                {!showResult && (
                    <div className="mt-3 flex items-center justify-center gap-3">
                        <button
                            onClick={onSubmit}
                            disabled={!typedAnswer.trim()}
                            className="inline-flex items-center px-5 py-2.5 text-sm md:text-base text-white rounded-lg font-semibold transition-all duration-200 hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                            style={{
                                background:
                                    'linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))',
                            }}
                        >
                            Submit (Enter)
                        </button>
                        <button
                            type="button"
                            onClick={onIDontKnow}
                            className="inline-flex items-center px-4 py-2.5 text-sm md:text-base rounded-lg font-medium border focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                            style={{
                                backgroundColor: 'var(--card)',
                                borderColor: 'var(--border)',
                                color: 'var(--muted-foreground)',
                            }}
                        >
                            I don&rsquo;t know (Ctrl+Enter)
                        </button>
                    </div>
                )}
            </div>

            {showResult && (
                <div
                    className="mt-5 text-center"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {(() => {
                        const isCorrect = checkTypedAnswer(
                            correctAnswer,
                            selectedAnswer,
                        );
                        return (
                            <div
                                className="max-w-md mx-auto p-4 rounded-xl border mb-3"
                                style={{
                                    backgroundColor: 'var(--muted)',
                                }}
                            >
                                <div
                                    className="font-semibold"
                                    style={{
                                        color: isCorrect
                                            ? 'var(--success-600)'
                                            : 'var(--danger-600)',
                                    }}
                                >
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                </div>
                            </div>
                        );
                    })()}
                    <div
                        className="max-w-md mx-auto p-4 rounded-xl border"
                        style={{
                            backgroundColor: 'var(--muted)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div
                            className="text-sm mb-2"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            Your answer:
                        </div>
                        {(() => {
                            const isCorrect = checkTypedAnswer(
                                correctAnswer,
                                selectedAnswer,
                            );
                            return (
                                <div
                                    className="font-semibold mb-3"
                                    style={{
                                        color: isCorrect
                                            ? 'var(--success-600)'
                                            : 'var(--danger-600)',
                                    }}
                                >
                                    {selectedAnswer}
                                </div>
                            );
                        })()}
                        <div
                            className="text-sm mb-2"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            Correct answer:
                        </div>
                        <div
                            className="font-semibold"
                            style={{ color: 'var(--success-600)' }}
                        >
                            {stripGenderMarkers(correctAnswer)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
