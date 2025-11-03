'use client';

import {
    getStorageItem as getLS,
    setStorageItem as setLS,
} from '@/lib/storage';

import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Palette,
    HelpCircle,
    Info,
    CheckCircle,
    LucideIcon,
    Timer,
    FastForward,
    RefreshCw,
    Sliders,
} from 'lucide-react';

import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { resetProgress } from '@/lib/progress';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface SettingItem {
    id:
        | 'theme'
        | 'quiz-mode'
        | 'timer'
        | 'srs-review'
        | 'question-count'
        | 'auto-advance'
        | 'speech';
    icon: LucideIcon;
    label: string;
    description: string;
    type: 'select' | 'quiz-mode' | 'question-count' | 'auto-advance' | 'speech';
    value?: boolean | string;
    options?: string[];
}

interface SettingSection {
    title: string;
    items: SettingItem[];
}

const SettingsPage = () => {
    // Constants/helpers
    const SPEECH_EVENT = 'quickfrench:speechSettingsChanged' as const;
    const dispatchSpeechChanged = () =>
        window.dispatchEvent?.(new CustomEvent(SPEECH_EVENT));

    // Theme: delegate to ThemeSwitcher (single source of truth)
    const [themeDefault] = React.useState<'light' | 'dark' | 'system'>(() => {
        const savedTheme = (getLS('theme') || 'auto').toLowerCase();
        return savedTheme === 'light' || savedTheme === 'dark'
            ? (savedTheme as 'light' | 'dark')
            : 'system';
    });
    const [themeReady, setThemeReady] = React.useState(false);
    const [quizMode, setQuizMode] = React.useState<
        'multiple-choice' | 'typing' | 'hybrid'
    >(() => {
        const saved = getLS('quizMode');
        return saved === 'typing' ||
            saved === 'multiple-choice' ||
            saved === 'hybrid'
            ? (saved as 'multiple-choice' | 'typing' | 'hybrid')
            : 'multiple-choice';
    });
    const [questionCount, setQuestionCount] = React.useState<number | 'all'>(
        () => {
            const saved = getLS('questionCount');
            if (!saved) return 10;
            if (saved === 'all') return 'all';
            const n = parseInt(saved, 10);
            return Number.isNaN(n) ? 10 : Math.max(1, Math.min(50, n));
        },
    );
    const [autoAdvance, setAutoAdvance] = React.useState<boolean>(() => {
        const saved = getLS('autoAdvance');
        return saved === null ? true : saved === 'true';
    });
    const [autoAdvanceDelaySec, setAutoAdvanceDelaySec] =
        React.useState<number>(() => {
            const saved = getLS('autoAdvanceDelayMs');
            if (!saved) return 1.0;
            const ms = parseInt(saved, 10);
            if (Number.isNaN(ms)) return 1.0;
            const clamped = Math.min(Math.max(ms, 300), 5000);
            return clamped / 1000;
        });
    const [timerEnabled, setTimerEnabled] = React.useState<boolean>(() => {
        return getLS('timerEnabled') === 'true';
    });
    const [timerDurationSec, setTimerDurationSec] = React.useState<number>(
        () => {
            const saved = getLS('timerDurationSec');
            if (!saved) return 30;
            const n = parseInt(saved, 10);
            if (Number.isNaN(n)) return 30;
            return Math.min(Math.max(n, 5), 300);
        },
    );
    const [isSpeechOpen, setIsSpeechOpen] = React.useState(false);

    // Spaced repetition: always enabled; only persist per-session new items cap
    const [srsNewPerSession, setSrsNewPerSession] = React.useState<
        number | undefined
    >(() => {
        const v = getLS('srsNewPerSession');
        if (!v) return 10;
        const n = parseInt(v, 10);
        return Number.isNaN(n) ? 10 : Math.max(1, Math.min(50, n));
    });

    // Speech-related state
    const [speechVoiceURI, setSpeechVoiceURI] = React.useState<string | null>(
        () => getLS('speechVoiceURI'),
    );
    const [speechVolume, setSpeechVolume] = React.useState<number>(() => {
        const v = getLS('speechVolume');
        return v ? parseFloat(v) : 1;
    });
    const [speechPitch, setSpeechPitch] = React.useState<number>(() => {
        const v = getLS('speechPitch');
        return v ? parseFloat(v) : 1;
    });
    const [speechRate, setSpeechRate] = React.useState<number>(() => {
        const v = getLS('speechRate');
        return v ? parseFloat(v) : 1;
    });

    // Speech synthesis setup
    const [availableVoices, setAvailableVoices] = React.useState<
        SpeechSynthesisVoice[]
    >([]);
    const frenchVoices = availableVoices.filter((v) =>
        v.lang.toLowerCase().startsWith('fr'),
    );
    const selectedVoice = frenchVoices.find(
        (v) => v.voiceURI === speechVoiceURI,
    );
    const isFirefoxLike =
        typeof navigator !== 'undefined' &&
        (navigator.userAgent.includes('Firefox') ||
            navigator.userAgent.includes('Zen'));

    // Load available voices
    React.useEffect(() => {
        const loadVoices = () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const voices = speechSynthesis.getVoices();
                setAvailableVoices(voices);
            }
        };

        loadVoices();

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            speechSynthesis.addEventListener('voiceschanged', loadVoices);
            return () =>
                speechSynthesis.removeEventListener(
                    'voiceschanged',
                    loadVoices,
                );
        }
    }, []);

    // Theme ready effect
    React.useEffect(() => {
        setThemeReady(true);
    }, []);

    // Handler functions
    const updateSpeechSetting = (key: string, value: number) => {
        if (key === 'speechVolume') setSpeechVolume(value);
        else if (key === 'speechPitch') setSpeechPitch(value);
        else if (key === 'speechRate') setSpeechRate(value);

        setLS(key, value.toString());
        dispatchSpeechChanged();
    };

    const testSpeak = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window))
            return;

        const utterance = new SpeechSynthesisUtterance(
            'Bonjour, comment allez-vous?',
        );
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.volume = speechVolume;
        utterance.pitch = speechPitch;
        utterance.rate = speechRate;

        speechSynthesis.speak(utterance);
    };

    const handleQuizModeChange = (
        mode: 'multiple-choice' | 'typing' | 'hybrid',
    ) => {
        setQuizMode(mode);
        setLS('quizMode', mode);
    };

    const handleQuestionCountChange = (count: number | 'all') => {
        setQuestionCount(count);
        setLS('questionCount', count.toString());
    };

    const handleAutoAdvanceChange = () => {
        const newValue = !autoAdvance;
        setAutoAdvance(newValue);
        setLS('autoAdvance', newValue.toString());
    };

    const handleAutoAdvanceDelayChangeSec = (sec: number) => {
        const clamped = Math.max(0.3, Math.min(5.0, sec));
        setAutoAdvanceDelaySec(clamped);
        setLS('autoAdvanceDelayMs', (clamped * 1000).toString());
    };

    const handleTimerToggle = () => {
        const newValue = !timerEnabled;
        setTimerEnabled(newValue);
        setLS('timerEnabled', newValue.toString());
    };

    const handleTimerDurationChange = (duration: number) => {
        const clamped = Math.max(5, Math.min(300, duration));
        setTimerDurationSec(clamped);
        setLS('timerDurationSec', clamped.toString());
    };

    // Settings sections configuration
    const settingsSections: SettingSection[] = [
        {
            title: 'Quiz Preferences',
            items: [
                {
                    id: 'quiz-mode',
                    icon: CheckCircle,
                    label: 'Quiz Mode',
                    description:
                        'Choose between multiple choice or typing questions',
                    type: 'quiz-mode' as const,
                },
                {
                    id: 'question-count',
                    icon: HelpCircle,
                    label: 'Question Count',
                    description: 'Number of questions per quiz session',
                    type: 'question-count' as const,
                },
                {
                    id: 'theme',
                    icon: Palette,
                    label: 'Theme',
                    description: 'Choose your preferred color scheme',
                    type: 'select' as const,
                },
                {
                    id: 'timer',
                    icon: Timer,
                    label: 'Timer',
                    description: 'Add time pressure to your quiz sessions',
                    type: 'auto-advance' as const,
                    value: timerEnabled,
                },
                {
                    id: 'auto-advance',
                    icon: FastForward,
                    label: 'Auto Advance',
                    description:
                        'Automatically move to next question after correct answer',
                    type: 'auto-advance' as const,
                    value: autoAdvance,
                },
                {
                    id: 'speech',
                    icon: Sliders,
                    label: 'Speech',
                    description:
                        'Choose voice and fine-tune volume, pitch, speed',
                    type: 'speech' as const,
                },
            ],
        },
        {
            title: 'Review Preferences',
            items: [
                {
                    id: 'srs-review',
                    icon: RefreshCw,
                    label: 'Spaced Repetition',
                    description:
                        'Prioritize due items; add new ones as needed.',
                    type: 'auto-advance' as const, // reuse layout for custom row below
                },
            ],
        },
    ];

    const SliderRow: React.FC<{
        label: string;
        value: number;
        min: number;
        max: number;
        step: number;
        format: (v: number) => string;
        fillPct: (v: number) => number;
        onChange: (v: number) => void;
        aria: string;
    }> = ({
        label,
        value,
        min,
        max,
        step,
        format,
        fillPct,
        onChange,
        aria,
    }) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label
                    className="text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                >
                    {label}
                </label>
                <span
                    className="text-xs"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    {format(value)}
                </span>
            </div>
            <Input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none"
                style={{
                    background: `linear-gradient(90deg, var(--primary-600) 0%, var(--primary-600) ${fillPct(
                        value,
                    )}%, var(--border) ${fillPct(value)}%)`,
                }}
                aria-label={aria}
            />
        </div>
    );

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="max-w-4xl mx-auto p-4">
                <div className="mb-8">
                    <div className="flex items-center mb-6">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-200 transform hover:scale-105 mr-4"
                            style={{
                                backgroundColor: 'var(--card)',
                                borderColor: 'var(--border)',
                            }}
                        >
                            <ArrowLeft
                                className="h-6 w-6"
                                style={{ color: 'var(--muted-foreground)' }}
                            />
                            <span className="sr-only">Back</span>
                        </Link>
                        <div>
                            <h1
                                className="text-3xl font-bold"
                                style={{ color: 'var(--foreground)' }}
                            >
                                Settings
                            </h1>
                            <p style={{ color: 'var(--muted-foreground)' }}>
                                Customize your learning experience
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="space-y-8">
                    {settingsSections.map((section) => (
                        <section key={section.title} className="space-y-2">
                            <h2
                                className="text-xl font-bold pb-2 border-b"
                                style={{
                                    color: 'var(--foreground)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                {section.title}
                            </h2>

                            <div className="">
                                {section.items.map((item, idx) => (
                                    <div
                                        key={item.label}
                                        className="py-4 grid grid-cols-1 md:grid-cols-2 gap-3"
                                        style={
                                            idx !== section.items.length - 1
                                                ? {
                                                      borderBottom:
                                                          '1px solid var(--border)',
                                                  }
                                                : undefined
                                        }
                                    >
                                        <div className="flex items-start gap-3">
                                            <item.icon
                                                className="h-5 w-5 mt-0.5"
                                                style={{
                                                    color: 'var(--muted-foreground)',
                                                }}
                                            />
                                            <div>
                                                <h3
                                                    className="font-semibold"
                                                    style={{
                                                        color: 'var(--foreground)',
                                                    }}
                                                >
                                                    {item.label}
                                                </h3>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: 'var(--muted-foreground)',
                                                    }}
                                                >
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end md:justify-self-end">
                                            {item.type === 'quiz-mode' && (
                                                <RadioGroup
                                                    value={quizMode}
                                                    onValueChange={(v) =>
                                                        handleQuizModeChange(
                                                            v as
                                                                | 'multiple-choice'
                                                                | 'typing'
                                                                | 'hybrid',
                                                        )
                                                    }
                                                    className="space-y-2"
                                                >
                                                    {[
                                                        {
                                                            value: 'multiple-choice' as const,
                                                            label: 'Multiple Choice',
                                                            tips: [
                                                                'Select from 4 options',
                                                                'Use keys 1-4 to select',
                                                                'Space/Enter for next',
                                                                'R to restart',
                                                            ],
                                                        },
                                                        {
                                                            value: 'typing' as const,
                                                            label: 'Typing',
                                                            tips: [
                                                                'Type the English meaning',
                                                                'Type your answer',
                                                                'Enter to submit',
                                                                'Space for next question',
                                                            ],
                                                        },
                                                        {
                                                            value: 'hybrid' as const,
                                                            label: 'Hybrid',
                                                            tips: [
                                                                'Start by typing',
                                                                'Press Ctrl + Enter or click to show options',
                                                                'Then answer like MCQ',
                                                                'Best for active recall',
                                                            ],
                                                        },
                                                    ].map((opt) => (
                                                        <div
                                                            key={opt.value}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <RadioGroupItem
                                                                value={
                                                                    opt.value
                                                                }
                                                            />
                                                            <Label className="text-sm">
                                                                {opt.label}
                                                            </Label>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            aria-label={`More info: ${opt.label}`}
                                                                            className="inline-flex items-center justify-center p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
                                                                            style={{
                                                                                color: 'var(--muted-foreground)',
                                                                                outlineColor:
                                                                                    'var(--primary-600)',
                                                                            }}
                                                                        >
                                                                            <Info
                                                                                className="h-4 w-4"
                                                                                aria-hidden
                                                                            />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent
                                                                        className="border"
                                                                        style={{
                                                                            backgroundColor:
                                                                                'var(--card)',
                                                                            color: 'var(--foreground)',
                                                                            borderColor:
                                                                                'var(--border)',
                                                                        }}
                                                                    >
                                                                        <div className="font-semibold mb-1">
                                                                            {
                                                                                opt.label
                                                                            }
                                                                        </div>
                                                                        <ul className="list-disc pl-4 space-y-0.5">
                                                                            {opt.tips.map(
                                                                                (
                                                                                    t,
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            t
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            t
                                                                                        }
                                                                                    </li>
                                                                                ),
                                                                            )}
                                                                        </ul>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            )}

                                            {item.type === 'question-count' && (
                                                <div className="space-y-3 w-full md:w-auto">
                                                    {/* Segmented control */}
                                                    <div className="flex flex-wrap gap-2 md:justify-end">
                                                        {[5, 10, 15, 20].map(
                                                            (count) => (
                                                                <Button
                                                                    type="button"
                                                                    key={count}
                                                                    onClick={() =>
                                                                        handleQuestionCountChange(
                                                                            count,
                                                                        )
                                                                    }
                                                                    className="px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 border"
                                                                    style={
                                                                        questionCount ===
                                                                        count
                                                                            ? {
                                                                                  backgroundColor:
                                                                                      'transparent',
                                                                                  color: 'var(--foreground)',
                                                                                  borderColor:
                                                                                      'var(--primary-600)',
                                                                              }
                                                                            : {
                                                                                  backgroundColor:
                                                                                      'transparent',
                                                                                  color: 'var(--foreground)',
                                                                                  borderColor:
                                                                                      'var(--border)',
                                                                              }
                                                                    }
                                                                >
                                                                    {count}
                                                                </Button>
                                                            ),
                                                        )}
                                                        <Button
                                                            type="button"
                                                            onClick={() =>
                                                                handleQuestionCountChange(
                                                                    'all',
                                                                )
                                                            }
                                                            className="px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 border"
                                                            style={
                                                                questionCount ===
                                                                'all'
                                                                    ? {
                                                                          backgroundColor:
                                                                              'transparent',
                                                                          color: 'var(--foreground)',
                                                                          borderColor:
                                                                              'var(--primary-600)',
                                                                      }
                                                                    : {
                                                                          backgroundColor:
                                                                              'transparent',
                                                                          color: 'var(--foreground)',
                                                                          borderColor:
                                                                              'var(--border)',
                                                                      }
                                                            }
                                                        >
                                                            All
                                                        </Button>
                                                    </div>

                                                    {/* Always-visible numeric field */}
                                                    <div className="flex items-center md:justify-end gap-2">
                                                        <label
                                                            className="text-sm"
                                                            style={{
                                                                color: 'var(--muted-foreground)',
                                                            }}
                                                        >
                                                            Or enter a number:
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={50}
                                                            value={
                                                                typeof questionCount ===
                                                                'number'
                                                                    ? questionCount
                                                                    : 10
                                                            }
                                                            onChange={(e) => {
                                                                const value =
                                                                    parseInt(
                                                                        e.target
                                                                            .value ||
                                                                            '10',
                                                                        10,
                                                                    );
                                                                if (
                                                                    !Number.isNaN(
                                                                        value,
                                                                    )
                                                                ) {
                                                                    const clamped =
                                                                        Math.max(
                                                                            1,
                                                                            Math.min(
                                                                                50,
                                                                                value,
                                                                            ),
                                                                        );
                                                                    handleQuestionCountChange(
                                                                        clamped,
                                                                    );
                                                                }
                                                            }}
                                                            className="w-24 px-3 py-2 rounded-lg text-sm focus:outline-none"
                                                            style={{
                                                                backgroundColor:
                                                                    'var(--card)',
                                                                color: 'var(--foreground)',
                                                                border: `1px solid var(--border)`,
                                                            }}
                                                            aria-label="Custom question count"
                                                        />
                                                        <span
                                                            className="text-xs"
                                                            style={{
                                                                color: 'var(--muted-foreground)',
                                                            }}
                                                        >
                                                            (1–50)
                                                        </span>
                                                    </div>

                                                    <div className="text-right">
                                                        <p
                                                            className="text-xs"
                                                            style={{
                                                                color: 'var(--muted-foreground)',
                                                            }}
                                                        >
                                                            Selected:{' '}
                                                            <strong>
                                                                {questionCount ===
                                                                'all'
                                                                    ? 'All available questions'
                                                                    : `${questionCount} questions`}
                                                            </strong>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* translation-direction removed; handled elsewhere */}

                                            {item.type === 'auto-advance' && (
                                                <div className="flex items-center gap-4">
                                                    {item.id ===
                                                    'auto-advance' ? (
                                                        <div className="flex items-center gap-2">
                                                            <label
                                                                className="text-sm"
                                                                style={{
                                                                    color: 'var(--muted-foreground)',
                                                                }}
                                                            >
                                                                Delay (s):
                                                            </label>
                                                            <Switch
                                                                checked={
                                                                    autoAdvance
                                                                }
                                                                onCheckedChange={() =>
                                                                    handleAutoAdvanceChange()
                                                                }
                                                                aria-label="Toggle auto advance"
                                                            />
                                                            <Input
                                                                type="number"
                                                                min={0.3}
                                                                max={5.0}
                                                                step={0.1}
                                                                value={
                                                                    autoAdvanceDelaySec
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const v =
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value ||
                                                                                '1',
                                                                        );
                                                                    if (
                                                                        !Number.isNaN(
                                                                            v,
                                                                        )
                                                                    )
                                                                        handleAutoAdvanceDelayChangeSec(
                                                                            v,
                                                                        );
                                                                }}
                                                                disabled={
                                                                    !autoAdvance
                                                                }
                                                                className="w-24"
                                                                aria-label="Auto-advance delay in seconds"
                                                                aria-labelledby={`setting-${section.title}-${idx}`}
                                                            />
                                                            <span
                                                                className="text-sm"
                                                                style={{
                                                                    color: 'var(--muted-foreground)',
                                                                }}
                                                            >
                                                                s
                                                            </span>
                                                        </div>
                                                    ) : item.id === 'timer' ? (
                                                        <div className="flex items-center gap-2">
                                                            <label
                                                                className="text-sm"
                                                                style={{
                                                                    color: 'var(--muted-foreground)',
                                                                }}
                                                            >
                                                                Seconds:
                                                            </label>
                                                            <Switch
                                                                checked={
                                                                    timerEnabled
                                                                }
                                                                onCheckedChange={() =>
                                                                    handleTimerToggle()
                                                                }
                                                                aria-label="Toggle timer"
                                                            />
                                                            <Input
                                                                type="number"
                                                                min={5}
                                                                max={300}
                                                                step={5}
                                                                value={
                                                                    timerDurationSec
                                                                }
                                                                onChange={(e) =>
                                                                    handleTimerDurationChange(
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value ||
                                                                                '30',
                                                                            10,
                                                                        ),
                                                                    )
                                                                }
                                                                disabled={
                                                                    !timerEnabled
                                                                }
                                                                className="w-24"
                                                                aria-label="Timer duration in seconds"
                                                                aria-labelledby={`setting-${section.title}-${idx}`}
                                                            />
                                                            <span
                                                                className="text-sm"
                                                                style={{
                                                                    color: 'var(--muted-foreground)',
                                                                }}
                                                            >
                                                                s
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <label
                                                                className="text-sm"
                                                                style={{
                                                                    color: 'var(--muted-foreground)',
                                                                }}
                                                            >
                                                                Max new per
                                                                quiz:
                                                            </label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={50}
                                                                step={1}
                                                                value={
                                                                    srsNewPerSession ??
                                                                    10
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const n =
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value ||
                                                                                '10',
                                                                            10,
                                                                        );
                                                                    const clamped =
                                                                        Math.max(
                                                                            1,
                                                                            Math.min(
                                                                                50,
                                                                                n,
                                                                            ),
                                                                        );
                                                                    setSrsNewPerSession(
                                                                        clamped,
                                                                    );
                                                                    setLS(
                                                                        'srsNewPerSession',
                                                                        String(
                                                                            clamped,
                                                                        ),
                                                                    );
                                                                }}
                                                                className="w-24"
                                                                aria-label="SRS new items per quiz"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Removed generic select; Theme uses ThemeSwitcher below */}

                                            {item.type === 'select' &&
                                                item.label === 'Theme' &&
                                                themeReady && (
                                                    <ThemeSwitcher
                                                        defaultValue={
                                                            themeDefault
                                                        }
                                                        className="ml-2"
                                                    />
                                                )}

                                            {/* Cache controls removed */}

                                            {item.type === 'speech' && (
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsSpeechOpen(true)
                                                    }
                                                >
                                                    Open
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between">
                    <span
                        className="text-sm"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        Changes will take effect immediately
                    </span>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => {
                                if (
                                    confirm(
                                        'Reset all learning progress? This cannot be undone.',
                                    )
                                ) {
                                    resetProgress();
                                }
                            }}
                            className="inline-flex items-center px-4 py-2 rounded-lg border text-sm"
                            style={{
                                backgroundColor: 'var(--danger-100)',
                                color: 'var(--danger-600)',
                                borderColor: 'var(--danger-500)',
                            }}
                        >
                            Reset Progress
                        </Button>
                    </div>
                </div>
            </div>

            {/* Speech Settings Dialog */}
            <div className="dialog-overlay-opaque">
                <Dialog open={isSpeechOpen} onOpenChange={setIsSpeechOpen}>
                    <DialogContent
                        className="max-w-lg"
                        style={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sliders className="h-5 w-5" />
                                <span>Speech Settings</span>
                            </DialogTitle>
                        </DialogHeader>

                        {/* Voice picker */}
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium"
                                style={{ color: 'var(--foreground)' }}
                                id="voice-label"
                            >
                                Voice (French only)
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Select
                                        value={speechVoiceURI ?? undefined}
                                        onValueChange={(v) => {
                                            setSpeechVoiceURI(v);
                                            setLS('speechVoiceURI', v);
                                            dispatchSpeechChanged();
                                        }}
                                    >
                                        <SelectTrigger
                                            aria-labelledby="voice-label"
                                            aria-label="French voice selector"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    selectedVoice
                                                        ? `${selectedVoice.name} (${selectedVoice.lang})`
                                                        : frenchVoices.length
                                                          ? 'Choose a French voice'
                                                          : 'No French voices available'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="border"
                                            style={{
                                                backgroundColor: 'var(--card)',
                                                color: 'var(--foreground)',
                                                borderColor: 'var(--border)',
                                            }}
                                        >
                                            {frenchVoices.map((v) => (
                                                <SelectItem
                                                    key={v.voiceURI}
                                                    value={v.voiceURI}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="truncate">
                                                            {v.name}
                                                        </span>
                                                        <span
                                                            className="text-xs"
                                                            style={{
                                                                color: 'var(--muted-foreground)',
                                                            }}
                                                        >
                                                            {v.lang}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {frenchVoices.length === 0 && (
                                                <div
                                                    className="px-3 py-2 text-sm"
                                                    style={{
                                                        color: 'var(--muted-foreground)',
                                                    }}
                                                >
                                                    No French voices found.
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={testSpeak}
                                    disabled={frenchVoices.length === 0}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-sm border',
                                        frenchVoices.length === 0 &&
                                            'opacity-60 cursor-not-allowed',
                                    )}
                                    style={{
                                        backgroundColor: 'var(--primary-100)',
                                        color: 'var(--primary-700)',
                                        borderColor: 'var(--border)',
                                    }}
                                    aria-disabled={frenchVoices.length === 0}
                                >
                                    Test
                                </Button>
                            </div>
                            {availableVoices.length === 0 && (
                                <p
                                    className="text-xs"
                                    style={{ color: 'var(--muted-foreground)' }}
                                >
                                    Loading voices… If none appear, your browser
                                    may block or not fully support the Speech
                                    Synthesis API (e.g., some Firefox-based
                                    browsers require system voices).
                                </p>
                            )}
                            {availableVoices.length === 0 && isFirefoxLike && (
                                <div
                                    className="mt-2 text-xs space-y-1"
                                    style={{ color: 'var(--muted-foreground)' }}
                                >
                                    <div>Tip for Firefox/Zen:</div>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            Install a French system TTS voice
                                            (required by Firefox).
                                        </li>
                                        <li>
                                            Linux: install speech-dispatcher + a
                                            French voice (e.g., espeak-ng +
                                            mbrola-fr) then restart Firefox.
                                        </li>
                                        <li>
                                            Windows: Settings → Time & Language
                                            → Speech → Manage voices → Add
                                            voices → French.
                                        </li>
                                        <li>
                                            macOS: System Settings →
                                            Accessibility → Spoken Content →
                                            System Voice → Add… → French.
                                        </li>
                                        <li>
                                            Android: Settings →
                                            System/Accessibility →
                                            Text-to-speech → Install French
                                            voice data.
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sliders */}
                        <SliderRow
                            label="Volume"
                            value={speechVolume}
                            min={0}
                            max={1}
                            step={0.01}
                            format={(v) => v.toFixed(2)}
                            fillPct={(v) => v * 100}
                            onChange={(v) =>
                                updateSpeechSetting('speechVolume', v)
                            }
                            aria="Speech volume"
                        />
                        <SliderRow
                            label="Pitch"
                            value={speechPitch}
                            min={0}
                            max={2}
                            step={0.01}
                            format={(v) => v.toFixed(2)}
                            fillPct={(v) => (v / 2) * 100}
                            onChange={(v) =>
                                updateSpeechSetting('speechPitch', v)
                            }
                            aria="Speech pitch"
                        />
                        <SliderRow
                            label="Speed"
                            value={speechRate}
                            min={0.5}
                            max={2}
                            step={0.01}
                            format={(v) => `${v.toFixed(2)}x`}
                            fillPct={(v) => ((v - 0.5) / 1.5) * 100}
                            onChange={(v) =>
                                updateSpeechSetting('speechRate', v)
                            }
                            aria="Speech speed"
                        />

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                onClick={() => {
                                    setSpeechVolume(1);
                                    setSpeechPitch(1);
                                    setSpeechRate(1);
                                    setLS('speechVolume', '1');
                                    setLS('speechPitch', '1');
                                    setLS('speechRate', '1');
                                    dispatchSpeechChanged();
                                }}
                                className="border"
                            >
                                Reset
                            </Button>
                            <Button onClick={() => setIsSpeechOpen(false)}>
                                Done
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default SettingsPage;
