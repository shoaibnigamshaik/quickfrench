'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Settings, ChevronRight, Play, Flame } from 'lucide-react';
import { SUBTOPIC_MAP } from '@/data/subtopics';
import { TOPIC_COUNTS } from '@/data/topics';
import { Topic, TranslationDirection } from '@/types/quiz';
import {
    getTopicSummary,
    PROGRESS_EVENT,
    getDailyStreakSummary,
    getCurrentStreakRange,
    getDailyCompletionDates,
} from '@/lib/progress';
import { Calendar, RangeCalendar } from '@/components/ui/calendar-rac';
import { parseDate as racParseDate } from '@internationalized/date';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface TopicSelectorProps {
    topics: Topic[];
    translationDirection: TranslationDirection;
    onStartQuiz: (topic: string) => void;
    onStartSubtopic?: (topic: string, subtopic: string) => void;
    onToggleDirection: () => void;
}

export const TopicSelector = ({
    topics,
    translationDirection,
    onStartQuiz,
    onStartSubtopic,
    onToggleDirection,
}: TopicSelectorProps) => {
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [, setProgressTick] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    const [daily, setDaily] = React.useState(() => ({
        currentStreak: 0,
        bestStreak: 0,
        todayCompleted: false,
        lastCompletionDate: undefined as string | undefined,
    }));
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
    const [streakRange, setStreakRange] = React.useState<
        { start: string; end: string } | undefined
    >(undefined);
    const [markedDates, setMarkedDates] = React.useState<string[]>([]);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!isCalendarOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsCalendarOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isCalendarOpen]);

    React.useEffect(() => {
        const saved = localStorage.getItem('topicSelector:selectedId');
        if (saved) setSelectedId(saved);
    }, []);

    React.useEffect(() => {
        // Mark mounted, then load progress data.
        setIsMounted(true);
        try {
            setDaily(getDailyStreakSummary());
            setStreakRange(getCurrentStreakRange());
            setMarkedDates(getDailyCompletionDates());
        } catch {}
        const handler = () => {
            setProgressTick((x) => !x);
            try {
                setDaily(getDailyStreakSummary());
                setStreakRange(getCurrentStreakRange());
                setMarkedDates(getDailyCompletionDates());
            } catch {}
        };
        window.addEventListener(PROGRESS_EVENT, handler as EventListener);
        return () =>
            window.removeEventListener(
                PROGRESS_EVENT,
                handler as EventListener,
            );
    }, []);

    React.useEffect(() => {
        if (selectedId)
            localStorage.setItem('topicSelector:selectedId', selectedId);
    }, [selectedId]);

    React.useEffect(() => {
        const handleSaveScroll = () => {
            if (scrollContainerRef.current) {
                localStorage.setItem(
                    'topicSelector:scrollTop',
                    scrollContainerRef.current.scrollTop.toString(),
                );
            }
        };

        // Save scroll position before unmounting
        return () => {
            handleSaveScroll();
        };
    }, []);

    // Restore scroll position when component mounts
    React.useEffect(() => {
        const savedScrollTop = localStorage.getItem('topicSelector:scrollTop');
        if (savedScrollTop && scrollContainerRef.current) {
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = parseInt(
                        savedScrollTop,
                        10,
                    );
                }
            }, 0);
        }
    }, []);

    const selectedTopic: Topic | null = selectedId
        ? topics.find((t) => t.id === selectedId) || null
        : null;

    const hasSubtopics = (id: string) => Boolean(SUBTOPIC_MAP[id]);
    const subtopicsFor = (id: string): readonly string[] =>
        SUBTOPIC_MAP[id] ?? [];

    return (
        <div className="max-w-2xl lg:max-w-5xl w-full mx-auto min-h-dvh">
            <div
                className="rounded-3xl p-6 md:p-7"
                style={{
                    backgroundColor: 'var(--background)',
                }}
            >
                {/* Header: compact row with brand, toggle, and settings */}
                <div className="mb-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        {/* Left: brand */}
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                                style={{
                                    background:
                                        'linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))',
                                }}
                                aria-hidden
                            >
                                <BookOpen
                                    className="h-5 w-5 md:h-6 md:w-6"
                                    style={{ color: 'white' }}
                                />
                            </div>
                            <h1
                                className="text-2xl md:text-3xl font-bold"
                                style={{ color: 'var(--foreground)' }}
                            >
                                French Quizzes
                            </h1>
                        </div>

                        {/* Right: direction toggle + daily streak + settings */}
                        <div className="flex items-center gap-2 self-start md:self-auto">
                            <Button
                                onClick={onToggleDirection}
                                aria-label={`Toggle translation direction (currently ${
                                    translationDirection === 'french-to-english'
                                        ? 'French to English'
                                        : 'English to French'
                                })`}
                                title="Toggle translation direction"
                                className="inline-flex items-center px-2 py-1 rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-600)"
                                style={{
                                    background:
                                        'linear-gradient(90deg, var(--badge-grad-from), var(--badge-grad-to))',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    {translationDirection ===
                                    'french-to-english'
                                        ? 'FR → EN'
                                        : 'EN → FR'}
                                </span>
                            </Button>
                            {/* Daily streak pill (hidden when zero) */}
                            {daily.currentStreak > 0 && (
                                <Button
                                    type="button"
                                    onClick={() => setIsCalendarOpen(true)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-600)"
                                    style={{
                                        backgroundColor: 'var(--muted)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--foreground)',
                                    }}
                                    title="Consecutive days with at least one quiz completed (click to open calendar)"
                                    aria-label={`Daily streak ${daily.currentStreak}${daily.bestStreak ? `, best ${daily.bestStreak}` : ''}`}
                                >
                                    <Flame
                                        className="h-4 w-4"
                                        style={{ color: 'var(--primary-600)' }}
                                    />
                                    <span className="text-sm font-semibold">
                                        Daily {daily.currentStreak}
                                    </span>
                                </Button>
                            )}
                            <Link
                                href="/settings"
                                aria-label="Settings"
                                title="Settings"
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:shadow border"
                                style={{
                                    backgroundColor: 'var(--muted)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                <Settings
                                    className="h-4 w-4"
                                    style={{ color: 'var(--muted-foreground)' }}
                                />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                    {/* List column */}
                    <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
                        {/* Scroll only within the topic list on desktop to keep actions in view */}
                        <div
                            ref={scrollContainerRef}
                            className="lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto lg:overscroll-contain scrollbar-sleek"
                            aria-label="Topics list (scrollable)"
                            tabIndex={0}
                        >
                            <ul
                                role="list"
                                className="divide-y rounded-xl border overflow-hidden"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                {topics.map((topic) => {
                                    const itemCount = TOPIC_COUNTS[topic.id];
                                    const isSelected = selectedId === topic.id;
                                    const _hasSub = hasSubtopics(topic.id);
                                    const summary = isMounted
                                        ? getTopicSummary(topic.id)
                                        : {
                                              attempts: 0,
                                              correct: 0,
                                              learnedCount: 0,
                                              masteredCount: 0,
                                              uniqueCorrect: 0,
                                          };
                                    const uniqueCorrect =
                                        summary.uniqueCorrect || 0;
                                    const total = itemCount ?? 0;

                                    // Clamp displayed progress to the topic total.
                                    const displayedCorrect =
                                        total > 0
                                            ? Math.min(uniqueCorrect, total)
                                            : uniqueCorrect;

                                    const pct =
                                        total > 0
                                            ? Math.min(
                                                  100,
                                                  Math.round(
                                                      (displayedCorrect /
                                                          total) *
                                                          100,
                                                  ),
                                              )
                                            : 0;
                                    return (
                                        <li
                                            key={topic.id}
                                            className={
                                                isSelected
                                                    ? 'bg-(--muted). '
                                                    : undefined
                                            }
                                        >
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    const isDesktop =
                                                        typeof window !==
                                                            'undefined' &&
                                                        window.matchMedia &&
                                                        window.matchMedia(
                                                            '(min-width: 1024px)',
                                                        ).matches;
                                                    if (isDesktop)
                                                        setSelectedId(topic.id);
                                                    else {
                                                        if (_hasSub)
                                                            setSelectedId(
                                                                topic.id,
                                                            );
                                                        else {
                                                            if (
                                                                scrollContainerRef.current
                                                            ) {
                                                                localStorage.setItem(
                                                                    'topicSelector:scrollTop',
                                                                    scrollContainerRef.current.scrollTop.toString(),
                                                                );
                                                            }
                                                            onStartQuiz(
                                                                topic.id,
                                                            );
                                                        }
                                                    }
                                                }}
                                                aria-label={`${topic.name}${_hasSub ? ' (has subtopics)' : ''}`}
                                                className="w-full flex items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-600)"
                                                style={{
                                                    color: 'var(--foreground)',
                                                }}
                                            >
                                                <span
                                                    className="text-2xl"
                                                    aria-label={`${topic.name} icon`}
                                                >
                                                    <topic.icon className="h-6 w-6" />
                                                </span>
                                                {isSelected && (
                                                    <span
                                                        className="h-2 w-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                'var(--accent-500)',
                                                        }}
                                                        aria-hidden
                                                    />
                                                )}
                                                <span className="flex-1 font-medium text-balance">
                                                    {topic.name}
                                                </span>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full border"
                                                    style={{
                                                        color: 'var(--muted-foreground)',
                                                        borderColor:
                                                            'var(--border)',
                                                    }}
                                                >
                                                    {displayedCorrect}/
                                                    {itemCount ?? '—'}
                                                </span>
                                                {_hasSub && (
                                                    <ChevronRight
                                                        className="h-4 w-4"
                                                        style={{
                                                            color: 'var(--muted-foreground)',
                                                        }}
                                                    />
                                                )}
                                            </Button>
                                            {/* Progress bar */}
                                            <div className="px-4 pb-3">
                                                <div
                                                    className="w-full h-1.5 rounded-full bg-(--muted) border"
                                                    style={{
                                                        borderColor:
                                                            'var(--border)',
                                                    }}
                                                >
                                                    <div
                                                        className="h-1.5 rounded-full"
                                                        style={{
                                                            width: `${pct}%`,
                                                            background:
                                                                'linear-gradient(90deg, var(--cta-grad-from), var(--cta-grad-to))',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Details column */}
                    <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
                        {selectedTopic ? (
                            <div
                                className={cn(
                                    `rounded-xl border  lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto lg:overscroll-contain scrollbar-sleek`,
                                    {
                                        'p-6': hasSubtopics(selectedTopic.id),
                                        'p-4': !hasSubtopics(selectedTopic.id),
                                    },
                                )}
                                style={{
                                    backgroundColor: 'var(--card)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                <div
                                    className={`flex items-start justify-between gap-4 ${hasSubtopics(selectedTopic.id) ? 'mb-4' : 'mb-2'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="text-3xl"
                                            aria-label={`${selectedTopic.name} icon`}
                                        >
                                            <selectedTopic.icon className="h-8 w-8" />
                                        </span>
                                        <div>
                                            <h3
                                                className="text-2xl font-semibold"
                                                style={{
                                                    color: 'var(--foreground)',
                                                }}
                                            >
                                                {selectedTopic.name}
                                            </h3>
                                        </div>
                                    </div>
                                    {!hasSubtopics(selectedTopic.id) && (
                                        <button
                                            type="button"
                                            aria-label="Start quiz"
                                            onClick={() => {
                                                // Save scroll position before starting quiz
                                                if (
                                                    scrollContainerRef.current
                                                ) {
                                                    localStorage.setItem(
                                                        'topicSelector:scrollTop',
                                                        scrollContainerRef.current.scrollTop.toString(),
                                                    );
                                                }
                                                onStartQuiz(selectedTopic.id);
                                            }}
                                            className="inline-flex items-center justify-center rounded-lg border h-9 w-9"
                                            style={{
                                                backgroundColor: 'var(--muted)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--foreground)',
                                            }}
                                            title="Start"
                                        >
                                            <Play className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                {hasSubtopics(selectedTopic.id) ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-2 gap-3">
                                            <h4
                                                className="text-sm font-medium"
                                                style={{
                                                    color: 'var(--muted-foreground)',
                                                }}
                                            >
                                                Subtopics
                                            </h4>
                                            <button
                                                type="button"
                                                aria-label="Start quiz for entire topic"
                                                onClick={() => {
                                                    // Save scroll position before starting quiz
                                                    if (
                                                        scrollContainerRef.current
                                                    ) {
                                                        localStorage.setItem(
                                                            'topicSelector:scrollTop',
                                                            scrollContainerRef.current.scrollTop.toString(),
                                                        );
                                                    }
                                                    onStartQuiz(
                                                        selectedTopic.id,
                                                    );
                                                }}
                                                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
                                                style={{
                                                    backgroundColor:
                                                        'var(--muted)',
                                                    borderColor:
                                                        'var(--border)',
                                                    color: 'var(--foreground)',
                                                }}
                                                title="Quiz entire topic"
                                            >
                                                <Play className="h-3 w-3" />
                                                Entire topic
                                            </button>
                                        </div>
                                        <ul
                                            role="list"
                                            className="divide-y rounded-xl border overflow-hidden"
                                            style={{
                                                borderColor: 'var(--border)',
                                            }}
                                        >
                                            {subtopicsFor(selectedTopic.id).map(
                                                (sub) => (
                                                    <li key={sub}>
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                // Save scroll position before starting subtopic quiz
                                                                if (
                                                                    scrollContainerRef.current
                                                                ) {
                                                                    localStorage.setItem(
                                                                        'topicSelector:scrollTop',
                                                                        scrollContainerRef.current.scrollTop.toString(),
                                                                    );
                                                                }
                                                                if (
                                                                    onStartSubtopic
                                                                ) {
                                                                    onStartSubtopic(
                                                                        selectedTopic.id,
                                                                        sub,
                                                                    );
                                                                } else {
                                                                    onStartQuiz(
                                                                        selectedTopic.id,
                                                                    );
                                                                }
                                                            }}
                                                            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-600)"
                                                            style={{
                                                                color: 'var(--foreground)',
                                                            }}
                                                            aria-label={`Start ${selectedTopic.name} – ${sub}`}
                                                        >
                                                            <span className="text-sm">
                                                                {sub}
                                                            </span>
                                                            <Play
                                                                className="h-3 w-3"
                                                                style={{
                                                                    color: 'var(--muted-foreground)',
                                                                }}
                                                            />
                                                        </Button>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div
                                className="rounded-xl border p-5"
                                style={{
                                    backgroundColor: 'var(--card)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--muted-foreground)' }}
                                >
                                    Select a topic to see details and subtopics.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Streak Calendar Modal */}
            {isCalendarOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    aria-modal
                    role="dialog"
                    aria-label="Daily streak calendar"
                >
                    <div
                        className="absolute inset-0"
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                        onClick={() => setIsCalendarOpen(false)}
                    />
                    <div
                        className="relative w-full max-w-md rounded-2xl shadow-2xl border"
                        style={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div
                            className="flex items-center justify-between px-5 py-3 border-b"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center gap-2">
                                <Flame
                                    className="h-5 w-5"
                                    style={{ color: 'var(--primary-600)' }}
                                />
                                <h3
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    Your Streak
                                </h3>
                            </div>
                            <Button
                                type="button"
                                onClick={() => setIsCalendarOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-sm border"
                                style={{
                                    backgroundColor: 'var(--muted)',
                                    color: 'var(--muted-foreground)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                Close
                            </Button>
                        </div>

                        <div className="px-5 py-4 flex flex-col items-center gap-3">
                            {streakRange ? (
                                <RangeCalendar
                                    aria-label="Streak range"
                                    value={{
                                        start: racParseDate(streakRange.start),
                                        end: racParseDate(streakRange.end),
                                    }}
                                    isReadOnly
                                    markedDates={markedDates}
                                />
                            ) : (
                                <Calendar
                                    aria-label="Calendar"
                                    markedDates={markedDates}
                                />
                            )}
                            <div
                                className="text-xs"
                                style={{ color: 'var(--muted-foreground)' }}
                            >
                                Current: <strong>{daily.currentStreak}</strong>{' '}
                                {daily.bestStreak ? (
                                    <>
                                        • Best:{' '}
                                        <strong>{daily.bestStreak}</strong>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
