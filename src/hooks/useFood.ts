import { useState, useEffect } from "react";
import { Food } from "@/types/quiz";

export const useFood = (category: string) => {
  const [food, setFood] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setFood([]);
      setLoading(false);
      return;
    }

    const fetchFood = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/food/${encodeURIComponent(category)}`);
        const data = await response.json();
        setFood(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch food:", error);
        setLoading(false);
      }
    };

    fetchFood();
  }, [category]);

  return { food, loading };
};
