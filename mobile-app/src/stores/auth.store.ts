import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  role: string;
  fullName: string;
  phone: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isFirstLaunch: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setIsFirstLaunch: (isFirstLaunch: boolean) => void;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  isFirstLaunch: true,

  setToken: (token) => {
    if (token) {
      SecureStore.setItemAsync('auth_token', token).catch(console.error);
    } else {
      SecureStore.deleteItemAsync('auth_token').catch(console.error);
    }
    set({ token });
  },

  setUser: (user) => set({ user }),

  setIsFirstLaunch: (isFirstLaunch) => {
    if (!isFirstLaunch) {
      SecureStore.setItemAsync('has_launched', 'true').catch(console.error);
    }
    set({ isFirstLaunch });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, user: null });
  },

  restoreToken: async () => {
    try {
      const [token, hasLaunched] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        SecureStore.getItemAsync('has_launched')
      ]);
      set({ 
        token, 
        isFirstLaunch: hasLaunched !== 'true',
        isLoading: false 
      });
    } catch (e) {
      console.error('Failed to restore token', e);
      set({ isLoading: false, isFirstLaunch: true });
    }
  }
}));
