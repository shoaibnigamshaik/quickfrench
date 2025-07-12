import { useState, useEffect } from "react";
import { Adjective } from "@/types/quiz";

export const useAdjectives = () => {
  const [adjectives, setAdjectives] = useState<Adjective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdjectives = async () => {
      try {
        const response = await fetch("/api/adjectives");
        const data = await response.json();
        setAdjectives(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch adjectives:", error);
        setLoading(false);
      }
    };

    fetchAdjectives();
  }, []);

  return { adjectives, loading };
};
