/**
 * RTK Query Auth API
 * จำลอง backend endpoints ด้วย custom baseQuery + mock handlers
 * - POST /auth/login
 * - POST /auth/register
 * - POST /auth/logout
 * - POST /auth/refresh
 * - GET  /auth/me
 */

import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import {
  mockLogin,
  mockRegister,
  mockLogout,
  mockRefreshToken,
  mockGetMe,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type RefreshResponse,
} from '../lib/mockBackend';
import type { User } from '../types';

// ─── Custom Mock BaseQuery ─────────────────────────────────────────────────
// แทน fetchBaseQuery ด้วย custom function ที่เรียก mock handlers โดยตรง
// ในโปรเจกต์จริงให้เปลี่ยนเป็น fetchBaseQuery({ baseUrl: 'https://api.example.com' })

type MockArgs =
  | { endpoint: 'login'; body: LoginRequest }
  | { endpoint: 'register'; body: RegisterRequest }
  | { endpoint: 'logout'; body: { refreshToken: string } }
  | { endpoint: 'refresh'; body: { refreshToken: string } }
  | { endpoint: 'me'; headers: { Authorization: string } };

const mockBaseQuery: BaseQueryFn<MockArgs, unknown, { status: number; data: { message: string } }> = async (args) => {
  try {
    let data: unknown;
    switch (args.endpoint) {
      case 'login':
        data = await mockLogin(args.body);
        break;
      case 'register':
        data = await mockRegister(args.body);
        break;
      case 'logout':
        data = await mockLogout(args.body.refreshToken);
        break;
      case 'refresh':
        data = await mockRefreshToken(args.body.refreshToken);
        break;
      case 'me':
        data = await mockGetMe(args.headers.Authorization.replace('Bearer ', ''));
        break;
      default:
        return { error: { status: 404, data: { message: 'Endpoint not found' } } };
    }
    return { data };
  } catch (error: any) {
    return {
      error: {
        status: error?.status ?? 500,
        data: error?.data ?? { message: 'เกิดข้อผิดพลาดในระบบ' },
      },
    };
  }
};

// ─── Auth API Definition ───────────────────────────────────────────────────
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: mockBaseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    /** POST /auth/login */
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ endpoint: 'login', body }),
    }),

    /** POST /auth/register */
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ endpoint: 'register', body }),
    }),

    /** POST /auth/logout */
    logout: builder.mutation<{ message: string }, { refreshToken: string }>({
      query: (body) => ({ endpoint: 'logout', body }),
    }),

    /** POST /auth/refresh — รับ refresh token, คืน access token ใหม่ */
    refreshToken: builder.mutation<RefreshResponse, { refreshToken: string }>({
      query: (body) => ({ endpoint: 'refresh', body }),
    }),

    /** GET /auth/me — ดึงข้อมูล user ปัจจุบันด้วย access token */
    getMe: builder.query<User, string>({
      query: (accessToken) => ({
        endpoint: 'me',
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
} = authApi;
