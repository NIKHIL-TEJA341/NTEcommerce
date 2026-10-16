import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product, quantity = 1, variant) => {
        set((state) => {
          const itemKey = variant ? `${product.id}-${variant.id}` : product.id;
          const existingIndex = state.items.findIndex(
            (item) => item.productId === product.id && item.variantId === (variant?.id || undefined)
          );

          const price = variant?.priceOverride ?? product.price;

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            const newQuantity = currentItem.quantity + quantity;
            // Cap at available stock
            const maxStock = variant ? variant.stockQuantity : product.stockQuantity;
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: Math.min(newQuantity, maxStock),
            };
            return { items: updatedItems, isOpen: true };
          } else {
            const newItem: CartItem = {
              id: itemKey,
              productId: product.id,
              variantId: variant?.id,
              product,
              selectedVariant: variant,
              quantity: Math.min(quantity, variant ? variant.stockQuantity : product.stockQuantity),
              priceAtAddition: price,
            };
            return { items: [...state.items, newItem], isOpen: true };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === itemId) {
              const maxStock = item.selectedVariant
                ? item.selectedVariant.stockQuantity
                : item.product.stockQuantity;
              return { ...item, quantity: Math.min(quantity, maxStock) };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const unitPrice = item.selectedVariant?.priceOverride ?? item.product.price;
          return total + unitPrice * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'nexus-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
