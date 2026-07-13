import React, { useState } from 'react';
import { ShoppingCart, User as UserIcon, Terminal, History, Store, Wallet, ChevronDown, LogOut, PlusCircle } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  users: User[];
  balance: number;
  cartCount: number;
  activeTab: 'store' | 'orders' | 'admin';
  setActiveTab: (tab: 'store' | 'orders' | 'admin') => void;
  onOpenCart: () => void;
  onLogin: (email: string) => void;
  onRegister: (name: string, email: string, role: 'admin' | 'customer') => void;
  onLogout: () => void;
  onDeposit: (amount: number) => void;
  onOpenAuthModal: () => void;
}

export function Navbar({
  currentUser,
  users,
  balance,
  cartCount,
  activeTab,
  setActiveTab,
  onOpenCart,
  onLogin,
  onRegister,
  onLogout,
  onDeposit,
  onOpenAuthModal
}: NavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'admin'>('customer');
  const [depositAmount, setDepositAmount] = useState('200');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;
    try {
      onRegister(regName, regEmail, regRole);
      setShowRegModal(false);
      setRegName('');
      setRegEmail('');
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              AeroCart
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Microservices Demo
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === 'store'
                ? 'bg-indigo-600/10 text-indigo-400 shadow-inner'
                : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
            }`}
          >
            <Store className="h-4 w-4" />
            Storefront
          </button>
          
          {currentUser && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === 'orders'
                  ? 'bg-indigo-600/10 text-indigo-400 shadow-inner'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <History className="h-4 w-4" />
              My Orders
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-emerald-600/10 text-emerald-400 shadow-inner'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <Terminal className="h-4 w-4" />
              Admin & Worker Panel
            </button>
          )}
        </nav>

        {/* Actions / User Menu */}
        <div className="flex items-center gap-4">
          {/* User Account Select / Profile */}
          <div className="relative">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Wallet Balance widget */}
                <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-1.5 text-xs text-gray-300">
                  <Wallet className="h-3.5 w-3.5 text-indigo-400" />
                  <span>${balance.toFixed(2)}</span>
                  <button 
                    onClick={() => onDeposit(Number(depositAmount))}
                    className="ml-1.5 flex h-5 items-center justify-center rounded bg-indigo-600 px-1.5 font-semibold text-white hover:bg-indigo-500 transition-colors"
                    title="Quick deposit $200"
                  >
                    + $200
                  </button>
                </div>

                {/* Profile Toggle */}
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-1.5 text-sm font-medium text-gray-300 hover:border-gray-700 hover:bg-gray-900 transition-all"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-xs font-bold text-white uppercase">
                    {currentUser.name[0]}
                  </div>
                  <span className="hidden max-w-[80px] truncate sm:inline">{currentUser.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                    currentUser.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {currentUser.role}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/15"
              >
                <UserIcon className="h-4 w-4" />
                Login / Register
              </button>
            )}

            {/* Dropdown Menu */}
            {showUserDropdown && currentUser && (
              <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-gray-800 bg-gray-950 p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-gray-900">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Account Settings</p>
                </div>
                <div className="py-1">
                  <div className="px-3 py-2 text-xs text-gray-400">
                    Logged in as <strong className="text-white">{currentUser.name}</strong>
                  </div>
                </div>
                <div className="border-t border-gray-900 mt-1 pt-1">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon & Badge */}
          {activeTab !== 'admin' && (
            <button
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-900/30 text-gray-400 hover:border-gray-700 hover:bg-gray-900 hover:text-white transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-gray-950">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* MOBILE TABS (Only visible on small screens) */}
      <div className="flex border-t border-gray-900 md:hidden bg-gray-950/90 divide-x divide-gray-900">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex-1 py-3 text-xs font-medium text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'store' ? 'text-indigo-400 bg-indigo-950/10' : 'text-gray-500'
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          Store
        </button>
        {currentUser && (
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-xs font-medium text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'orders' ? 'text-indigo-400 bg-indigo-950/10' : 'text-gray-500'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Orders
          </button>
        )}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-3 text-xs font-medium text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'admin' ? 'text-emerald-400 bg-emerald-950/10' : 'text-gray-500'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Admin
          </button>
        )}
      </div>

      {/* Register Account Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Create New Account</h3>
            <p className="text-xs text-gray-400 mb-6">Create a customer or administrator profile to test role-based capabilities.</p>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alice Smith"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full rounded-lg border border-gray-850 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alice@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-850 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">System Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-all ${
                    regRole === 'customer' 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                      : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:bg-gray-900'
                  }`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value="customer"
                      checked={regRole === 'customer'}
                      onChange={() => setRegRole('customer')}
                      className="sr-only" 
                    />
                    <span className="text-xs font-bold">Customer</span>
                  </label>

                  <label className={`flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-all ${
                    regRole === 'admin' 
                      ? 'border-red-500 bg-red-500/10 text-red-400' 
                      : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:bg-gray-900'
                  }`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value="admin"
                      checked={regRole === 'admin'}
                      onChange={() => setRegRole('admin')}
                      className="sr-only" 
                    />
                    <span className="text-xs font-bold">Administrator</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-gray-400 hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
                >
                  Register & Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
