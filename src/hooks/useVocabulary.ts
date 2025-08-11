import { useState, useCallback } from "react";
import { VocabularyItem } from "@/types/quiz";
import { vocabularyCacheService } from "@/lib/cache-service";

export const useVocabulary = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabulary = useCallback(
    async (topic: string, subCategory?: string, forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        let data: VocabularyItem[] = [];

        // Map topics to fetchers to avoid repetitive switch logic
        const simpleFetchers: Record<string, () => Promise<VocabularyItem[]>> = {
          adjectives: () => vocabularyCacheService.getAdjectives({ forceRefresh }) as Promise<VocabularyItem[]>,
          numbers: () => vocabularyCacheService.getNumbers({ forceRefresh }) as Promise<VocabularyItem[]>,
          prepositions: () => vocabularyCacheService.getPrepositions({ forceRefresh }) as Promise<VocabularyItem[]>,
          verbs: () => vocabularyCacheService.getVerbs({ forceRefresh }) as Promise<VocabularyItem[]>,
          adverbs: () => vocabularyCacheService.getAdverbs({ forceRefresh }) as Promise<VocabularyItem[]>,
          transportation: () => vocabularyCacheService.getTransportation({ forceRefresh }) as Promise<VocabularyItem[]>,
          colours: () => vocabularyCacheService.getColours({ forceRefresh }) as Promise<VocabularyItem[]>,
          hobbies: () => vocabularyCacheService.getHobbies({ forceRefresh }) as Promise<VocabularyItem[]>,
          wardrobe: () => vocabularyCacheService.getWardrobe({ forceRefresh }) as Promise<VocabularyItem[]>,
          buildings: () => vocabularyCacheService.getBuildings({ forceRefresh }) as Promise<VocabularyItem[]>,
          home: () => vocabularyCacheService.getHome({ forceRefresh }) as Promise<VocabularyItem[]>,
          nature: () => vocabularyCacheService.getNature({ forceRefresh }) as Promise<VocabularyItem[]>,
          ict: () => vocabularyCacheService.getICT({ forceRefresh }) as Promise<VocabularyItem[]>,
          shopping: () => vocabularyCacheService.getShopping({ forceRefresh }) as Promise<VocabularyItem[]>,
          education: () => vocabularyCacheService.getEducation({ forceRefresh }) as Promise<VocabularyItem[]>,
          family: () => vocabularyCacheService.getFamily({ forceRefresh }) as Promise<VocabularyItem[]>,
          body: () => vocabularyCacheService.getBody({ forceRefresh }) as Promise<VocabularyItem[]>,
        };

        const categoryFetchers: Record<string, (c: string) => Promise<VocabularyItem[]>> = {
          food: (c) => vocabularyCacheService.getFood(c, { forceRefresh }) as Promise<VocabularyItem[]>,
          body: (c) => vocabularyCacheService.getBodyByCategory(c, { forceRefresh }) as Promise<VocabularyItem[]>,
          family: (c) => vocabularyCacheService.getFamilyByCategory(c, { forceRefresh }) as Promise<VocabularyItem[]>,
          home: (c) => vocabularyCacheService.getHomeByCategory(c, { forceRefresh }) as Promise<VocabularyItem[]>,
          nature: (c) => vocabularyCacheService.getNatureByCategory(c, { forceRefresh }) as Promise<VocabularyItem[]>,
          ict: (c) => vocabularyCacheService.getICTByCategory(c, { forceRefresh }) as Promise<VocabularyItem[]>,
          shopping: (c) => vocabularyCacheService.getShoppingByCategory(c, { forceRefresh }) as Promise<VocabularyItem[]>,
          education: (c) => vocabularyCacheService.getEducationByCategory(c, { forceRefresh }) as Promise<VocabularyItem[]>,
        };

        if (topic === "food") {
          if (subCategory) data = await categoryFetchers.food(subCategory);
          else data = (await vocabularyCacheService.getAllFood({ forceRefresh })) as unknown as VocabularyItem[];
        } else if (subCategory && categoryFetchers[topic]) {
          data = await categoryFetchers[topic](subCategory);
        } else if (simpleFetchers[topic]) {
          data = await simpleFetchers[topic]();
        } else {
          data = [];
        }

        setVocabulary(data);
      } catch (err) {
        console.error(`Failed to fetch ${topic}:`, err);
        setError(`Failed to fetch ${topic}`);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearVocabulary = useCallback(() => {
    setVocabulary([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    vocabulary,
    loading,
    error,
    fetchVocabulary,
    clearVocabulary,
  };
};
