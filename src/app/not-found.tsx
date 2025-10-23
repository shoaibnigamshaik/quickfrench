import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileSearch, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <section
            aria-labelledby="not-found-heading"
            className="flex flex-col items-center justify-center gap-8 py-16 md:py-24 text-center"
        >
            <div className="inline-flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-[var(--muted)] p-3">
                        <FileSearch
                            aria-hidden
                            className="h-8 w-8 text-[var(--primary-600)]"
                        />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-mono text-[var(--muted-foreground)]">
                            404 — Not Found
                        </p>
                        <h1
                            id="not-found-heading"
                            className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl"
                        >
                            Oops, page not found
                        </h1>
                    </div>
                </div>
            </div>

            <p className="max-w-xl text-pretty text-[var(--muted-foreground)]">
                The page you're looking for doesn't exist. Head back home to
                pick a topic and continue practicing.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                    <Link href="/" aria-label="Back to home">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                </Button>
            </div>
        </section>
    );
}
