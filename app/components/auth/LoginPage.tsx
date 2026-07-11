import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle, Loader2, Sparkles, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login, loginState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isLoading = loginState.isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  const fillDemo = (preset: 'admin' | 'customer') => {
    if (preset === 'admin') {
      setEmail('admin@ecommerce.com');
      setPassword('admin123');
    } else {
      setEmail('customer@ecommerce.com');
      setPassword('customer123');
    }
    setErrorMsg('');
  };

  return (
    <div className="auth-page">
      {/* Background decorations */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 className="auth-logo-title">AeroCart</h1>
            <p className="auth-logo-sub">Microservices Demo</p>
          </div>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h2 className="auth-title">ยินดีต้อนรับกลับ 👋</h2>
          <p className="auth-subtitle">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {/* Demo preset buttons */}
        <div className="auth-demo-section">
          <p className="auth-demo-label">
            <Sparkles size={12} />
            ทดสอบด่วน
          </p>
          <div className="auth-demo-btns">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="auth-demo-btn auth-demo-btn-admin"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              className="auth-demo-btn auth-demo-btn-customer"
            >
              Customer Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">อีเมล</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={16} />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">รหัสผ่าน</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={16} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input auth-input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-toggle-pw"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="auth-error">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-submit-btn"
            id="login-submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="auth-spinner" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                <LogIn size={16} />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>

        {/* Switch to register */}
        <p className="auth-switch">
          ยังไม่มีบัญชี?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="auth-switch-link"
            id="switch-to-register-btn"
          >
            สมัครสมาชิกที่นี่
          </button>
        </p>
      </div>
    </div>
  );
}
