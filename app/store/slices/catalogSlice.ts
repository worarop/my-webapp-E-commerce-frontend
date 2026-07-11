import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types';

interface CatalogState {
  products: Product[];
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Keychron Q1 Mechanical Keyboard',
    description: 'A fully customizable 75% layout mechanical keyboard with hot-swappable switches, double-gasket design, and CNC aluminum body.',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop',
    category: 'Keyboards',
    stock: 15,
    rating: { rate: 4.8, count: 124 }
  },
  {
    id: 'prod-2',
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise-canceling wireless headphones with auto noise-canceling optimizer, crystal-clear hands-free calling, and 30-hour battery life.',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    category: 'Audio',
    stock: 8,
    rating: { rate: 4.9, count: 342 }
  },
  {
    id: 'prod-3',
    name: 'Apple Watch Series 9',
    description: 'Smartwatch featuring the S9 SiP, a magical way to use your watch without touching the screen, a brighter display, and health sensors.',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
    category: 'Wearables',
    stock: 25,
    rating: { rate: 4.7, count: 98 }
  },
  {
    id: 'prod-4',
    name: 'Bellroy Premium Leather Backpack',
    description: 'A dual-compartment work backpack with clean, professional styling and premium environmentally certified leather panels.',
    price: 229.00,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
    category: 'Bags & Accessories',
    stock: 12,
    rating: { rate: 4.6, count: 54 }
  },
  {
    id: 'prod-5',
    name: 'Herman Miller Aeron Chair',
    description: 'The benchmark for ergonomic seating. Features adjustable PostureFit SL back support, breathable Pellicle suspension, and tilt controls.',
    price: 1495.00,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600&auto=format&fit=crop',
    category: 'Furniture',
    stock: 5,
    rating: { rate: 5.0, count: 86 }
  },
  {
    id: 'prod-6',
    name: 'Minimalist Felt Desk Mat',
    description: 'Made from premium merino wool felt to protect your desk and provide a soft, tactile surface for typing and mouse movements.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=600&auto=format&fit=crop',
    category: 'Office Accessories',
    stock: 40,
    rating: { rate: 4.5, count: 215 }
  }
];

const loadInitialState = (): CatalogState => {
  if (typeof window === 'undefined') return { products: INITIAL_PRODUCTS };
  try {
    const storedProducts = localStorage.getItem('ec_products');
    const products = storedProducts ? JSON.parse(storedProducts) : INITIAL_PRODUCTS;
    return { products };
  } catch (e) {
    return { products: INITIAL_PRODUCTS };
  }
};

const initialState: CatalogState = loadInitialState();

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<Product, 'id' | 'rating'>>) => {
      const newProduct: Product = {
        ...action.payload,
        id: `prod-${Date.now()}`,
        rating: { rate: 4.5, count: 1 }
      };
      state.products.push(newProduct);
    },
    updateProduct: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<Product, 'id'>> }>) => {
      const { id, updates } = action.payload;
      const productIndex = state.products.findIndex(p => p.id === id);
      if (productIndex !== -1) {
        state.products[productIndex] = { ...state.products[productIndex], ...updates } as Product;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    adjustStock: (state, action: PayloadAction<{ id: string; change: number }>) => {
      const { id, change } = action.payload;
      const product = state.products.find(p => p.id === id);
      if (product) {
        product.stock = Math.max(0, product.stock + change);
      }
    }
  }
});

export const { addProduct, updateProduct, deleteProduct, adjustStock } = catalogSlice.actions;
export default catalogSlice.reducer;
