import { useState, useCallback } from 'react';
import { VocabularyItem } from '@/types/quiz';
import { vocabularyService } from '@/lib/cache-service';

export const useVocabulary = () => {
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVocabulary = useCallback(
        async (topic: string, _subCategory?: string) => {
            try {
                setLoading(true);
                setError(null);
                // Intentionally unused: subtopic filtering is applied later in question generation
                void _subCategory;

                let data: VocabularyItem[] = [];

                // Map topics to fetchers to avoid repetitive switch logic
                const simpleFetchers: Record<
                    string,
                    () => Promise<VocabularyItem[]>
                > = {
                    adjectives: () =>
                        vocabularyService.getAdjectives() as Promise<
                            VocabularyItem[]
                        >,
                    numbers: () =>
                        vocabularyService.getNumbers() as Promise<
                            VocabularyItem[]
                        >,
                    prepositions: () =>
                        vocabularyService.getPrepositions() as Promise<
                            VocabularyItem[]
                        >,
                    verbs: () =>
                        vocabularyService.getVerbs() as Promise<
                            VocabularyItem[]
                        >,
                    adverbs: () =>
                        vocabularyService.getAdverbs() as Promise<
                            VocabularyItem[]
                        >,
                    transportation: () =>
                        vocabularyService.getTransportation() as Promise<
                            VocabularyItem[]
                        >,
                    buildings: () =>
                        vocabularyService.getBuildings() as Promise<
                            VocabularyItem[]
                        >,
                    colours: () =>
                        vocabularyService.getColours() as Promise<
                            VocabularyItem[]
                        >,
                    hobbies: () =>
                        vocabularyService.getHobbies() as Promise<
                            VocabularyItem[]
                        >,
                    wardrobe: () =>
                        vocabularyService.getWardrobe() as Promise<
                            VocabularyItem[]
                        >,
                    culture: () =>
                        vocabularyService.getCulture() as Promise<
                            VocabularyItem[]
                        >,
                };

                const categoryFetchers: Record<
                    string,
                    () => Promise<VocabularyItem[]>
                > = {
                    food: () =>
                        vocabularyService.getFood() as Promise<
                            VocabularyItem[]
                        >,
                    body: () =>
                        vocabularyService.getBody() as Promise<
                            VocabularyItem[]
                        >,
                    family: () =>
                        vocabularyService.getFamily() as Promise<
                            VocabularyItem[]
                        >,
                    home: () =>
                        vocabularyService.getHome() as Promise<
                            VocabularyItem[]
                        >,
                    nature: () =>
                        vocabularyService.getNature() as Promise<
                            VocabularyItem[]
                        >,
                    ict: () =>
                        vocabularyService.getICT() as Promise<VocabularyItem[]>,
                    shopping: () =>
                        vocabularyService.getShopping() as Promise<
                            VocabularyItem[]
                        >,
                    education: () =>
                        vocabularyService.getEducation() as Promise<
                            VocabularyItem[]
                        >,
                    work: () =>
                        vocabularyService.getWork() as Promise<
                            VocabularyItem[]
                        >,
                };

                if (topic in simpleFetchers) {
                    data = await simpleFetchers[topic]();
                } else if (topic in categoryFetchers) {
                    // Always fetch the full topic pool; subtopic filtering will be applied later during question generation
                    const allItems = await categoryFetchers[topic]();
                    data = allItems;
                } else {
                    console.warn(`Unknown topic: ${topic}`);
                }

                setVocabulary(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred',
                );
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return { vocabulary, loading, error, fetchVocabulary };
};
