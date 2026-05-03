import { AuthSession } from '../types';

const SESSION_KEY = 'kaju_app_session_v1';

export const sessionStorageAdapter = {
  get: (): AuthSession | null => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },
  set: (session: AuthSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear: () => {
    localStorage.removeItem(SESSION_KEY);
  },
};
