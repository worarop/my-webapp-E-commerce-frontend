import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  users: User[];
  currentUser: User | null;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    email: 'admin@ecommerce.com',
    name: 'System Admin',
    role: 'admin',
    balance: 5000.00
  },
  {
    id: 'usr-2',
    email: 'customer@ecommerce.com',
    name: 'John Doe',
    role: 'customer',
    balance: 1000.00
  }
];

const loadInitialState = (): AuthState => {
  if (typeof window === 'undefined') return { users: DEFAULT_USERS, currentUser: DEFAULT_USERS[1] };
  try {
    const storedUsers = localStorage.getItem('ec_users');
    const storedCurrentUser = localStorage.getItem('ec_current_user');
    const users = storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;
    const currentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : users[1] || null;
    return { users, currentUser };
  } catch (e) {
    return { users: DEFAULT_USERS, currentUser: DEFAULT_USERS[1] };
  }
};

const initialState: AuthState = loadInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<string>) => {
      const user = state.users.find(u => u.email.toLowerCase() === action.payload.toLowerCase());
      if (user) {
        state.currentUser = user;
      }
    },
    logout: (state) => {
      state.currentUser = null;
    },
    registerUser: (state, action: PayloadAction<{ name: string; email: string; role: 'admin' | 'customer' }>) => {
      const existing = state.users.find(u => u.email.toLowerCase() === action.payload.email.toLowerCase());
      if (existing) {
        throw new Error('Email already registered');
      }
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: action.payload.email,
        name: action.payload.name,
        role: action.payload.role,
        balance: action.payload.role === 'admin' ? 5000 : 1000
      };
      state.users.push(newUser);
      state.currentUser = newUser;
    },
    depositBalance: (state, action: PayloadAction<{ userId: string; amount: number }>) => {
      const { userId, amount } = action.payload;
      const user = state.users.find(u => u.id === userId);
      if (user) {
        user.balance = Number((user.balance + amount).toFixed(2));
        if (state.currentUser?.id === userId) {
          state.currentUser.balance = user.balance;
        }
      }
    },
    chargeBalance: (state, action: PayloadAction<{ userId: string; amount: number }>) => {
      const { userId, amount } = action.payload;
      const user = state.users.find(u => u.id === userId);
      if (user && user.balance >= amount) {
        user.balance = Number((user.balance - amount).toFixed(2));
        if (state.currentUser?.id === userId) {
          state.currentUser.balance = user.balance;
        }
      }
    }
  }
});

export const { setCurrentUser, logout, registerUser, depositBalance, chargeBalance } = authSlice.actions;
export default authSlice.reducer;
