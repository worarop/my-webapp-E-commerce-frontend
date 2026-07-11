/**
 * Mock Backend Database & Token Generator
 * Simulates a real auth backend (JWT tokens, user storage, token expiry)
 */

import type { User } from '../types';

// ─── Token Utilities ───────────────────────────────────────────────────────

/** Generate a fake JWT-like access token (expires in 15min) */
export function generateAccessToken(userId: string): string {
  const payload = btoa(JSON.stringify({ sub: userId, type: 'access', iat: Date.now(), exp: Date.now() + 15 * 60 * 1000 }));
  return `mock.${payload}.sig`;
}

/** Generate a fake refresh token (expires in 7 days) */
export function generateRefreshToken(userId: string): string {
  const payload = btoa(JSON.stringify({ sub: userId, type: 'refresh', iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  return `mock-refresh.${payload}.sig`;
}

/** Decode a mock token (returns null if invalid/expired) */
export function decodeToken(token: string): { sub: string; type: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1]));
    if (decoded.exp < Date.now()) return null; // expired
    return decoded;
  } catch {
    return null;
  }
}

// ─── In-Memory Database ────────────────────────────────────────────────────

export interface DbUser extends User {
  password: string;
}

const DB_KEY = 'mock_auth_db';

const DEFAULT_USERS: DbUser[] = [
  { id: 'usr-1', email: 'admin@ecommerce.com', name: 'System Admin', role: 'admin', balance: 5000, password: 'admin123' },
  { id: 'usr-2', email: 'customer@ecommerce.com', name: 'John Doe', role: 'customer', balance: 1000, password: 'customer123' },
];

export function loadDb(): DbUser[] {
  if (typeof localStorage === 'undefined') return DEFAULT_USERS;
  try {
    const stored = localStorage.getItem(DB_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveDb(users: DbUser[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}

// Refresh token store: { refreshToken → userId }
const refreshTokenStore = new Map<string, string>();

// ─── Mock API Handlers ─────────────────────────────────────────────────────

function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { name: string; email: string; password: string; role: 'admin' | 'customer' }
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}
export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

// ─── Login ─────────────────────────────────────────────────────────────────
export async function mockLogin(req: LoginRequest): Promise<AuthResponse> {
  await delay(700);
  const users = loadDb();
  const user = users.find((u) => u.email.toLowerCase() === req.email.toLowerCase());
  if (!user || user.password !== req.password) {
    throw { status: 401, data: { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } };
  }
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  refreshTokenStore.set(refreshToken, user.id);
  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken, expiresIn: 900 };
}

// ─── Register ──────────────────────────────────────────────────────────────
export async function mockRegister(req: RegisterRequest): Promise<AuthResponse> {
  await delay(900);
  const users = loadDb();
  if (users.find((u) => u.email.toLowerCase() === req.email.toLowerCase())) {
    throw { status: 409, data: { message: 'อีเมลนี้ถูกใช้งานแล้ว' } };
  }
  const newUser: DbUser = {
    id: `usr-${Date.now()}`,
    email: req.email,
    name: req.name,
    role: req.role,
    balance: req.role === 'admin' ? 5000 : 1000,
    password: req.password,
  };
  users.push(newUser);
  saveDb(users);
  const accessToken = generateAccessToken(newUser.id);
  const refreshToken = generateRefreshToken(newUser.id);
  refreshTokenStore.set(refreshToken, newUser.id);
  const { password: _, ...safeUser } = newUser;
  return { user: safeUser, accessToken, refreshToken, expiresIn: 900 };
}

// ─── Logout ────────────────────────────────────────────────────────────────
export async function mockLogout(refreshToken: string): Promise<{ message: string }> {
  await delay(300);
  refreshTokenStore.delete(refreshToken);
  return { message: 'ออกจากระบบสำเร็จ' };
}

// ─── Refresh Token ─────────────────────────────────────────────────────────
export async function mockRefreshToken(refreshToken: string): Promise<RefreshResponse> {
  await delay(400);
  const userId = refreshTokenStore.get(refreshToken);
  if (!userId) {
    throw { status: 401, data: { message: 'Refresh token ไม่ถูกต้องหรือหมดอายุ' } };
  }
  const decoded = decodeToken(refreshToken);
  if (!decoded) {
    refreshTokenStore.delete(refreshToken);
    throw { status: 401, data: { message: 'Refresh token หมดอายุแล้ว กรุณา login ใหม่' } };
  }
  const newAccessToken = generateAccessToken(userId);
  return { accessToken: newAccessToken, expiresIn: 900 };
}

// ─── Get Me ────────────────────────────────────────────────────────────────
export async function mockGetMe(accessToken: string): Promise<User> {
  await delay(300);
  const decoded = decodeToken(accessToken);
  if (!decoded) {
    throw { status: 401, data: { message: 'Access token หมดอายุหรือไม่ถูกต้อง' } };
  }
  const users = loadDb();
  const user = users.find((u) => u.id === decoded.sub);
  if (!user) {
    throw { status: 404, data: { message: 'ไม่พบผู้ใช้' } };
  }
  const { password: _, ...safeUser } = user;
  return safeUser;
}
