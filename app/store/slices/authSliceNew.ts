/**
 * Auth Slice (RTK)
 * เก็บ: accessToken (ใน Redux memory), user info
 * refreshToken: เก็บใน Cookie — จัดการโดย cookieUtils.ts
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { authApi } from '../../services/authApi';
import {
  setRefreshTokenCookie,
  getRefreshTokenCookie,
  removeRefreshTokenCookie,
} from '../../lib/cookieUtils';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // ตรวจสอบ session ครั้งแรก
}

function loadInitialState(): AuthState {
  // ดึง accessToken จาก sessionStorage (ถ้ามี — เพื่อ persist ตลอด tab)
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, isAuthenticated: false, isInitialized: false };
  }
  try {
    const savedToken = sessionStorage.getItem('auth_access_token');
    const savedUser = sessionStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      return {
        user: JSON.parse(savedUser),
        accessToken: savedToken,
        isAuthenticated: true,
        isInitialized: true,
      };
    }
  } catch {}
  // ไม่มี session → ยังคง initialized (ตรวจสอบแล้ว แค่ยังไม่ได้ login)
  return { user: null, accessToken: null, isAuthenticated: false, isInitialized: true };
}

const initialState: AuthState = loadInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** เซ็ต credentials โดยตรง (ใช้หลัง login/refresh สำเร็จ) */
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
      // Persist ใน sessionStorage สำหรับ page reload
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('auth_access_token', action.payload.accessToken);
        sessionStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      }
    },
    /** อัพเดท access token หลัง refresh (ไม่เปลี่ยน user) */
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('auth_access_token', action.payload);
      }
    },
    /** Clear session (logout) */
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      removeRefreshTokenCookie();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('auth_access_token');
        sessionStorage.removeItem('auth_user');
      }
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    // 🔐 Login success → เซ็ต credentials + บันทึก refresh token ใน cookie
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
      setRefreshTokenCookie(refreshToken);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('auth_access_token', accessToken);
        sessionStorage.setItem('auth_user', JSON.stringify(user));
      }
    });

    // 📝 Register success → เซ็ต credentials + บันทึก refresh token ใน cookie
    builder.addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
      setRefreshTokenCookie(refreshToken);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('auth_access_token', accessToken);
        sessionStorage.setItem('auth_user', JSON.stringify(user));
      }
    });

    // 🔄 Refresh success → อัพเดท access token เท่านั้น
    builder.addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('auth_access_token', action.payload.accessToken);
      }
    });

    // 🚪 Logout success → clear state
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      removeRefreshTokenCookie();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('auth_access_token');
        sessionStorage.removeItem('auth_user');
      }
    });
  },
});

export const { setCredentials, updateAccessToken, clearCredentials, setInitialized } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
