// Canonical subtopic names used across UI components

export const FOOD_SUBTOPICS = [
    'Fruits',
    'Vegetables',
    'Recipes',
    'Drinks',
    'Meat',
    'Snacks',
    'Related Verbs',
    'Utensils',
    'Other',
] as const;

export const BODY_SUBTOPICS = [
    'Body Parts',
    'Diseases',
    'Verbs and Expressions',
] as const;

export const FAMILY_SUBTOPICS = [
    'Salutations',
    'Interjections',
    'Relations',
    'Physical Description',
    'Temperament and Mood',
] as const;

export const HOME_SUBTOPICS = [
    'Rooms and Furniture',
    'Bathroom',
    'Living Room',
    'Kitchen',
    'Bedroom',
    'Household Chores',
    'Garden',
    'Household Appliances',
] as const;

export const NATURE_SUBTOPICS = [
    'General',
    'Animals',
    'Climate and Temperature',
] as const;

export const ICT_SUBTOPICS = [
    'The Digital World',
    'Verbs and Expressions',
    'Texts',
] as const;

export const SHOPPING_SUBTOPICS = [
    'General',
    'Verbs and Expressions',
    'Weights and Measures',
    'Materials',
] as const;

export const EDUCATION_SUBTOPICS = [
    'Institutions',
    'Education and Training',
    'Classroom',
    'Subjects',
    'Studies',
    'Verbs and Expressions',
] as const;

export const WORK_SUBTOPICS = [
    'General',
    'Professions',
    'Verbs and Expressions',
] as const;

// Map of topic id -> subtopic array for convenient lookup
export const SUBTOPIC_MAP: Record<string, readonly string[]> = {
    food: FOOD_SUBTOPICS,
    body: BODY_SUBTOPICS,
    family: FAMILY_SUBTOPICS,
    home: HOME_SUBTOPICS,
    nature: NATURE_SUBTOPICS,
    ict: ICT_SUBTOPICS,
    shopping: SHOPPING_SUBTOPICS,
    education: EDUCATION_SUBTOPICS,
    work: WORK_SUBTOPICS,
};
