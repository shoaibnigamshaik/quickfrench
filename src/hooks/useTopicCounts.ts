import { useState, useEffect } from "react";

interface TopicCounts {
  [key: string]: number;
}

export const useTopicCounts = () => {
  const [counts, setCounts] = useState<TopicCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const endpoints = [
          "adjectives",
          "numbers",
          "prepositions",
          "verbs",
          "adverbs",
        ];
        const promises = endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(`/api/${endpoint}`);
            const data = await response.json();
            return { [endpoint]: data.length };
          } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            return { [endpoint]: 0 };
          }
        });

        const results = await Promise.all(promises);
        const countsMap = results.reduce(
          (acc, result) => ({ ...acc, ...result }),
          {},
        );

        setCounts(countsMap);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch topic counts:", error);
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, loading };
};
