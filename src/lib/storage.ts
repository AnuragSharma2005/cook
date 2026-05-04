import { Recipe, ContactMessage, CollaborationRequest, Creator } from '../types';
import { appScriptApi } from './appScriptApi';

const RECIPES_KEY = 'kaju_recipes_v2';
const CONTACTS_KEY = 'kaju_contacts';
const COLLABS_KEY = 'kaju_collabs';
const CREATORS_KEY = 'kaju_creators_v3';
const LIKED_RECIPES_KEY = 'kaju_liked_recipes_v1';
const LEGACY_LIKED_RECIPES_KEY = 'kaju_likes_tracking';
const CACHE_TIMESTAMP_KEY = 'kaju_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Keep initial data as fallback only
const INITIAL_CREATORS: Creator[] = [
  {
    id: 'c1',
    name: "cookwithkaju",
    avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
    bio: '🥘 Dil se banao, maze se khao!.',
    youtubeUrl: 'https://youtube.com',
    instagramUrl: 'https://instagram.com',
    facebookUrl: 'https://facebook.com',
    threadsUrl: 'https://threads.net'
  },
];

const INITIAL_RECIPES: Recipe[] = [];

async function fetchCreatorsFromAPI(): Promise<Creator[]> {
  try {
    console.log('📡 Fetching creators from API...');
    const creators = await appScriptApi.listCreators();
    console.log('✅ Creators fetched:', creators);
    if (creators && Array.isArray(creators)) {
      localStorage.setItem(CREATORS_KEY, JSON.stringify(creators));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      return creators.length > 0 ? creators : INITIAL_CREATORS;
    }
  } catch (error) {
    console.error('❌ Failed to fetch creators from API:', error);
  }
  
  // Fallback to localStorage or initial data
  const cached = localStorage.getItem(CREATORS_KEY);
  console.log('📦 Using cached creators:', cached ? 'YES' : 'NO (using initial)');
  return cached ? JSON.parse(cached) : INITIAL_CREATORS;
}

async function fetchRecipesFromAPI(): Promise<Recipe[]> {
  try {
    console.log('📡 Fetching recipes from API...');
    const recipes = await appScriptApi.listRecipes();
    console.log('✅ Recipes fetched:', recipes);
    if (recipes && Array.isArray(recipes)) {
      localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      return recipes;
    }
  } catch (error) {
    console.error('❌ Failed to fetch recipes from API:', error);
  }
  
  // Fallback to localStorage or initial data
  const cached = localStorage.getItem(RECIPES_KEY);
  console.log('📦 Using cached recipes:', cached ? 'YES' : 'NO (using initial)');
  return cached ? JSON.parse(cached) : INITIAL_RECIPES;
}

function isCacheValid(): boolean {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;
  return Date.now() - parseInt(timestamp) < CACHE_DURATION;
}

export const storage = {
  // Likes
  getLikedRecipeIds: (): string[] => {
    const recipes = storage.getRecipesSync();
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

  // Creators - Sync version for backwards compatibility
  getCreators: (): Creator[] => {
    const cached = localStorage.getItem(CREATORS_KEY);
    return cached ? JSON.parse(cached) : INITIAL_CREATORS;
  },

  // Creators - Async version to fetch from API
  getCreatorsAsync: async (): Promise<Creator[]> => {
    return fetchCreatorsFromAPI();
  },

  // Recipes - Sync version for backwards compatibility
  getRecipes: (): Recipe[] => {
    const cached = localStorage.getItem(RECIPES_KEY);
    return cached ? JSON.parse(cached) : INITIAL_RECIPES;
  },

  // Recipes - Async version to fetch from API
  getRecipesAsync: async (): Promise<Recipe[]> => {
    return fetchRecipesFromAPI();
  },

  mergeRecipesCache: (recipesToMerge: Recipe[]) => {
    const cached = storage.getRecipesSync();
    const recipeMap = new Map(cached.map((recipe) => [recipe.id, recipe]));

    recipesToMerge.forEach((recipe) => {
      recipeMap.set(recipe.id, { ...recipeMap.get(recipe.id), ...recipe } as Recipe);
    });

    localStorage.setItem(RECIPES_KEY, JSON.stringify(Array.from(recipeMap.values())));
  },

  // Internal sync getter for likes calculation
  getRecipesSync: (): Recipe[] => {
    const cached = localStorage.getItem(RECIPES_KEY);
    return cached ? JSON.parse(cached) : INITIAL_RECIPES;
  },

  // Refresh data from API
  refreshCreators: async (): Promise<Creator[]> => {
    return fetchCreatorsFromAPI();
  },

  refreshRecipes: async (): Promise<Recipe[]> => {
    return fetchRecipesFromAPI();
  },

  // Recipe management
  saveRecipe: (recipe: Omit<Recipe, 'id' | 'likes' | 'createdAt'> & { id?: string }) => {
    const recipes = storage.getRecipesSync();
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
    const recipes = storage.getRecipesSync();
    const filtered = recipes.filter(r => r.id !== id);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(filtered));
  },

  likeRecipe: (id: string) => {
    const recipes = storage.getRecipesSync();
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1) {
      recipes[index].likes += 1;
      localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    }
  },

  unlikeRecipe: (id: string) => {
    const recipes = storage.getRecipesSync();
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
