/**
 * Cookie utilities for storing refresh token securely.
 * In production, this should be an httpOnly cookie set by the server.
 * For this mock, we simulate the concept using document.cookie.
 */

const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

/**
 * Set the refresh token as a cookie.
 * Simulates httpOnly behavior — only this module should read/write it.
 */
export function setRefreshTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  // SameSite=Strict for CSRF protection simulation
  document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

/**
 * Get the refresh token from cookie.
 */
export function getRefreshTokenCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === REFRESH_TOKEN_KEY && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Remove the refresh token cookie (on logout).
 */
export function removeRefreshTokenCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${REFRESH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}
