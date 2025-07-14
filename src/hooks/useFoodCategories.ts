import { useState, useEffect } from "react";
import { FoodCategory } from "@/types/quiz";

export const useFoodCategories = () => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/food-categories");
        const data = await response.json();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch food categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};
