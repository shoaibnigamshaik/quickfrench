import { useState } from "react";
import { SUBTOPIC_TOPICS } from "@/data/topics";

export type SubtopicKey = (typeof SUBTOPIC_TOPICS)[number];

const createInitialSubtopics = (): Record<SubtopicKey, string> =>
  Object.fromEntries(SUBTOPIC_TOPICS.map((t) => [t, ""])) as Record<
    SubtopicKey,
    string
  >;

export function useTopicSelection() {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedSubtopics, setSelectedSubtopics] = useState(
    createInitialSubtopics(),
  );

  const handleStartQuiz = async (
    topic: string,
    fetchVocabulary: (topic: string) => Promise<void>,
    startQuiz: (topic: string) => void,
  ) => {
    setSelectedTopic(topic);
    await fetchVocabulary(topic);
    startQuiz(topic);
  };

  const handleSubtopicSelect = async (
    topic: SubtopicKey,
    category: string,
    fetchVocabulary: (topic: string, category?: string) => Promise<void>,
    startQuiz: (topicId: string) => void,
  ) => {
    const combinedTopicId = `${topic}::${category}`;
    setSelectedTopic(combinedTopicId);
    setSelectedSubtopics((prev) => ({ ...prev, [topic]: category }));
    await fetchVocabulary(topic, category);
    startQuiz(combinedTopicId);
  };

  const handleResetQuiz = (goHome: () => void) => {
    setSelectedTopic("");
    setSelectedSubtopics(createInitialSubtopics());
    goHome();
  };

  return {
    selectedTopic,
    selectedSubtopics,
    handleStartQuiz,
    handleSubtopicSelect,
    handleResetQuiz,
  };
}
