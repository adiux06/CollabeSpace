import { create } from 'zustand';
import type { User, Workspace } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  activeWorkspace: Workspace | null;
  setUser: (user: User | null) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken') || !!localStorage.getItem('user'),
  activeWorkspace: null,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user, isAuthenticated: !!user });
  },
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, activeWorkspace: null });
  },
}));
