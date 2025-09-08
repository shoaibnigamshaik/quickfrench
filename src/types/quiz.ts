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

export interface NatureItem {
  word: string;
  meaning: string;
  category: string | null;
}

export interface NatureCategory {
  id: number;
  name: string;
}

export interface ICTItem {
  word: string;
  meaning: string;
  category: string | null;
}

export interface ICTCategory {
  id: number;
  name: string;
}

export interface ShoppingItem {
  word: string;
  meaning: string;
  category: string | null;
}

export interface ShoppingCategory {
  id: number;
  name: string;
}

export interface EducationItem {
  word: string;
  meaning: string;
  category: string | null;
}

export interface EducationCategory {
  id: number;
  name: string;
}

export interface WorkItem {
  word: string;
  meaning: string;
  category: string | null;
}

export interface WorkCategory {
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

export interface Hobby {
  word: string;
  meaning: string;
}

export interface WardrobeItem {
  word: string;
  meaning: string;
}

export interface BuildingItem {
  word: string;
  meaning: string;
}

export interface Culture {
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
  icon: React.ComponentType<{ className?: string }>;
}

// QuizMode:
//  - multiple-choice: always show options
//  - typing: user must type every answer
//  - hybrid: start each question in typing mode; user can reveal / switch to MCQ if stuck
export type QuizMode = "multiple-choice" | "typing" | "hybrid";

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
  wrongAnswers: WrongAnswer[];
  // In hybrid mode: which question indices have been switched from typing to MCQ display
  hybridRevealed?: number[];
}

export interface QuizSettings {
  quizMode: QuizMode;
  questionCount: number | "all";
  selectedTopic: string;
  translationDirection: TranslationDirection;
  autoAdvance: boolean;
  autoAdvanceDelayMs?: number;
  // Optional per-question timer (client-only)
  timerEnabled?: boolean; // default off
  timerDurationSec?: number; // default 30s
  // Optional spaced repetition settings (client-only)
  // When true, question generation prioritizes SRS due items.
  srsReviewMode?: boolean;
  // Soft caps for review/new items per session (when questionCount is a number)
  srsMaxPerSession?: number;
  srsNewPerSession?: number;
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
  | Hobby
  | WardrobeItem
  | BuildingItem
  | Culture
  | ShoppingItem
  | EducationItem
  | WorkItem
  | BodyItem
  | FamilyItem
  | HomeItem
  | NatureItem
  | ICTItem;

export interface WrongAnswer {
  question: Question;
  userAnswer: string;
  questionIndex: number;
}
