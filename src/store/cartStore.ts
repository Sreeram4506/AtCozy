import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  wishlist: number[];
  
  // Cart actions
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  
  // Wishlist actions
  toggleWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      wishlist: [],
      
      addToCart: (item) => {
        const existingItem = get().items.find((i) => i.id === item.id && i.size === item.size);
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === item.id && i.size === item.size
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
        set({ isOpen: true });
      },
      
      removeFromCart: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
        }
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setCartOpen: (open) => set({ isOpen: open }),
      
      toggleWishlist: (id) => {
        const isInWishlist = get().wishlist.includes(id);
        if (isInWishlist) {
          set({ wishlist: get().wishlist.filter((w) => w !== id) });
        } else {
          set({ wishlist: [...get().wishlist, id] });
        }
      },
      
      isInWishlist: (id) => get().wishlist.includes(id),
      
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      
      getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'luxe-cart-storage',
      partialize: (state) => ({ items: state.items, wishlist: state.wishlist }),
    }
  )
);
