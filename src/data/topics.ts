import { Topic } from '@/types/quiz';
import {
    BookOpen,
    Hash,
    MapPin,
    Play,
    Wind,
    UtensilsCrossed,
    Plane,
    Heart,
    Users,
    Home,
    Palette,
    GamepadIcon,
    Shirt,
    TreePine,
    Laptop,
    Building2,
    ShoppingCart,
    GraduationCap,
    Briefcase,
    Music,
} from 'lucide-react';

export const topics: Topic[] = [
    {
        id: 'adjectives',
        name: 'Adjectives',
        icon: BookOpen,
    },
    {
        id: 'numbers',
        name: 'Numbers',
        icon: Hash,
    },
    {
        id: 'prepositions',
        name: 'Prepositions',
        icon: MapPin,
    },
    {
        id: 'verbs',
        name: 'Verbs',
        icon: Play,
    },
    {
        id: 'adverbs',
        name: 'Adverbs',
        icon: Wind,
    },
    {
        id: 'food',
        name: 'Food',
        icon: UtensilsCrossed,
    },
    {
        id: 'transportation',
        name: 'Travel and Transportation',
        icon: Plane,
    },
    {
        id: 'body',
        name: 'Body Parts and Health',
        icon: Heart,
    },
    {
        id: 'family',
        name: 'Family and Friends',
        icon: Users,
    },
    {
        id: 'home',
        name: 'Home',
        icon: Home,
    },
    {
        id: 'colours',
        name: 'Colours',
        icon: Palette,
    },
    {
        id: 'hobbies',
        name: 'Hobbies',
        icon: GamepadIcon,
    },
    {
        id: 'wardrobe',
        name: 'Wardrobe',
        icon: Shirt,
    },
    {
        id: 'nature',
        name: 'Nature',
        icon: TreePine,
    },
    {
        id: 'ict',
        name: 'ICT',
        icon: Laptop,
    },
    {
        id: 'buildings',
        name: 'Buildings',
        icon: Building2,
    },
    {
        id: 'shopping',
        name: 'Shopping',
        icon: ShoppingCart,
    },
    {
        id: 'education',
        name: 'Education',
        icon: GraduationCap,
    },
    {
        id: 'work',
        name: 'Work',
        icon: Briefcase,
    },
    {
        id: 'culture',
        name: 'Culture',
        icon: Music,
    },
];

// Topics that have subcategories
export const SUBTOPIC_TOPICS = [
    'food',
    'body',
    'family',
    'home',
    'nature',
    'ict',
    'shopping',
    'education',
    'work',
] as const;

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
