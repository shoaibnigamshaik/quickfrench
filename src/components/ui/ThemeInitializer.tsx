'use client';

import { useEffect } from 'react';

export function ThemeInitializer() {
    useEffect(() => {
        // Apply theme on mount to handle initial load
        const applyTheme = () => {
            try {
                const storageKey = 'theme';
                const root = document.documentElement;
                const stored = localStorage.getItem(storageKey);
                const prefersDark = window.matchMedia(
                    '(prefers-color-scheme: dark)',
                ).matches;
                const shouldDark =
                    stored === 'dark' ||
                    ((stored === 'auto' || !stored) && prefersDark);
                root.classList.toggle('dark', shouldDark);
            } catch (error) {
                // Fallback to system preference if localStorage is not available
                console.error('Error applying theme:', error);
                const prefersDark = window.matchMedia(
                    '(prefers-color-scheme: dark)',
                ).matches;
                document.documentElement.classList.toggle('dark', prefersDark);
            }
        };

        applyTheme();

        // Listen for system theme changes when theme is set to 'auto' or not set
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const stored = localStorage.getItem('theme');
            if (stored === 'auto' || !stored) {
                document.documentElement.classList.toggle(
                    'dark',
                    mediaQuery.matches,
                );
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return null; // This component doesn't render anything
}
