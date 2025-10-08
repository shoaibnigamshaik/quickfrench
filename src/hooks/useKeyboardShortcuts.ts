import { useEffect } from 'react';
import { QuizMode, Question } from '@/types/quiz';

interface UseKeyboardShortcutsProps {
    enabled?: boolean;
    showTopicSelector: boolean;
    quizComplete: boolean;
    showResult: boolean;
    quizMode: QuizMode;
    typedAnswer: string;
    currentQuestion: number;
    questions: Question[];
    onResetQuiz: () => void;
    onRestartQuiz: () => void;
    onAnswerSelect: (answer: string) => void;
    onTypedSubmit: () => void;
    onNextQuestion: () => void;
    onIDontKnow?: () => void;
    onRevealHybrid?: () => void;
    hybridRevealedCurrent?: boolean; // for hybrid mode: has current question been revealed to MCQ?
}

export const useKeyboardShortcuts = ({
    enabled = true,
    showTopicSelector,
    quizComplete,
    showResult,
    quizMode,
    typedAnswer,
    currentQuestion,
    questions,
    onResetQuiz,
    onRestartQuiz,
    onAnswerSelect,
    onTypedSubmit,
    onNextQuestion,
    onIDontKnow,
    onRevealHybrid,
    hybridRevealedCurrent,
}: UseKeyboardShortcutsProps) => {
    useEffect(() => {
        if (!enabled) {
            return;
        }
        const getOptionIndexFromEvent = (e: KeyboardEvent): number => {
            // Ignore when using system modifiers
            if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return -1;

            // Primary: direct numeric keys
            if (e.key && ['1', '2', '3', '4'].includes(e.key)) {
                return parseInt(e.key, 10) - 1;
            }

            // Use code for top-row and numpad keys
            const codeToIndex: Record<string, number> = {
                Digit1: 0,
                Digit2: 1,
                Digit3: 2,
                Digit4: 3,
                Numpad1: 0,
                Numpad2: 1,
                Numpad3: 2,
                Numpad4: 3,
            };
            const code = e.code;
            if (code && code in codeToIndex) {
                return codeToIndex[code];
            }

            return -1;
        };

        const handleKeyPress = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const isEditable =
                !!target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    (target as HTMLElement).isContentEditable);

            // ESC to return to topics (when not typing in an input)
            if (e.key === 'Escape' && !showTopicSelector && !isEditable) {
                // Reuse reset behavior which parent wires to goHome
                e.preventDefault();
                onResetQuiz();
                return;
            }

            // In typing mode, allow Ctrl+Enter to trigger "I don't know"
            if (
                quizMode === 'typing' &&
                !showResult &&
                e.key === 'Enter' &&
                e.ctrlKey &&
                typeof onIDontKnow === 'function'
            ) {
                e.preventDefault();
                onIDontKnow();
                return;
            }

            // In typing mode, Enter submits (when not inside an editable element to avoid double submit)
            if (
                quizMode === 'typing' &&
                e.key === 'Enter' &&
                !showResult &&
                !isEditable
            ) {
                e.preventDefault();
                onTypedSubmit();
                return;
            }

            // Space or Enter to go to next question (when result is shown and not typing in input)
            if (
                (e.key === ' ' || e.key === 'Enter') &&
                showResult &&
                !isEditable
            ) {
                e.preventDefault();
                onNextQuestion();
                return;
            }

            // R to restart quiz (allow restart anytime except topic selector)
            // Ignore when typing in an input/textarea/contentEditable
            if (
                e.key.toLowerCase() === 'r' &&
                !showTopicSelector &&
                !isEditable
            ) {
                e.preventDefault();
                onRestartQuiz();
                return;
            }

            if (showTopicSelector || quizComplete) return;

            if (
                (quizMode === 'multiple-choice' ||
                    (quizMode === 'hybrid' && hybridRevealedCurrent)) &&
                !showResult &&
                !isEditable
            ) {
                const idx = getOptionIndexFromEvent(e);
                if (idx >= 0 && questions[currentQuestion]?.options[idx]) {
                    e.preventDefault();
                    onAnswerSelect(questions[currentQuestion].options[idx]);
                    return;
                }

                // 0 / Numpad0 / '?' : in hybrid typing phase -> reveal; in MCQ phase -> I don't know
                if (
                    e.key === '0' ||
                    e.key === '?' ||
                    e.code === 'Digit0' ||
                    e.code === 'Numpad0'
                ) {
                    e.preventDefault();
                    if (
                        quizMode === 'hybrid' &&
                        !hybridRevealedCurrent &&
                        typeof onRevealHybrid === 'function'
                    ) {
                        onRevealHybrid();
                    } else if (typeof onIDontKnow === 'function') {
                        onIDontKnow();
                    }
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [
        enabled,
        showResult,
        quizComplete,
        currentQuestion,
        questions,
        typedAnswer,
        showTopicSelector,
        quizMode,
        onResetQuiz,
        onRestartQuiz,
        onAnswerSelect,
        onTypedSubmit,
        onNextQuestion,
        onIDontKnow,
        hybridRevealedCurrent,
        onRevealHybrid,
    ]);
};
