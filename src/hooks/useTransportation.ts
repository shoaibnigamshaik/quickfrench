import { useState, useEffect } from "react";
import { Transportation } from "@/types/quiz";
import { vocabularyService } from "@/lib/cache-service";

export const useTransportation = (forceRefresh = false) => {
  const [transportation, setTransportation] = useState<Transportation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransportation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vocabularyService.getTransportation();
        setTransportation(data);
      } catch (error) {
        console.error("Failed to fetch transportation:", error);
        setError("Failed to fetch transportation");
      } finally {
        setLoading(false);
      }
    };

    fetchTransportation();
  }, [forceRefresh]);

  return { transportation, loading, error };
};
