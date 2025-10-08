'use client';

import React, { useEffect } from 'react';
import { TopicSelector } from '@/components/TopicSelector';
import { QuizGame } from '@/components/QuizGame';
import { QuizComplete } from '@/components/QuizComplete';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { getStorageItem } from '@/lib/storage';
import { useTopicSelection } from '@/hooks/useTopicSelection';
import type { SubtopicKey } from '@/hooks/useTopicSelection';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useQuizState } from '@/hooks/useQuizState';
import { topics, SUBTOPIC_TOPICS } from '@/data/topics';

const FrenchVocabularyQuiz = () => {
    const {
        selectedTopic,
        selectedSubtopics,
        handleStartQuiz: handleStartQuizHook,
        handleSubtopicSelect: handleSubtopicSelectHook,
        handleResetQuiz: handleResetQuizHook,
    } = useTopicSelection();

    const { vocabulary, loading, error, fetchVocabulary } = useVocabulary();
    const {
        quizState,
        settings,
        showTopicSelector,
        handleAnswerSelect,
        handleTypedSubmit,
        handleIDontKnow,
        nextQuestion,
        resetQuiz,
        goHome,
        startCustomQuiz,
        startQuiz,
        updateTypedAnswer,
        updateTranslationDirection,
        revealCurrentQuestionOptions,
    } = useQuizState(vocabulary, selectedTopic);

    // Prevent page scroll while selecting topics (desktop UX)
    useEffect(() => {
        if (!showTopicSelector) return;
        const isDesktop =
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(min-width: 1024px)').matches;
        if (!isDesktop) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [showTopicSelector]);

    // Load translation direction from localStorage and update settings
    useEffect(() => {
        const savedDirection = getStorageItem('translationDirection') as
            | 'french-to-english'
            | 'english-to-french';
        if (
            savedDirection &&
            savedDirection !== settings.translationDirection
        ) {
            updateTranslationDirection(savedDirection);
        }
    }, [settings.translationDirection, updateTranslationDirection]);

    const handleStartQuiz = async (topic: string) => {
        await handleStartQuizHook(topic, fetchVocabulary, startQuiz);
    };

    // Generic subtopic selection handler (DRY)
    const handleSubtopicSelect = async (
        topic: SubtopicKey,
        category: string,
    ) => {
        await handleSubtopicSelectHook(
            topic,
            category,
            fetchVocabulary,
            startQuiz,
        );
    };

    // Handle back from food subtopics
    const handleResetQuiz = () => {
        handleResetQuizHook(goHome);
    };

    const getTopicDisplayName = () => {
        // Handle combined topicId format for subtopics (e.g., "food::Fruits")
        if (selectedTopic.includes('::')) {
            const [mainTopic, subtopic] = selectedTopic.split('::');
            const label =
                mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1);
            return `${subtopic} (${label})`;
        }

        if (SUBTOPIC_TOPICS.includes(selectedTopic as SubtopicKey)) {
            const sub = selectedSubtopics[selectedTopic as SubtopicKey];
            if (sub) {
                const label =
                    selectedTopic.charAt(0).toUpperCase() +
                    selectedTopic.slice(1);
                return `${sub} (${label})`;
            }
        }
        return topics.find((t) => t.id === selectedTopic)?.name.toLowerCase();
    };

    if (loading && selectedTopic) {
        const topicName = getTopicDisplayName();

        return <LoadingSpinner message={`Loading ${topicName}...`} />;
    }

    if (error && selectedTopic) {
        return (
            <ErrorMessage
                title={`Failed to load ${selectedTopic}.`}
                message={error}
                onRetry={() => fetchVocabulary(selectedTopic)}
            />
        );
    }

    if (showTopicSelector) {
        return (
            <TopicSelector
                topics={topics}
                translationDirection={settings.translationDirection}
                onToggleDirection={() => {
                    const next =
                        settings.translationDirection === 'french-to-english'
                            ? 'english-to-french'
                            : 'french-to-english';
                    localStorage.setItem('translationDirection', next);
                    updateTranslationDirection(next);
                }}
                onStartQuiz={handleStartQuiz}
                onStartSubtopic={async (topic, sub) => {
                    if (SUBTOPIC_TOPICS.includes(topic as SubtopicKey)) {
                        await handleSubtopicSelect(topic as SubtopicKey, sub);
                    }
                }}
            />
        );
    }

    if (quizState.quizComplete) {
        return (
            <QuizComplete
                score={quizState.score}
                totalQuestions={quizState.questions.length}
                maxStreak={quizState.maxStreak}
                onReturnHome={handleResetQuiz}
                onRestartQuiz={() => {
                    // Restart in place: regenerate questions and reset progress
                    // Use the reset function from hook but preserve selectedTopic and fetched vocabulary
                    // We can call next handlers to re-start the same topic: use startQuiz with current selectedTopic
                    // Easiest: toggle quizComplete false and rely on useQuizState.resetQuiz which now restarts in place
                    resetQuiz();
                }}
                wrongCount={quizState.wrongAnswers.length}
                onRetryWrongOnly={() => {
                    if (quizState.wrongAnswers.length === 0) return;
                    const questions = quizState.wrongAnswers.map(
                        (wa) => wa.question,
                    );
                    startCustomQuiz(questions);
                }}
            />
        );
    }

    return (
        <QuizGame
            quizState={quizState}
            settings={settings}
            onAnswerSelect={handleAnswerSelect}
            onTypedSubmit={handleTypedSubmit}
            onIDontKnow={handleIDontKnow}
            onNextQuestion={nextQuestion}
            onResetQuiz={handleResetQuiz}
            onRestartQuiz={resetQuiz}
            onUpdateTypedAnswer={updateTypedAnswer}
            onRevealHybrid={revealCurrentQuestionOptions}
        />
    );
};

export default FrenchVocabularyQuiz;
