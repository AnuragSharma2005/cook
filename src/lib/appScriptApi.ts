import { AppUser, AuthSession, CollaboratorPost, UserRole } from '../types';

const WEB_APP_URL = import.meta.env.VITE_APPS_SCRIPT_WEB_APP_URL as string | undefined;

export type CollaboratorInput = {
  id?: string;
  email: string;
  password?: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  threadsUrl?: string;
  twitterUrl?: string;
  isActive?: boolean;
  role?: 'creator' | 'collaborator' | 'admin';
};

export type CreatorInput = {
  id?: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  threadsUrl?: string;
  twitterUrl?: string;
};

export type RecipeInput = {
  id?: string;
  title: string;
  slug?: string;
  category: string;
  description?: string;
  ingredients?: string | string[];
  steps?: string | string[];
  imageUrl?: string;
  images?: string[];
  prepTime?: string;
  cookTime?: string;
  likes?: number;
  featured?: boolean;
  creatorId?: string;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type LoginResponse = AuthSession & { role: UserRole };

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const normalizeUrl = () => {
  if (!WEB_APP_URL) {
    throw new Error('Set VITE_APPS_SCRIPT_WEB_APP_URL to your deployed Apps Script web app URL.');
  }

  return WEB_APP_URL;
};

async function request<T>(action: string, payload: Record<string, string | number | boolean | undefined> = {}) {
  const url = normalizeUrl();
  const body = new URLSearchParams();
  body.set('action', action);

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      body.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: body.toString(),
  });

  const result = (await response.json()) as ApiResponse<T>;
  if (!result.ok || !result.data) {
    throw new Error(result.error || 'Apps Script request failed.');
  }

  return result.data;
}

export const appScriptApi = {
  login: (email: string, password: string) => request<LoginResponse>('login', { email, password }),
  me: (token: string) => request<AuthSession>('me', { token }),
  logout: (token: string) => request<{ success: boolean }>('logout', { token }),
  listCollaborators: (token: string) => request<AppUser[]>('listCollaborators', { token }),
  createCollaborator: (token: string, collaborator: CollaboratorInput) =>
    request<AppUser>('createCollaborator', { token, ...collaborator }),
  updateCollaborator: (token: string, collaborator: CollaboratorInput) =>
    request<AppUser>('updateCollaborator', { token, ...collaborator }),
  listMyPosts: (token: string) => request<CollaboratorPost[]>('listMyPosts', { token }),
  savePost: (token: string, post: Partial<CollaboratorPost> & { title: string; content: string; imageUrl: string; status: 'draft' | 'published' }) =>
    request<CollaboratorPost>('savePost', { token, ...post }),
  listCreators: () => request<any[]>('listCreators', {}),
  createCreator: (token: string, creator: CreatorInput) =>
    request<any>('createCreator', { token, ...creator }),
  updateCreator: (token: string, creator: CreatorInput & { id: string }) =>
    request<any>('updateCreator', { token, ...creator }),
  listRecipes: async () => {
    const response = await request<PagedResult<any>>('listRecipes', { page: 1, pageSize: 1000 });
    return Array.isArray((response as any).items) ? (response as any).items : (response as any);
  },
  listRecipesPage: (page: number, pageSize: number) => request<PagedResult<any>>('listRecipes', { page, pageSize }),
  createRecipe: (token: string, recipe: RecipeInput) => {
    const payload: Record<string, string | number | boolean | undefined> = {
      token,
      title: recipe.title,
      slug: recipe.slug,
      category: recipe.category,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      // support multiple images as JSON
      images: Array.isArray(recipe.images) ? JSON.stringify(recipe.images) : undefined,
      prepTime: recipe['prepTime'],
      cookTime: recipe['cookTime'],
      likes: recipe.likes,
      featured: recipe.featured,
      creatorId: recipe.creatorId,
      ingredients: typeof recipe.ingredients === 'string' ? recipe.ingredients : JSON.stringify(recipe.ingredients || []),
      steps: typeof recipe.steps === 'string' ? recipe.steps : JSON.stringify(recipe.steps || []),
    };
    return request<any>('createRecipe', payload);
  },
  updateRecipe: (token: string, recipe: RecipeInput & { id: string }) => {
    const payload: Record<string, string | number | boolean | undefined> = {
      token,
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      category: recipe.category,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      images: Array.isArray(recipe.images) ? JSON.stringify(recipe.images) : undefined,
      prepTime: recipe['prepTime'],
      cookTime: recipe['cookTime'],
      likes: recipe.likes,
      featured: recipe.featured,
      creatorId: recipe.creatorId,
      ingredients: typeof recipe.ingredients === 'string' ? recipe.ingredients : JSON.stringify(recipe.ingredients || []),
      steps: typeof recipe.steps === 'string' ? recipe.steps : JSON.stringify(recipe.steps || []),
    };
    return request<any>('updateRecipe', payload);
  },
  adjustRecipeLikes: (id: string, delta: 1 | -1) => request<{ id: string; likes: number }>('adjustRecipeLikes', { id, delta }),
};
