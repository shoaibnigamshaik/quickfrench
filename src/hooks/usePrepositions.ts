import { useState, useEffect } from "react";
import { Preposition } from "@/types/quiz";
import { vocabularyService } from "@/lib/cache-service";

export const usePrepositions = (forceRefresh = false) => {
  const [prepositions, setPrepositions] = useState<Preposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrepositions = async () => {
      try {
        setLoading(true);
        setError(null);
  const data = await vocabularyService.getPrepositions();
        setPrepositions(data);
      } catch (error) {
        console.error("Failed to fetch prepositions:", error);
        setError("Failed to fetch prepositions");
      } finally {
        setLoading(false);
      }
    };

    fetchPrepositions();
  }, [forceRefresh]);

  return { prepositions, loading, error };
};
