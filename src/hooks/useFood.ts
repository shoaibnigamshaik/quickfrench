import { useState, useEffect } from "react";
import { Food } from "@/types/quiz";
import { vocabularyService } from "@/lib/cache-service";

export const useFood = (category: string, forceRefresh = false) => {
  const [food, setFood] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      setFood([]);
      setLoading(false);
      return;
    }

    const fetchFood = async () => {
      try {
        setLoading(true);
        setError(null);
  const data = await vocabularyService.getFood();
  const filtered = data.filter((f) => f.category === category);
  setFood(filtered);
      } catch (error) {
        console.error("Failed to fetch food:", error);
        setError("Failed to fetch food");
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [category, forceRefresh]);

  return { food, loading, error };
};
