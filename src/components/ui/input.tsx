'use client';

import * as React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

type InputProps = React.ComponentProps<'input'>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        const localRef = React.useRef<HTMLInputElement>(null);

        // Expose the internal ref to parent refs
        React.useImperativeHandle(
            ref,
            () => localRef.current as HTMLInputElement,
        );

        const isNumber = type === 'number';

        const step = (dir: 'up' | 'down') => {
            const el = localRef.current;
            if (!el || el.disabled) return;
            if (dir === 'up') el.stepUp();
            else el.stepDown();
            // Ensure React onChange handlers fire
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.focus();
        };

        const inputClasses = cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            // Extra padding and spinner removal for number inputs
            isNumber && 'pr-9 no-spinner',
            className,
        );

        if (!isNumber) {
            return (
                <input
                    ref={localRef}
                    type={type}
                    data-slot="input"
                    suppressHydrationWarning
                    className={inputClasses}
                    {...props}
                />
            );
        }

        const disabled = Boolean(props.disabled);
        const inputId = props.id;

        return (
            <div className="relative">
                <input
                    ref={localRef}
                    type={type}
                    data-slot="input"
                    suppressHydrationWarning
                    className={inputClasses}
                    {...props}
                />
                {/* Custom elegant steppers */}
                <div className="pointer-events-none absolute inset-y-0 right-1 my-1 flex w-7 select-none flex-col overflow-hidden rounded-md">
                    <button
                        type="button"
                        aria-label="Increment"
                        aria-controls={inputId}
                        tabIndex={-1}
                        disabled={disabled}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.preventDefault();
                            step('up');
                        }}
                        className="pointer-events-auto flex h-1/2 items-center justify-center rounded-t-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent/80 disabled:opacity-40"
                    >
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <div className="h-px w-full bg-border" />
                    <button
                        type="button"
                        aria-label="Decrement"
                        aria-controls={inputId}
                        tabIndex={-1}
                        disabled={disabled}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.preventDefault();
                            step('down');
                        }}
                        className="pointer-events-auto flex h-1/2 items-center justify-center rounded-b-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent/80 disabled:opacity-40"
                    >
                        <ChevronDown
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>
        );
    },
);

Input.displayName = 'Input';

export { Input };
