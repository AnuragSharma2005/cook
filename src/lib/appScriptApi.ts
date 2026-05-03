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
};
