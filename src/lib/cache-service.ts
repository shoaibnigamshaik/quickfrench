import type {
    Adjective,
    Number,
    Preposition,
    Verb,
    Adverb,
    Food,
    FoodCategory,
    Transportation,
    BuildingItem,
    ShoppingItem,
    EducationItem,
    WorkItem,
    BodyItem,
    BodyCategory,
    FamilyItem,
    FamilyCategory,
    HomeItem,
    HomeCategory,
    NatureItem,
    NatureCategory,
    ShoppingCategory,
    EducationCategory,
    WorkCategory,
    Colour,
    Hobby,
    WardrobeItem,
    ICTItem,
    Culture,
} from '@/types/quiz';

class VocabularyCacheService {
    private async fetchFromApi<T>(apiUrl: string): Promise<T> {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(
                `Failed to fetch from ${apiUrl}: ${response.statusText}`,
            );
        }
        return response.json();
    }

    public getAdjectives = () =>
        this.fetchFromApi<Adjective[]>('/data/adjectives.json');
    public getAdverbs = () => this.fetchFromApi<Adverb[]>('/data/adverbs.json');
    public getNumbers = () => this.fetchFromApi<Number[]>('/data/numbers.json');
    public getPrepositions = () =>
        this.fetchFromApi<Preposition[]>('/data/prepositions.json');
    public getVerbs = () => this.fetchFromApi<Verb[]>('/data/verbs.json');
    public getFood = () => this.fetchFromApi<Food[]>('/data/food.json');
    public getFoodCategories = () =>
        this.fetchFromApi<FoodCategory[]>('/data/food-categories.json');
    public getTransportation = () =>
        this.fetchFromApi<Transportation[]>('/data/transportation.json');
    public getBuildings = () =>
        this.fetchFromApi<BuildingItem[]>('/data/buildings.json');
    public getShopping = () =>
        this.fetchFromApi<ShoppingItem[]>('/data/shopping.json');
    public getEducation = () =>
        this.fetchFromApi<EducationItem[]>('/data/education.json');
    public getWork = () => this.fetchFromApi<WorkItem[]>('/data/work.json');
    public getBody = () => this.fetchFromApi<BodyItem[]>('/data/body.json');
    public getFamily = () =>
        this.fetchFromApi<FamilyItem[]>('/data/family.json');
    public getHome = () => this.fetchFromApi<HomeItem[]>('/data/home.json');
    public getNature = () =>
        this.fetchFromApi<NatureItem[]>('/data/nature.json');
    public getColours = () => this.fetchFromApi<Colour[]>('/data/colours.json');
    public getHobbies = () => this.fetchFromApi<Hobby[]>('/data/hobbies.json');
    public getWardrobe = () =>
        this.fetchFromApi<WardrobeItem[]>('/data/wardrobe.json');
    public getICT = () => this.fetchFromApi<ICTItem[]>('/data/ict.json');
    public getCulture = () =>
        this.fetchFromApi<Culture[]>('/data/culture.json');
    public getShoppingCategories = () =>
        this.fetchFromApi<ShoppingCategory[]>('/data/shopping-categories.json');
    public getEducationCategories = () =>
        this.fetchFromApi<EducationCategory[]>(
            '/data/education-categories.json',
        );
    public getWorkCategories = () =>
        this.fetchFromApi<WorkCategory[]>('/data/work-categories.json');
    public getBodyCategories = () =>
        this.fetchFromApi<BodyCategory[]>('/data/body-categories.json');
    public getFamilyCategories = () =>
        this.fetchFromApi<FamilyCategory[]>('/data/family-categories.json');
    public getHomeCategories = () =>
        this.fetchFromApi<HomeCategory[]>('/data/home-categories.json');
    public getNatureCategories = () =>
        this.fetchFromApi<NatureCategory[]>('/data/nature-categories.json');
}

export const vocabularyService = new VocabularyCacheService();
