// store/appStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Wishlist ──────────────────────────────────────────────────────────────────
interface WishlistStore {
  items:      string[];
  addItem:    (id: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  hasItem:    (id: string) => boolean;
  clearAll:   () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items:      [],
      addItem:    (id) => set((s) => ({ items: [...new Set([...s.items, id])] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i !== id) })),
      toggleItem: (id) => get().hasItem(id) ? get().removeItem(id) : get().addItem(id),
      hasItem:    (id) => get().items.includes(id),
      clearAll:   () => set({ items: [] }),
    }),
    { name: 'easy-deals-wishlist', storage: createJSONStorage(() => localStorage) }
  )
);

// ── Recently Viewed ───────────────────────────────────────────────────────────
interface RecentlyViewedStore {
  productIds:  string[];
  addViewed:   (id: string) => void;
  clearViewed: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      productIds: [],
      addViewed:  (id) => set((s) => ({
        productIds: [id, ...s.productIds.filter((p) => p !== id)].slice(0, 20),
      })),
      clearViewed: () => set({ productIds: [] }),
    }),
    { name: 'easy-deals-recently-viewed', storage: createJSONStorage(() => localStorage) }
  )
);

// ── UI ────────────────────────────────────────────────────────────────────────
interface UIStore {
  sidebarOpen:     boolean;
  toggleSidebar:   () => void;
  closeSidebar:    () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarOpen:   false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar:  () => set({ sidebarOpen: false }),
}));