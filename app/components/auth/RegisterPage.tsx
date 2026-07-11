import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, AlertCircle, Loader2, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register, registerState } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isLoading = registerState.isLoading;

  // Password strength check
  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'อ่อนมาก', 'อ่อน', 'ปานกลาง', 'แข็งแกร่ง', 'แข็งแกร่งมาก'][passwordStrength];
  const strengthClass = ['', 'strength-1', 'strength-2', 'strength-3', 'strength-4', 'strength-5'][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    try {
      await register(name, email, password, role);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  return (
    <div className="auth-page">
      {/* Background decorations */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      <div className="auth-card auth-card-wide">
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
          <h2 className="auth-title">สร้างบัญชีใหม่ ✨</h2>
          <p className="auth-subtitle">เริ่มต้นใช้งานระบบ E-Commerce ของเรา</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">ชื่อ-นามสกุล</label>
            <div className="auth-input-wrapper">
              <User className="auth-input-icon" size={16} />
              <input
                id="reg-name"
                type="text"
                required
                placeholder="เช่น สมชาย ใจดี"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">อีเมล</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={16} />
              <input
                id="reg-email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">รหัสผ่าน</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={16} />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="อย่างน้อย 6 ตัวอักษร"
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
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="strength-bar-wrapper">
                <div className="strength-bars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`strength-bar ${passwordStrength >= i ? strengthClass : ''}`}
                    />
                  ))}
                </div>
                <span className={`strength-label ${strengthClass}`}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">ยืนยันรหัสผ่าน</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={16} />
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
              />
              {confirmPassword && (
                <div className={`auth-match-icon ${confirmPassword === password ? 'text-emerald-400' : 'text-red-400'}`}>
                  <CheckCircle2 size={15} />
                </div>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="auth-field">
            <label className="auth-label">บทบาทในระบบ</label>
            <div className="role-selector">
              <label className={`role-option ${role === 'customer' ? 'role-option-active role-customer' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                  className="sr-only"
                />
                <span className="role-icon">🛒</span>
                <div>
                  <p className="role-name">Customer</p>
                  <p className="role-desc">ซื้อสินค้า & จัดการคำสั่งซื้อ</p>
                </div>
              </label>
              <label className={`role-option ${role === 'admin' ? 'role-option-active role-admin' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="sr-only"
                />
                <span className="role-icon">⚙️</span>
                <div>
                  <p className="role-name">Administrator</p>
                  <p className="role-desc">จัดการสินค้า & ระบบหลัง</p>
                </div>
              </label>
            </div>
          </div>

          {/* Error */}
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
            className="auth-submit-btn auth-submit-btn-register"
            id="register-submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="auth-spinner" />
                กำลังสมัครสมาชิก...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                สมัครสมาชิก
              </>
            )}
          </button>
        </form>

        {/* Switch to login */}
        <p className="auth-switch">
          มีบัญชีอยู่แล้ว?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="auth-switch-link"
            id="switch-to-login-btn"
          >
            เข้าสู่ระบบที่นี่
          </button>
        </p>
      </div>
    </div>
  );
}
