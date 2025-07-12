import { useState, useEffect } from "react";
import { Verb } from "@/types/quiz";

export const useVerbs = () => {
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerbs = async () => {
      try {
        const response = await fetch("/api/verbs");
        const data = await response.json();
        setVerbs(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch verbs:", error);
        setLoading(false);
      }
    };

    fetchVerbs();
  }, []);

  return { verbs, loading };
};
