import React from "react";
import { ArrowLeft, Utensils } from "lucide-react";
import { TranslationDirection } from "@/types/quiz";

interface FoodSubtopicSelectorProps {
  questionCount: number | "all";
  translationDirection: TranslationDirection;
  onSelectSubtopic: (category: string) => void;
  onBack: () => void;
}

export const FoodSubtopicSelector = ({
  questionCount,
  translationDirection,
  onSelectSubtopic,
  onBack,
}: FoodSubtopicSelectorProps) => {
  // Food categories with icons and colors - hardcoded for performance
  const foodCategories = [
    { name: "Fruits", icon: "🍎", color: "from-red-400 to-pink-500" },
    { name: "Vegetables", icon: "🥬", color: "from-green-400 to-emerald-500" },
    { name: "Recipes", icon: "🍳", color: "from-yellow-400 to-orange-500" },
    { name: "Drinks", icon: "🥤", color: "from-blue-400 to-cyan-500" },
    { name: "Meat", icon: "🥩", color: "from-red-500 to-red-600" },
    { name: "Snacks", icon: "🍿", color: "from-purple-400 to-purple-500" },
    { name: "Related Verbs", icon: "🔪", color: "from-gray-400 to-gray-600" },
    { name: "Utensils", icon: "🍴", color: "from-indigo-400 to-indigo-500" },
    { name: "Other", icon: "🥄", color: "from-teal-400 to-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 mr-4"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex-1 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Choose Food Category
              </h1>
              <p className="text-gray-600 mb-3">
                Select which food category you&apos;d like to practice
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full border border-indigo-200">
                <span className="text-sm font-medium text-indigo-800">
                  {translationDirection === "french-to-english"
                    ? "French → English"
                    : "English → French"}
                </span>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foodCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => onSelectSubtopic(category.name)}
                className={`p-6 bg-gradient-to-r ${category.color} rounded-2xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-sm text-white/80">
                  Practice French {category.name.toLowerCase()}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              💡 <strong>Tip:</strong> Each category contains different French food vocabulary.
              {questionCount === "all"
                ? " All available questions"
                : ` ${questionCount} questions`}{" "}
              will be selected per quiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
