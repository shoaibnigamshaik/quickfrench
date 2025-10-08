'use client';

import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ThemeKey = 'light' | 'dark' | 'system';

const themes: Array<{
    key: ThemeKey;
    icon: typeof Monitor;
    label: string;
}> = [
    { key: 'system', icon: Monitor, label: 'System theme' },
    { key: 'light', icon: Sun, label: 'Light theme' },
    { key: 'dark', icon: Moon, label: 'Dark theme' },
];

export type ThemeSwitcherProps = {
    value?: ThemeKey;
    onChange?: (theme: ThemeKey) => void;
    defaultValue?: ThemeKey;
    className?: string;
};

export function ThemeSwitcher({
    value,
    onChange,
    defaultValue,
    className,
}: ThemeSwitcherProps) {
    // Lightweight controllable state implementation (Radix-like)
    const isControlled = useMemo(() => value !== undefined, [value]);
    const [uncontrolled, setUncontrolled] = useState<ThemeKey | undefined>(
        defaultValue,
    );
    const theme = (isControlled ? value : uncontrolled) as ThemeKey | undefined;
    const setTheme = useCallback(
        (next: ThemeKey) => {
            if (!isControlled) setUncontrolled(next);
            onChange?.(next);
        },
        [isControlled, onChange],
    );
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fallback: apply theme if parent didn't provide onChange
    useEffect(() => {
        if (!mounted || !theme || onChange) return;
        const root = document.documentElement;
        if (theme === 'system') {
            const media = window.matchMedia('(prefers-color-scheme: dark)');
            const apply = () => root.classList.toggle('dark', media.matches);
            apply();
            // Note: we don't add listeners here to keep component self-contained;
            // the parent page handles system syncing if desired.
            localStorage.setItem('theme', 'auto');
        } else {
            root.classList.toggle('dark', theme === 'dark');
            localStorage.setItem('theme', theme);
        }
    }, [mounted, theme, onChange]);

    if (!mounted) return null;

    return (
        <div
            className={cn(
                'relative flex h-8 rounded-full p-1 border',
                className,
            )}
            style={{
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)',
            }}
        >
            {themes.map(({ key, icon: Icon, label }) => {
                const isActive = theme === key;
                return (
                    <button
                        type="button"
                        key={key}
                        className="relative h-6 w-6 rounded-full"
                        onClick={() => setTheme(key)}
                        aria-label={label}
                        style={{
                            color: isActive
                                ? 'var(--foreground)'
                                : 'var(--muted-foreground)',
                        }}
                    >
                        {isActive && (
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    backgroundColor: 'var(--primary-100)',
                                    boxShadow:
                                        '0 1px 2px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06)',
                                    transition:
                                        'background-color 200ms ease, transform 200ms ease',
                                }}
                            />
                        )}
                        <Icon className={cn('relative m-auto h-4 w-4')} />
                    </button>
                );
            })}
        </div>
    );
}

export default ThemeSwitcher;
