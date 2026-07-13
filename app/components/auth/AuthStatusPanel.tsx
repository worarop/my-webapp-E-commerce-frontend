/**
 * Auth Status Panel — แสดงสถานะ Token สำหรับ debug/demo
 * แสดง: user info, access token (masked), refresh token status, expiry info
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Shield, Key, Cookie, RefreshCw, LogOut, ChevronDown, ChevronUp, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getRefreshTokenCookie } from '../../lib/cookieUtils';
import { decodeToken } from '../../lib/mockBackend';
import { selectCurrentUser, selectAccessToken } from '../../store/slices/authSliceNew';
import type { RootState } from '../../store';

export function AuthStatusPanel() {
  const { logout, refreshAccessToken, logoutState, refreshState } = useAuth();
  const user = useSelector((state: RootState) => selectCurrentUser(state as any));
  const accessToken = useSelector((state: RootState) => selectAccessToken(state as any));
  const [expanded, setExpanded] = useState(false);

  const refreshToken = getRefreshTokenCookie();
  const decodedAccess = accessToken ? decodeToken(accessToken) : null;
  const decodedRefresh = refreshToken ? decodeToken(refreshToken) : null;

  const maskToken = (token: string | null) => {
    if (!token) return '—';
    return `${token.slice(0, 12)}...${token.slice(-8)}`;
  };

  const formatExp = (exp: number | undefined) => {
    if (!exp) return 'ไม่ทราบ';
    const remaining = Math.round((exp - Date.now()) / 1000);
    if (remaining <= 0) return '⚠️ หมดอายุแล้ว';
    if (remaining < 60) return `${remaining} วินาที`;
    if (remaining < 3600) return `${Math.round(remaining / 60)} นาที`;
    return `${Math.round(remaining / 3600)} ชั่วโมง`;
  };

  return (
    <div className="auth-status-panel">
      {/* Header */}
      <div className="auth-status-header" onClick={() => setExpanded(!expanded)}>
        <div className="auth-status-user">
          <div className="auth-status-avatar">
            {user?.name?.[0]?.toUpperCase() || 'G'}
          </div>
          <div>
            <p className="auth-status-name">{user?.name || 'Guest User'}</p>
            <p className="auth-status-email">{user?.email || 'Not logged in'}</p>
          </div>
          {user && (
            <span className={`auth-status-role ${user?.role === 'admin' ? 'role-badge-admin' : 'role-badge-customer'}`}>
              {user?.role}
            </span>
          )}
        </div>
        <button className="auth-status-toggle">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Token Details (expandable) */}
      {expanded && (
        <div className="auth-status-body">
          {/* Access Token */}
          <div className="token-info">
            <div className="token-info-header">
              <Key size={13} />
              <span>Access Token (Redux)</span>
              <span className={`token-badge ${decodedAccess ? 'token-valid' : 'token-invalid'}`}>
                {decodedAccess ? <CheckCircle2 size={10} /> : '✗'}
                {decodedAccess ? 'Valid' : 'Invalid'}
              </span>
            </div>
            <code className="token-value">{maskToken(accessToken)}</code>
            {decodedAccess && (
              <div className="token-expiry">
                <Clock size={11} />
                หมดอายุใน: <strong>{formatExp(decodedAccess.exp)}</strong>
              </div>
            )}
          </div>

          {/* Refresh Token */}
          <div className="token-info">
            <div className="token-info-header">
              <Cookie size={13} />
              <span>Refresh Token (Cookie)</span>
              <span className={`token-badge ${decodedRefresh ? 'token-valid' : 'token-invalid'}`}>
                {decodedRefresh ? <CheckCircle2 size={10} /> : '✗'}
                {decodedRefresh ? 'Valid' : 'Invalid/None'}
              </span>
            </div>
            <code className="token-value">{maskToken(refreshToken)}</code>
            {decodedRefresh && (
              <div className="token-expiry">
                <Clock size={11} />
                หมดอายุใน: <strong>{formatExp(decodedRefresh.exp)}</strong>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="auth-status-actions">
            <button
              onClick={refreshAccessToken}
              disabled={refreshState.isLoading}
              className="auth-action-btn auth-action-refresh"
              id="refresh-token-btn"
            >
              {refreshState.isLoading ? (
                <Loader2 size={13} className="auth-spinner" />
              ) : (
                <RefreshCw size={13} />
              )}
              Refresh Token
            </button>
            <button
              onClick={logout}
              disabled={logoutState.isLoading}
              className="auth-action-btn auth-action-logout"
              id="logout-btn"
            >
              {logoutState.isLoading ? (
                <Loader2 size={13} className="auth-spinner" />
              ) : (
                <LogOut size={13} />
              )}
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
