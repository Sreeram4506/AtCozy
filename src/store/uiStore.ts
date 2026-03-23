import { create } from 'zustand';
import type { ProductItem } from '../config';

interface UIState {
  isSearchOpen: boolean;
  isQuickViewOpen: boolean;
  isWishlistOpen: boolean;
  selectedProduct: ProductItem | null;
  
  openSearch: () => void;
  closeSearch: () => void;
  
  openWishlist: () => void;
  closeWishlist: () => void;
  
  openQuickView: (product: ProductItem) => void;
  closeQuickView: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isQuickViewOpen: false,
  isWishlistOpen: false,
  selectedProduct: null,
  
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  
  openWishlist: () => set({ isWishlistOpen: true }),
  closeWishlist: () => set({ isWishlistOpen: false }),
  
  openQuickView: (product) => set({ isQuickViewOpen: true, selectedProduct: product }),
  closeQuickView: () => set({ isQuickViewOpen: false, selectedProduct: null }),
}));
