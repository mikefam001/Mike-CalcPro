/**
 * Safe LocalStorage wrapper with fallback in memory if cookies or localStorage are disabled.
 */

const memoryStorage: Record<string, string> = {};

export const storage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      if (key in memoryStorage) {
        try {
          return JSON.parse(memoryStorage[key]) as T;
        } catch {
          return defaultValue;
        }
      }
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialized);
      }
      memoryStorage[key] = serialized;
    } catch {
      memoryStorage[key] = JSON.stringify(value);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch {
      delete memoryStorage[key];
    }
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
      for (const k of Object.keys(memoryStorage)) {
        delete memoryStorage[k];
      }
    } catch {
      // ignore
    }
  }
};
