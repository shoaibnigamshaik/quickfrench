import { useState, useEffect } from "react";
import { Verb } from "@/types/quiz";
import { vocabularyService } from "@/lib/cache-service";

export const useVerbs = (forceRefresh = false) => {
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerbs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vocabularyService.getVerbs();
        setVerbs(data);
      } catch (error) {
        console.error("Failed to fetch verbs:", error);
        setError("Failed to fetch verbs");
      } finally {
        setLoading(false);
      }
    };

    fetchVerbs();
  }, [forceRefresh]);

  return { verbs, loading, error };
};
