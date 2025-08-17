import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Expand morphological gender markers like "lourd(e)" into
// "lourd (m) / lourde (f)" for clearer TTS. Handles multiple occurrences.
// Example: "petit(e)" -> "petit (m) / petite (f)"
//          "bon(ne)"  -> "bon (m) / bonne (f)"
//          "animé(e)" -> "animé (m) / animée (f)"
export function expandGenderedParentheticalsForSpeech(text: string): string {
  if (!text) return text;
  // Use a global unicode-aware regex to find word+(suffix) patterns
  const re = /([A-Za-zÀ-ÖØ-öø-ÿŒœÇç]+)\(([^()\s]+)\)/gu;
  // Replace each occurrence independently; if multiple occur, we expand each inline
  return text.replace(re, (_m, base: string, suffix: string) => {
    return `${base} (m) / ${base}${suffix} (f)`;
  });
}

// Given a string that may contain morphological parentheticals like "lourd(e)",
// return all plain-text variants by expanding each occurrence into both forms.
// Example: "lourd(e)" -> ["lourd", "lourde"]
//          "le plus petit(e)" -> ["le plus petit", "le plus petite"]
export function expandMorphologicalParentheticals(text: string): string[] {
  if (!text) return [text];
  const re = /([A-Za-zÀ-ÖØ-öø-ÿŒœÇç]+)\(([^()\s]+)\)/u;

  const expandOnce = (s: string): string[] => {
    const m = s.match(re);
    if (!m) return [s];
    const [full, base, suffix] = m as unknown as [string, string, string];
    const before = s.slice(0, m.index!);
    const after = s.slice(m.index! + full.length);
    // Two variants: masculine (base), feminine (base+suffix)
    const masculine = before + base + after;
    const feminine = before + base + suffix + after;
    return [masculine, feminine];
  };

  // Recursively expand until no more patterns, breadth-first to cover multiple occurrences
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
    const t = s.replace(/\s+/g, " ").trim();
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out.length ? out : [text];
}
