import { useState, useEffect } from "react";
import { Adjective } from "@/types/quiz";
import { vocabularyService } from "@/lib/cache-service";

export const useAdjectives = (forceRefresh = false) => {
  const [adjectives, setAdjectives] = useState<Adjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdjectives = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vocabularyService.getAdjectives();
        setAdjectives(data);
      } catch (error) {
        console.error("Failed to fetch adjectives:", error);
        setError("Failed to fetch adjectives");
      } finally {
        setLoading(false);
      }
    };

    fetchAdjectives();
  }, [forceRefresh]);

  return { adjectives, loading, error };
};
