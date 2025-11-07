// Simple client-side auth util for protecting routes
// Uses localStorage to store an auth flag and a configurable password via env

const STORAGE_KEY = 'borelli_auth_ok';
const ENV_PASSWORD = (import.meta as any).env?.VITE_DASH_PASSWORD as string | undefined;
const DEFAULT_PASSWORD = 'borellivv@027';
const PASSWORD = ENV_PASSWORD && ENV_PASSWORD.length > 0 ? ENV_PASSWORD : DEFAULT_PASSWORD;

export const checkPassword = (input: string): boolean => {
  return input === PASSWORD;
};

export const setAuthenticated = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {}
};

export const clearAuthenticated = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const isAuthenticated = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const getPasswordHint = (): string | undefined => {
  // Optional helper if we ever want to display minimal hint
  return undefined;
};