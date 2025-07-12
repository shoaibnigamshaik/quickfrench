import { useState, useEffect } from "react";
import { VocabularyItem } from "@/types/quiz";
import { useAdjectives } from "./useAdjectives";
import { useNumbers } from "./useNumbers";
import { usePrepositions } from "./usePrepositions";
import { useVerbs } from "./useVerbs";
import { useAdverbs } from "./useAdverbs";

export const useVocabulary = (topic: string) => {
  const { adjectives, loading: adjLoading } = useAdjectives();
  const { numbers, loading: numLoading } = useNumbers();
  const { prepositions, loading: prepLoading } = usePrepositions();
  const { verbs, loading: verbLoading } = useVerbs();
  const { adverbs, loading: advLoading } = useAdverbs();

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let data: VocabularyItem[] = [];
    let isLoading = true;

    switch (topic) {
      case "adjectives":
        data = adjectives;
        isLoading = adjLoading;
        break;
      case "numbers":
        data = numbers;
        isLoading = numLoading;
        break;
      case "prepositions":
        data = prepositions;
        isLoading = prepLoading;
        break;
      case "verbs":
        data = verbs;
        isLoading = verbLoading;
        break;
      case "adverbs":
        data = adverbs;
        isLoading = advLoading;
        break;
      default:
        data = [];
        isLoading = false;
    }

    setVocabulary(data);
    setLoading(isLoading);
  }, [topic, adjectives, numbers, prepositions, verbs, adverbs, adjLoading, numLoading, prepLoading, verbLoading, advLoading]);

  return { vocabulary, loading };
};
