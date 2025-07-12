import { useState, useEffect } from "react";
import { Preposition } from "@/types/quiz";

export const usePrepositions = () => {
  const [prepositions, setPrepositions] = useState<Preposition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrepositions = async () => {
      try {
        const response = await fetch("/api/prepositions");
        const data = await response.json();
        setPrepositions(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch prepositions:", error);
        setLoading(false);
      }
    };

    fetchPrepositions();
  }, []);

  return { prepositions, loading };
};
