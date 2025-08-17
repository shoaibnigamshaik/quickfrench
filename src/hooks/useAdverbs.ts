import { useState, useEffect } from "react";
import { Adverb } from "@/types/quiz";
import { vocabularyService } from "@/lib/cache-service";

export const useAdverbs = (forceRefresh = false) => {
  const [adverbs, setAdverbs] = useState<Adverb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdverbs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vocabularyService.getAdverbs();
        setAdverbs(data);
      } catch (error) {
        console.error("Failed to fetch adverbs:", error);
        setError("Failed to fetch adverbs");
      } finally {
        setLoading(false);
      }
    };

    fetchAdverbs();
  }, [forceRefresh]);

  return { adverbs, loading, error };
};
