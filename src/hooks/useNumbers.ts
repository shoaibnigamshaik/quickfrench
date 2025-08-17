import { useState, useEffect } from "react";
import { Number } from "@/types/quiz";
import { vocabularyService } from "@/lib/cache-service";

export const useNumbers = (forceRefresh = false) => {
  const [numbers, setNumbers] = useState<Number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNumbers = async () => {
      try {
        setLoading(true);
        setError(null);
  const data = await vocabularyService.getNumbers();
        setNumbers(data);
      } catch (error) {
        console.error("Failed to fetch numbers:", error);
        setError("Failed to fetch numbers");
      } finally {
        setLoading(false);
      }
    };

    fetchNumbers();
  }, [forceRefresh]);

  return { numbers, loading, error };
};
