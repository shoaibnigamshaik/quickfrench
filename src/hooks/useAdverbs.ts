import { useState, useEffect } from "react";
import { Adverb } from "@/types/quiz";

export const useAdverbs = () => {
  const [adverbs, setAdverbs] = useState<Adverb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdverbs = async () => {
      try {
        const response = await fetch("/api/adverbs");
        const data = await response.json();
        setAdverbs(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch adverbs:", error);
        setLoading(false);
      }
    };

    fetchAdverbs();
  }, []);

  return { adverbs, loading };
};
