"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Volume2,
  Bell,
  Globe,
  Palette,
  User,
  Shield,
  HelpCircle,
  Info,
  CheckCircle,
  LucideIcon,
  ArrowLeftRight,
} from "lucide-react";

interface SettingItem {
  icon: LucideIcon;
  label: string;
  description: string;
  type:
    | "toggle"
    | "select"
    | "link"
    | "quiz-mode"
    | "question-count"
    | "translation-direction";
  value?: boolean | string;
  options?: string[];
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsPage = () => {
  const [quizMode, setQuizMode] = React.useState<"multiple-choice" | "typing">(
    "multiple-choice",
  );
  const [questionCount, setQuestionCount] = React.useState<number | "all">(10);
  const [translationDirection, setTranslationDirection] = React.useState<
    "french-to-english" | "english-to-french"
  >("french-to-english");
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  // Load saved settings from localStorage
  React.useEffect(() => {
    const savedMode = localStorage.getItem("quizMode") as
      | "multiple-choice"
      | "typing";
    const savedCount = localStorage.getItem("questionCount");
    const savedDirection = localStorage.getItem("translationDirection") as
      | "french-to-english"
      | "english-to-french";

    if (savedMode) {
      setQuizMode(savedMode);
    }
    if (savedCount) {
      const count = savedCount === "all" ? "all" : parseInt(savedCount);
      setQuestionCount(count);
      // Show custom input if the saved value isn't one of the preset buttons
      if (typeof count === "number" && ![5, 10, 15, 20].includes(count)) {
        setShowCustomInput(true);
      }
    }
    if (savedDirection) {
      setTranslationDirection(savedDirection);
    }
  }, []);

  // Save quiz mode to localStorage when changed
  const handleQuizModeChange = (mode: "multiple-choice" | "typing") => {
    setQuizMode(mode);
    localStorage.setItem("quizMode", mode);
  };

  // Save question count to localStorage when changed
  const handleQuestionCountChange = (count: number | "all") => {
    setQuestionCount(count);
    localStorage.setItem("questionCount", count.toString());
    // Hide custom input if selecting a preset value
    if (count === "all" || [5, 10, 15, 20].includes(count as number)) {
      setShowCustomInput(false);
    }
  };

  // Handle custom button click
  const handleCustomClick = () => {
    setShowCustomInput(true);
  };

  // Save translation direction to localStorage when changed
  const handleTranslationDirectionChange = () => {
    const newDirection =
      translationDirection === "french-to-english"
        ? "english-to-french"
        : "french-to-english";
    setTranslationDirection(newDirection);
    localStorage.setItem("translationDirection", newDirection);
  };

  const settingsSections: SettingSection[] = [
    {
      title: "Quiz Settings",
      items: [
        {
          icon: CheckCircle,
          label: "Quiz Mode",
          description: "Choose how you want to answer questions",
          type: "quiz-mode" as const,
        },
        {
          icon: HelpCircle,
          label: "Questions per Quiz",
          description: "Choose how many questions per quiz",
          type: "question-count" as const,
        },
        {
          icon: ArrowLeftRight,
          label: "Translation Direction",
          description: "Choose the direction of translation",
          type: "translation-direction" as const,
        },
      ],
    },
    {
      title: "General",
      items: [
        {
          icon: Volume2,
          label: "Sound Effects",
          description: "Enable sound feedback during quiz",
          type: "toggle" as const,
          value: true,
        },
        {
          icon: Bell,
          label: "Notifications",
          description: "Get reminders to practice",
          type: "toggle" as const,
          value: false,
        },
        {
          icon: Globe,
          label: "Language",
          description: "Interface language",
          type: "select" as const,
          value: "English",
          options: ["English", "French", "Spanish"],
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          icon: Palette,
          label: "Theme",
          description: "Choose your preferred theme",
          type: "select",
          value: "Light",
          options: ["Light", "Dark", "Auto"],
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          description: "Manage your profile information",
          type: "link",
        },
        {
          icon: Shield,
          label: "Privacy",
          description: "Privacy and data settings",
          type: "link",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help & FAQ",
          description: "Get help and find answers",
          type: "link",
        },
      ],
    },
  ];

  const handleToggle = (sectionIndex: number, itemIndex: number) => {
    // Handle toggle logic here
    console.log(
      `Toggle setting: ${settingsSections[sectionIndex].items[itemIndex].label}`,
    );
  };

  const handleSelectChange = (
    sectionIndex: number,
    itemIndex: number,
    value: string,
  ) => {
    // Handle select change logic here
    console.log(
      `Change setting: ${settingsSections[sectionIndex].items[itemIndex].label} to ${value}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 transform hover:scale-105 mr-4"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600">Customize your quiz experience</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {settingsSections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white">
                  {section.title}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {item.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {item.type === "quiz-mode" && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="quiz-mode"
                                value="multiple-choice"
                                checked={quizMode === "multiple-choice"}
                                onChange={(e) =>
                                  handleQuizModeChange(
                                    e.target.value as "multiple-choice",
                                  )
                                }
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Multiple Choice
                              </span>
                              <div className="relative group">
                                <Info className="h-4 w-4 text-gray-400 hover:text-indigo-600 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg z-10">
                                  <div className="mb-2 font-semibold">
                                    Multiple Choice Mode:
                                  </div>
                                  <div className="space-y-1">
                                    <div>• Select from 4 options</div>
                                    <div>• Use keys 1-4 to select</div>
                                    <div>• Space/Enter for next</div>
                                    <div>• R to restart</div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="quiz-mode"
                                value="typing"
                                checked={quizMode === "typing"}
                                onChange={(e) =>
                                  handleQuizModeChange(
                                    e.target.value as "typing",
                                  )
                                }
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Fill in the Blank
                              </span>
                              <div className="relative group">
                                <Info className="h-4 w-4 text-gray-400 hover:text-indigo-600 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg z-10">
                                  <div className="mb-2 font-semibold">
                                    Fill in the Blank Mode:
                                  </div>
                                  <div className="space-y-1">
                                    <div>• Type the English meaning</div>
                                    <div>• Type your answer</div>
                                    <div>• Enter to submit</div>
                                    <div>• Space for next question</div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      {item.type === "question-count" && (
                        <div className="space-y-4">
                          {/* Quick Select Buttons */}
                          <div className="flex flex-wrap gap-2 justify-end">
                            {[5, 10, 15, 20].map((count) => (
                              <button
                                key={count}
                                onClick={() => handleQuestionCountChange(count)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                  questionCount === count
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300"
                                }`}
                              >
                                {count}
                              </button>
                            ))}
                            <button
                              onClick={() => handleQuestionCountChange("all")}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                questionCount === "all"
                                  ? "bg-purple-600 text-white shadow-lg"
                                  : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-300"
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={handleCustomClick}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                showCustomInput &&
                                typeof questionCount === "number" &&
                                ![5, 10, 15, 20].includes(questionCount)
                                  ? "bg-teal-600 text-white shadow-lg"
                                  : "bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-600 border border-gray-300"
                              }`}
                            >
                              Custom
                            </button>
                          </div>

                          {/* Custom Input - Only shown when custom button is clicked */}
                          {showCustomInput && (
                            <div className="flex items-center justify-end space-x-2">
                              <label className="text-sm text-gray-600">
                                Enter amount:
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="50"
                                value={
                                  typeof questionCount === "number"
                                    ? questionCount
                                    : ""
                                }
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value >= 1 && value <= 50) {
                                    handleQuestionCountChange(value);
                                  }
                                }}
                                placeholder={
                                  typeof questionCount === "number"
                                    ? questionCount.toString()
                                    : "10"
                                }
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                autoFocus
                              />
                            </div>
                          )}

                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              Selected:{" "}
                              <strong>
                                {questionCount === "all"
                                  ? "All available questions"
                                  : `${questionCount} questions`}
                              </strong>
                            </p>
                          </div>
                        </div>
                      )}

                      {item.type === "translation-direction" && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {translationDirection === "french-to-english"
                              ? "French"
                              : "English"}
                          </span>
                          <button
                            onClick={handleTranslationDirectionChange}
                            className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
                          >
                            <ArrowLeftRight
                              className={`h-4 w-4 text-indigo-600 transition-transform duration-200 ${
                                translationDirection === "english-to-french"
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                          <span className="text-sm font-medium text-gray-700">
                            {translationDirection === "french-to-english"
                              ? "English"
                              : "French"}
                          </span>
                        </div>
                      )}

                      {item.type === "toggle" && (
                        <button
                          onClick={() => handleToggle(sectionIndex, itemIndex)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            item.value ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      )}

                      {item.type === "select" && (
                        <select
                          value={item.value as string}
                          onChange={(e) =>
                            handleSelectChange(
                              sectionIndex,
                              itemIndex,
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {item.options?.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {item.type === "link" && (
                        <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium">
                          Configure
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Your settings have been saved
            </h3>
            <p className="text-gray-600 mb-6">
              Changes will take effect immediately
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
