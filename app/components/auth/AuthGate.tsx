/**
 * Auth Gate Component
 * ตรวจสอบสถานะ auth และแสดง Login/Register หรือ children ตามสถานะ
 * รองรับ auto-refresh token เมื่อ access token หมดอายุ
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { selectIsAuthenticated, selectIsInitialized } from '../../store/slices/authSliceNew';
import type { RootState } from '../../store';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state as any));
  const isInitialized = useSelector((state: RootState) => selectIsInitialized(state as any));
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // ถ้า session ยังไม่ initialized (กำลังโหลด) — แสดง loading
  if (!isInitialized) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>กำลังโหลดระบบ...</p>
      </div>
    );
  }

  // ถ้ายังไม่ได้ login — แสดงหน้า Auth
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // ถ้า login แล้ว — แสดง children ตามปกติ
  return <>{children}</>;
}
