import { useState, useEffect } from "react";
import { Number } from "@/types/quiz";

export const useNumbers = () => {
  const [numbers, setNumbers] = useState<Number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNumbers = async () => {
      try {
        const response = await fetch("/api/numbers");
        const data = await response.json();
        setNumbers(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch numbers:", error);
        setLoading(false);
      }
    };

    fetchNumbers();
  }, []);

  return { numbers, loading };
};
