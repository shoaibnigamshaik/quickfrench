import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Expand simple parenthetical gender forms like "lourd(e)" into a spoken-friendly
// form "lourd (m) / lourde (f)".
export function expandGenderedParentheticalsForSpeech(text: string): string {
    if (!text) return text;
    // Global unicode-aware regex to find word+(suffix) patterns
    const re = /([A-Za-zÀ-ÖØ-öø-ÿŒœÇç]+)\(([^()\s]+)\)/gu;
    // Replace each occurrence inline
    return text.replace(re, (_m, base: string, suffix: string) => {
        return `${base} (m) / ${base}${suffix} (f)`;
    });
}

// Expand morphological parentheticals into all plain-text variants (e.g. "lourd(e)" -> ["lourd", "lourde"]).
export function expandMorphologicalParentheticals(text: string): string[] {
    if (!text) return [text];
    const re = /([A-Za-zÀ-ÖØ-öø-ÿŒœÇç]+)\(([^()\s]+)\)/u;

    const expandOnce = (s: string): string[] => {
        const m = s.match(re);
        if (!m) return [s];
        const [full, base, suffix] = m as unknown as [string, string, string];
        const before = s.slice(0, m.index!);
        const after = s.slice(m.index! + full.length);
        // Two variants: masculine (base) and feminine (base+suffix)
        const masculine = before + base + after;
        const feminine = before + base + suffix + after;
        return [masculine, feminine];
    };

    // Recursively expand breadth-first until no more patterns
    let results = [text];
    while (true) {
        const next: string[] = [];
        let changed = false;
        for (const s of results) {
            const variants = expandOnce(s);
            if (variants.length === 2) changed = true;
            next.push(...variants);
        }
        results = next;
        if (!changed) break;
    }
    // Deduplicate
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of results) {
        const t = s.replace(/\s+/g, ' ').trim();
        if (!seen.has(t)) {
            seen.add(t);
            out.push(t);
        }
    }
    return out.length ? out : [text];
}
