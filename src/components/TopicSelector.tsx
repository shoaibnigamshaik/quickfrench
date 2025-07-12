import Link from "next/link";
import { BookOpen, Settings } from "lucide-react";
import { Topic } from "@/types/quiz";
import { useTopicCounts } from "@/hooks/useTopicCounts";

interface TopicSelectorProps {
  topics: Topic[];
  questionCount: number | "all";
  onStartQuiz: (topic: string) => void;
}

export const TopicSelector = ({ topics, questionCount, onStartQuiz }: TopicSelectorProps) => {
  const { counts, loading: countsLoading } = useTopicCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
          {/* Settings Button */}
          <div className="flex justify-end mb-4">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Link>
          </div>
          
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Choose a Topic
            </h1>
            <p className="text-gray-600">
              Select which French vocabulary you'd like to practice
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {topics.map((topic) => {
              const itemCount = counts[topic.id] || 0;
              const isLoading = countsLoading;
              
              return (
                <button
                  key={topic.id}
                  onClick={() => onStartQuiz(topic.id)}
                  disabled={isLoading || itemCount === 0}
                  className={`p-8 bg-gradient-to-r ${topic.color} rounded-2xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{topic.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{topic.name}</h3>
                      <p className="text-blue-100">{topic.description}</p>
                    </div>
                    {!isLoading && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white/90">
                          {itemCount}
                        </div>
                        <div className="text-sm text-blue-100">
                          words
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-blue-100">
                    <div>• {questionCount === "all" ? "All available questions" : `${questionCount} questions`} per quiz</div>
                    <div>• Track your progress and streaks</div>
                    <div>• Multiple choice and typing modes</div>
                    {topic.id === "adverbs" && <div>• Organized by adverb categories</div>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Visit Settings to choose quiz mode and adjust number of questions per quiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
