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

        switch (topic) {
          case "adjectives":
            data = await vocabularyCacheService.getAdjectives({ forceRefresh });
            break;
          case "numbers":
            data = await vocabularyCacheService.getNumbers({ forceRefresh });
            break;
          case "prepositions":
            data = await vocabularyCacheService.getPrepositions({
              forceRefresh,
            });
            break;
          case "verbs":
            data = await vocabularyCacheService.getVerbs({ forceRefresh });
            break;
          case "adverbs":
            data = await vocabularyCacheService.getAdverbs({ forceRefresh });
            break;
          case "transportation":
            data = await vocabularyCacheService.getTransportation({
              forceRefresh,
            });
            break;
          case "body":
            if (subCategory) {
              data = await vocabularyCacheService.getBodyByCategory(
                subCategory,
                { forceRefresh },
              );
            } else {
              data = await vocabularyCacheService.getBody({ forceRefresh });
            }
            break;
          case "food":
            if (subCategory) {
              data = await vocabularyCacheService.getFood(subCategory, {
                forceRefresh,
              });
            }
            break;
          default:
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
