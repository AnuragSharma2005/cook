import { Recipe, ContactMessage, CollaborationRequest, Creator } from '../types';

const RECIPES_KEY = 'kaju_recipes_v2';
const CONTACTS_KEY = 'kaju_contacts';
const COLLABS_KEY = 'kaju_collabs';
const CREATORS_KEY = 'kaju_creators_v3';
const LIKED_RECIPES_KEY = 'kaju_liked_recipes_v1';
const LEGACY_LIKED_RECIPES_KEY = 'kaju_likes_tracking';

export const INITIAL_CREATORS: Creator[] = [
  {
    id: 'c1',
    name: "cookwithkitchen",
    avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
    bio: 'Sharing my passion for everyday cooking with a modern twist.',
    youtubeUrl: 'https://youtube.com',
    instagramUrl: 'https://instagram.com',
    facebookUrl: 'https://facebook.com',
    threadsUrl: 'https://threads.net'
  },
  {
    id: 'c2',
    name: 'Chef Maria',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop',
    bio: 'Baking and desserts are my love language.'
  },
  {
    id: 'c3',
    name: 'Healthy Eats',
    avatarUrl: 'https://images.unsplash.com/photo-1581349485608-9469926a8e5e?w=400&h=400&fit=crop',
    bio: 'Wholesome, nutritious, and delicious recipes for a better life.'
  }
];

// Initial dummy data if storage is empty
const INITIAL_RECIPES: Recipe[] = [
  { 
    id: '1', 
    title: 'Mango Summer Shake', 
    slug: 'mango-summer-shake', 
    category: 'Shakes', 
    description: 'A refreshing tropical blend perfect for hot summer days.',
    ingredients: ['1 ripe mango', '1 cup milk', '2 tbsp honey', 'Ice cubes'],
    steps: ['Peel and chop mango', 'Blend all ingredients', 'Serve chilled'],
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=400&h=400&fit=crop', 
    likes: 124,
    featured: true,
    createdAt: Date.now() - 100000,
    creatorId: 'c1'
  },
  { 
    id: '2', 
    title: 'Healthy Buddha Bowl', 
    slug: 'healthy-buddha-bowl', 
    category: 'Healthy', 
    description: 'A nutrient-dense bowl filled with fresh vegetables and grains.',
    ingredients: ['Quinoa', 'Avocado', 'Chickpeas', 'Spinach', 'Tahini dressing'],
    steps: ['Cook quinoa', 'Assemble bowl', 'Drizzle with tahini'],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&h=400&fit=crop', 
    likes: 89,
    featured: true,
    createdAt: Date.now() - 200000,
    creatorId: 'c3'
  },
  {
    id: '3',
    title: 'Crispy Avocado Toast',
    slug: 'crispy-avocado-toast',
    category: 'Healthy',
    description: 'The golden classic for a perfect breakfast or brunch.',
    ingredients: ['Sourdough bread', 'Ripe avocado', 'Chili flakes', 'Lemon', 'Poached egg'],
    steps: ['Toast the bread', 'Mash avocado with lemon and salt', 'Spread on toast', 'Top with egg and chili'],
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400&h=400&fit=crop',
    likes: 215,
    featured: true,
    createdAt: Date.now() - 300000,
    creatorId: 'c1'
  },
  {
    id: '4',
    title: 'Blueberry Cheesecake',
    slug: 'blueberry-cheesecake',
    category: 'Desserts',
    description: 'Creamy, rich, and topped with a fresh blueberry compote.',
    ingredients: ['Cream cheese', 'Graham crackers', 'Sugar', 'Blueberries', 'Butter'],
    steps: ['Make the crust', 'Mix cream cheese filling', 'Bake and chill', 'Add blueberry topping'],
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&h=400&fit=crop',
    likes: 342,
    featured: false,
    createdAt: Date.now() - 400000,
    creatorId: 'c2'
  },
  {
    id: '5',
    title: 'Classic Cheeseburger',
    slug: 'classic-cheeseburger',
    category: 'Fast Food',
    description: 'Juicy beef patty with melted cheddar and fresh toppings.',
    ingredients: ['Beef patty', 'Cheddar cheese', 'Brioche bun', 'Lettuce', 'Tomato'],
    steps: ['Grill the patty', 'Toast buns', 'Assemble with toppings', 'Serve with fries'],
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&h=400&fit=crop',
    likes: 567,
    featured: false,
    createdAt: Date.now() - 500000,
    creatorId: 'c1'
  },
  {
    id: '6',
    title: 'Indian Butter Chicken',
    slug: 'indian-butter-chicken',
    category: 'Traditional',
    description: 'A creamy, rich tomato-based curry with tender pieces of chicken.',
    ingredients: ['Chicken breast', 'Tomato puree', 'Butter', 'Cream', 'Garam masala'],
    steps: ['Marinate chicken', 'Sauté in spices', 'Simmer in tomato gravy', 'Finish with cream'],
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&h=400&fit=crop',
    likes: 890,
    featured: true,
    createdAt: Date.now() - 600000,
    creatorId: 'c1'
  }
];

export const storage = {
  // Likes
  getLikedRecipeIds: (): string[] => {
    const recipes = storage.getRecipes();
    const recipeIds = new Set(recipes.map((recipe) => recipe.id));
    const slugToId = new Map(recipes.map((recipe) => [recipe.slug, recipe.id]));

    const parseIds = (value: string | null) => {
      if (!value) return [] as string[];

      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return [] as string[];

        return parsed
          .map((item) => slugToId.get(item) ?? item)
          .filter((item) => typeof item === 'string' && recipeIds.has(item));
      } catch {
        return [] as string[];
      }
    };

    const mergedIds = Array.from(
      new Set([
        ...parseIds(localStorage.getItem(LIKED_RECIPES_KEY)),
        ...parseIds(localStorage.getItem(LEGACY_LIKED_RECIPES_KEY)),
      ]),
    );

    if (mergedIds.length > 0) {
      localStorage.setItem(LIKED_RECIPES_KEY, JSON.stringify(mergedIds));
    }

    return mergedIds;
  },

  saveLikedRecipeIds: (ids: string[]) => {
    localStorage.setItem(LIKED_RECIPES_KEY, JSON.stringify(Array.from(new Set(ids))));
  },

  addLikedRecipe: (id: string) => {
    const likedIds = storage.getLikedRecipeIds();
    if (likedIds.includes(id)) return likedIds;

    const nextIds = [...likedIds, id];
    storage.saveLikedRecipeIds(nextIds);
    return nextIds;
  },

  removeLikedRecipe: (id: string) => {
    const nextIds = storage.getLikedRecipeIds().filter((recipeId) => recipeId !== id);
    storage.saveLikedRecipeIds(nextIds);
    return nextIds;
  },

  isRecipeLiked: (id: string) => storage.getLikedRecipeIds().includes(id),

  // Creators
  getCreators: (): Creator[] => {
    const data = localStorage.getItem(CREATORS_KEY);
    if (!data) {
      localStorage.setItem(CREATORS_KEY, JSON.stringify(INITIAL_CREATORS));
      return INITIAL_CREATORS;
    }
    return JSON.parse(data);
  },

  // Recipes
  getRecipes: (): Recipe[] => {
    const data = localStorage.getItem(RECIPES_KEY);
    if (!data) {
      localStorage.setItem(RECIPES_KEY, JSON.stringify(INITIAL_RECIPES));
      return INITIAL_RECIPES;
    }
    return JSON.parse(data);
  },
  
  saveRecipe: (recipe: Omit<Recipe, 'id' | 'likes' | 'createdAt'> & { id?: string }) => {
    const recipes = storage.getRecipes();
    if (recipe.id) {
      // Update
      const index = recipes.findIndex(r => r.id === recipe.id);
      if (index !== -1) {
        recipes[index] = { ...recipes[index], ...recipe };
      }
    } else {
      // Create
      const newRecipe: Recipe = {
        ...recipe as any,
        id: Math.random().toString(36).substr(2, 9),
        likes: 0,
        createdAt: Date.now()
      };
      recipes.unshift(newRecipe);
    }
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  },

  deleteRecipe: (id: string) => {
    const recipes = storage.getRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(filtered));
  },

  likeRecipe: (id: string) => {
    const recipes = storage.getRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1) {
      recipes[index].likes += 1;
      localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    }
  },

  unlikeRecipe: (id: string) => {
    const recipes = storage.getRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1 && recipes[index].likes > 0) {
      recipes[index].likes -= 1;
      localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    }
  },

  // Contact Messages
  saveContact: (msg: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    const msgs = JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
    msgs.unshift({ ...msg, id: Date.now().toString(), createdAt: Date.now() });
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(msgs));
  },

  // Collab Requests
  saveCollab: (req: Omit<CollaborationRequest, 'id' | 'createdAt'>) => {
    const reqs = JSON.parse(localStorage.getItem(COLLABS_KEY) || '[]');
    reqs.unshift({ ...req, id: Date.now().toString(), createdAt: Date.now() });
    localStorage.setItem(COLLABS_KEY, JSON.stringify(reqs));
  }
};
