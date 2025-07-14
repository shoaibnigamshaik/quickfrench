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

        // Special handling for food - get total count across all categories
        const foodPromise = (async () => {
          try {
            const categoriesResponse = await fetch('/api/food-categories');
            const categories = await categoriesResponse.json();
            
            let totalFoodCount = 0;
            for (const category of categories) {
              try {
                const foodResponse = await fetch(`/api/food/${encodeURIComponent(category.name)}`);
                const foodData = await foodResponse.json();
                totalFoodCount += foodData.length;
              } catch (error) {
                console.error(`Failed to fetch food for category ${category.name}:`, error);
              }
            }
            
            return { food: totalFoodCount };
          } catch (error) {
            console.error('Failed to fetch food categories:', error);
            return { food: 0 };
          }
        })();

        const results = await Promise.all([...promises, foodPromise]);
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
