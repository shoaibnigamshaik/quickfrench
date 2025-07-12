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

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export type QuizMode = "multiple-choice" | "typing";

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
}

export type VocabularyItem = Adjective | Number | Preposition | Verb | Adverb;
