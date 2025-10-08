'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

function Switch({
    className,
    style,
    ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    // Use brand color palette from globals.css, light/dark safe
    const palette = React.useMemo(
        () => ({
            trackOn: 'var(--primary-600)',
            thumbFrom: 'var(--primary-100)',
            thumbTo: 'var(--primary-50)',
        }),
        [],
    );

    type CSSVariableStyles = React.CSSProperties & {
        '--switch-track-on'?: string;
        '--switch-thumb-from'?: string;
        '--switch-thumb-to'?: string;
    };

    const mergedStyle = React.useMemo<CSSVariableStyles>(
        () => ({
            // Expose variables for Tailwind arbitrary values to consume
            '--switch-track-on': palette.trackOn,
            '--switch-thumb-from': palette.thumbFrom,
            '--switch-thumb-to': palette.thumbTo,
            ...(style as React.CSSProperties),
        }),
        [palette, style],
    );

    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 border-border',
                // Clear, friendly track colors (dynamic, theme-aware)
                ' data-[state=checked]:bg-[var(--switch-track-on)] data-[state=unchecked]:bg-muted',
                // Hover/Focus affordance
                ' hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
                className,
            )}
            style={mergedStyle}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    // Visible thumb with clear contrast and friendly color
                    'pointer-events-none block size-4 rounded-full border shadow-sm ring-0 will-change-transform' +
                        // Space from the left by default; keep checked travel the same
                        ' translate-x-0.5 data-[state=checked]:translate-x-5' +
                        // Colorful, readable thumb states
                        ' bg-card data-[state=unchecked]:bg-card' +
                        // Soft primary gradient when ON + clearer border
                        ' data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[var(--switch-thumb-from)] data-[state=checked]:to-[var(--switch-thumb-to)] data-[state=checked]:[border-color:var(--switch-track-on)]' +
                        // Default border when OFF
                        ' border-border' +
                        // Smooth color/transform changes
                        ' transition-[transform,background-color,border-color,box-shadow]',
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
