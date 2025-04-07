import { create } from 'zustand';

interface UserState {
  phoneNumber: string | null;
  isAuthenticated: boolean;
  setUser: (phoneNumber: string | null, isAuthenticated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<UserState>((set) => ({
  phoneNumber: null,
  isAuthenticated: false,
  setUser: (phoneNumber, isAuthenticated) => set({ phoneNumber, isAuthenticated }),
  logout: () => set({ phoneNumber: null, isAuthenticated: false }),
})); 