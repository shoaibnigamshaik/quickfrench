import { Topic } from "@/types/quiz";

export const topics: Topic[] = [
  {
    id: "adjectives",
    name: "Adjectives",
    icon: "✨",
  },
  {
    id: "numbers",
    name: "Numbers",
    icon: "🔢",
  },
  {
    id: "prepositions",
    name: "Prepositions",
    icon: "🔗",
  },
  {
    id: "verbs",
    name: "Verbs",
    icon: "🏃",
  },
  {
    id: "adverbs",
    name: "Adverbs",
    icon: "⚡",
  },
  {
    id: "food",
    name: "Food",
    icon: "🍽️",
  },
  {
    id: "transportation",
    name: "Travel and Transportation",
    icon: "🧭",
  },
  {
    id: "body",
    name: "Body Parts and Health",
    icon: "🩺",
  },
  {
    id: "family",
    name: "Family and Friends",
    icon: "👥",
  },
  {
    id: "home",
    name: "Home",
    icon: "🏠",
  },
  {
    id: "colours",
    name: "Colours",
    icon: "🎨",
  },
  {
    id: "hobbies",
    name: "Hobbies",
    icon: "🎯",
  },
  {
    id: "wardrobe",
    name: "Wardrobe",
    icon: "👕",
  },
  {
    id: "nature",
    name: "Nature",
    icon: "🌿",
  },
  {
    id: "ict",
    name: "ICT",
    icon: "💻",
  },
  {
    id: "buildings",
    name: "Buildings",
    icon: "🏢",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "🛍️",
  },
  {
    id: "education",
    name: "Education",
    icon: "🎓",
  },
  {
    id: "work",
    name: "Work",
    icon: "💼",
  },
  {
    id: "culture",
    name: "Culture",
    icon: "🎭",
  },
];


export const TOPIC_COUNTS: Record<string, number> = {
  adjectives: 96,
  numbers: 27,
  prepositions: 26,
  verbs: 116,
  adverbs: 28,
  food: 183,
  transportation: 81,
  body: 119,
  family: 194,
  home: 240,
  nature: 137,
  ict: 90,
  colours: 17,
  hobbies: 87,
  wardrobe: 66,
  buildings: 60,
  shopping: 72,
  education: 115,
  culture: 30,
  work: 73,
};
