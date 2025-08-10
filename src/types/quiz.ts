export interface Question {
  word: string;
  correct: string;
  options: string[];
}

export interface Adjective {
  word: string;
  meaning: string;
}

export interface Number {
  word: string;
  meaning: string;
}

export interface Preposition {
  word: string;
  meaning: string;
}

export interface Verb {
  word: string;
  meaning: string;
}

export interface Adverb {
  word: string;
  meaning: string;
  category: string;
}

export interface Food {
  word: string;
  meaning: string;
  category: string;
}

export interface FoodCategory {
  id: number;
  name: string;
}

export interface FamilyItem {
  word: string;
  meaning: string;
  category: string;
}

export interface FamilyCategory {
  id: number;
  name: string;
}

export interface HomeItem {
  word: string;
  meaning: string;
  category: string;
}

export interface HomeCategory {
  id: number;
  name: string;
}

export interface Transportation {
  word: string;
  meaning: string;
}

export interface Colour {
  word: string;
  meaning: string;
}

export interface BodyItem {
  word: string;
  meaning: string;
  category: string | null;
}

export interface BodyCategory {
  id: number;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export type QuizMode = "multiple-choice" | "typing";

export type TranslationDirection = "french-to-english" | "english-to-french";

export interface QuizState {
  currentQuestion: number;
  score: number;
  selectedAnswer: string;
  showResult: boolean;
  quizComplete: boolean;
  questions: Question[];
  streak: number;
  maxStreak: number;
  typedAnswer: string;
}

export interface QuizSettings {
  quizMode: QuizMode;
  questionCount: number | "all";
  selectedTopic: string;
  translationDirection: TranslationDirection;
  autoAdvance: boolean;
}

export type VocabularyItem =
  | Adjective
  | Number
  | Preposition
  | Verb
  | Adverb
  | Food
  | Transportation
  | Colour
  | BodyItem
  | FamilyItem
  | HomeItem;
