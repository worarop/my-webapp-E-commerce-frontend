import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { selectIsAuthenticated } from '../../store/slices/authSliceNew';
import type { RootState } from '../../store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state as any));
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // If user successfully logs in, automatically close the modal
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-950 border border-gray-800 shadow-2xl p-6 z-10 auth-modal-content animate-in zoom-in-95 duration-200 scrollbar-none">
        
        {/* Custom Context Message Banner */}
        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2.5 text-xs text-indigo-300">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {authView === 'login' ? (
          <LoginPage
            onSwitchToRegister={() => setAuthView('register')}
            isModal
            onClose={onClose}
          />
        ) : (
          <RegisterPage
            onSwitchToLogin={() => setAuthView('login')}
            isModal
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
