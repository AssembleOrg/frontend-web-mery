import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { CartState, CartItem, Course } from '@/types';

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],

      addToCart: (course: Course) => {
        // Prevent USD courses from being added to cart
        if (course.currency === 'USD') {
          console.warn('Cannot add USD course to cart:', course.title);
          return;
        }

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.course.id === course.id
          );

          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            state.items.push({
              course,
              quantity: 1,
            });
          }
        });
      },

      removeFromCart: (courseId: string) => {
        set((state) => {
          state.items = state.items.filter(
            (item) => item.course.id !== courseId
          );
        });
      },

      updateQuantity: (courseId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            state.items = state.items.filter(
              (item) => item.course.id !== courseId
            );
          } else {
            const item = state.items.find(
              (item) => item.course.id === courseId
            );
            if (item) {
              item.quantity = quantity;
            }
          }
        });
      },

      clearCart: () => {
        set((state) => {
          state.items = [];
        });
      },

      getTotal: () => {
        const items = get().items;
        return items.reduce(
          (total, item) => total + item.course.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    })),
    {
      name: 'cart-storage',
      version: 1,
    }
  )
);
