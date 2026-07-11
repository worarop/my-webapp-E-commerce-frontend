/**
 * Custom hook สำหรับ Auth operations
 * ห่อ RTK Query mutations + dispatch Redux actions
 */

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useLoginMutation, useRegisterMutation, useLogoutMutation, useRefreshTokenMutation } from '../services/authApi';
import {
  clearCredentials,
  selectCurrentUser,
  selectAccessToken,
  selectIsAuthenticated,
  selectIsInitialized,
} from '../store/slices/authSliceNew';
import { getRefreshTokenCookie } from '../lib/cookieUtils';
import type { AppDispatch } from '../store';
import type { RootState } from '../store';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => selectCurrentUser(state as any));
  const accessToken = useSelector((state: RootState) => selectAccessToken(state as any));
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state as any));
  const isInitialized = useSelector((state: RootState) => selectIsInitialized(state as any));

  const [loginMutation, loginState] = useLoginMutation();
  const [registerMutation, registerState] = useRegisterMutation();
  const [logoutMutation, logoutState] = useLogoutMutation();
  const [refreshMutation, refreshState] = useRefreshTokenMutation();

  /** Login */
  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation({ email, password }).unwrap();
      return result;
    },
    [loginMutation]
  );

  /** Register */
  const register = useCallback(
    async (name: string, email: string, password: string, role: 'admin' | 'customer' = 'customer') => {
      const result = await registerMutation({ name, email, password, role }).unwrap();
      return result;
    },
    [registerMutation]
  );

  /** Logout */
  const logout = useCallback(async () => {
    const refreshToken = getRefreshTokenCookie();
    if (refreshToken) {
      try {
        await logoutMutation({ refreshToken }).unwrap();
      } catch {
        // ถ้า logout API ล้มเหลวก็ยัง clear state ได้
        dispatch(clearCredentials());
      }
    } else {
      dispatch(clearCredentials());
    }
  }, [logoutMutation, dispatch]);

  /** Refresh access token using refresh token from cookie */
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = getRefreshTokenCookie();
    if (!refreshToken) throw new Error('ไม่มี refresh token — กรุณา login ใหม่');
    const result = await refreshMutation({ refreshToken }).unwrap();
    return result;
  }, [refreshMutation]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
    refreshAccessToken,
    loginState,
    registerState,
    logoutState,
    refreshState,
  };
}
