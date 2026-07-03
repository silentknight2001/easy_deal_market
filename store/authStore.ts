// store/authStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthStore {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  setUser:    (user: User | null) => void;
  setLoading: (v: boolean) => void;
  clearAuth:  () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:            null,
      isLoading:       true,
      isAuthenticated: false,
      setUser:    (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth:  () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name:    'easy-deals-auth',
      storage: createJSONStorage(() => sessionStorage), // clears on tab close
      partialize: (s) => ({
        // Only persist non-sensitive display fields — never tokens or secrets
        user: s.user ? {
          uid:             s.user.uid,
          displayName:     s.user.displayName,
          photoURL:        s.user.photoURL,
          role:            s.user.role,
          isVerifiedSeller: s.user.isVerifiedSeller,
        } : null,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);