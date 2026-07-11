import { useState } from 'react';
import type { Route } from './+types/home';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { CartSidebar } from '../components/CartSidebar';
import { OrderHistory } from '../components/OrderHistory';
import { AdminDashboard } from '../components/AdminDashboard';
import { AuthStatusPanel } from '../components/auth/AuthStatusPanel';
import { Search, Sparkles, Cpu, Layers, ShieldCheck, RefreshCw } from 'lucide-react';
import type { Product } from '../types';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AeroCart Microservices - Demo E-commerce" },
    { name: "description", content: "A high-fidelity E-commerce web demonstration highlighting Product Catalog, Shopping Cart, User Authentication, Order & Inventory, and Async Payment Workers." },
  ];
}

export default function Home() {
  const {
    products,
    currentUser,
    logs,
    allOrders,
    paymentQueue,
    isWorkerRunning,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    replenishStock,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    depositBalance,
    orders,
    createOrder,
    stopWorker,
    resumeWorker,
    clearLogs,
  } = useStore();

  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'store' | 'orders' | 'admin'>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Guard: ถ้า activeTab = 'admin' แต่ไม่ใช่ admin → reset กลับ 'store'
  const safeSetActiveTab = (tab: 'store' | 'orders' | 'admin') => {
    if (tab === 'admin' && currentUser?.role !== 'admin') return;
    setActiveTab(tab);
  };
  const effectiveTab = activeTab === 'admin' && currentUser?.role !== 'admin' ? 'store' : activeTab;

  // Extract unique categories from products list
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products based on search query and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Global Navbar — ส่งเฉพาะข้อมูลที่จำเป็น (ไม่มี login/register แล้ว) */}
      <Navbar
        currentUser={currentUser}
        users={[]}
        balance={currentUser?.balance || 0}
        cartCount={cartCount}
        activeTab={effectiveTab}
        setActiveTab={safeSetActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
        onLogin={() => {}}
        onRegister={() => {}}
        onLogout={logout}
        onDeposit={depositBalance}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Dashboard Banner - Only shows on Store tab */}
        {effectiveTab === 'store' && (
          <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-r from-gray-950 via-indigo-950/20 to-purple-950/20 px-6 py-8 md:px-12 md:py-12 shadow-2xl mb-8 animate-in fade-in duration-300">
            {/* Visual background decorations */}
            <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-0 -z-10 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
            
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="max-w-2xl flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-400 mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  RTK Query Auth + JWT Token System
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                  Mock Distributed <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">E-Commerce Architecture</span>
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  ระบบ E-Commerce จำลอง พร้อม Auth ด้วย RTK Query: Access Token ใน Redux, Refresh Token ใน Cookie
                </p>
                
                {/* Architecture Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-900">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Catalog</span>
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mt-1">
                      <Layers className="h-3.5 w-3.5 text-sky-400" /> In-Sync
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Cart Service</span>
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-violet-400" /> Active
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Inventory</span>
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mt-1">
                      <Cpu className="h-3.5 w-3.5 text-orange-400" /> Auto-Lock
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Async Worker</span>
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mt-1">
                      <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" /> Daemon
                    </span>
                  </div>
                </div>
              </div>

              {/* Auth Status Panel — แสดง Token Info */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-2">🔐 Auth & Token Status</p>
                <AuthStatusPanel />
              </div>
            </div>
          </section>
        )}

        {/* 1. STOREFRONT VIEW */}
        {effectiveTab === 'store' && (
          <div className="space-y-6">
            {/* Search and Filters Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-900/30 backdrop-blur-sm border border-gray-900 p-4 rounded-2xl">
              {/* Search Field */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-850 bg-gray-950 pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Category selector pills */}
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap capitalize transition-all ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-850 hover:text-white border border-gray-800'
                    }`}
                  >
                    {category === 'all' ? 'All Products' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Products grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-gray-850">
                <Search className="h-10 w-10 text-gray-700 mb-2" />
                <p className="text-sm font-semibold text-gray-400">No products found</p>
                <p className="text-xs text-gray-500 mt-1">Try modifying your keyword search or category filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onSelectProduct={setSelectedProduct}
                    isAuthenticated={!!currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ORDER HISTORY VIEW */}
        {effectiveTab === 'orders' && currentUser && (
          <div className="animate-in fade-in duration-200">
            <OrderHistory orders={orders} onDeposit={() => depositBalance(200)} />
          </div>
        )}

        {/* 3. ADMIN / SERVICE DAEMON PANEL — Admin only */}
        {effectiveTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="animate-in fade-in duration-200">
            <AdminDashboard
              products={products}
              paymentQueue={paymentQueue}
              logs={logs}
              isWorkerRunning={isWorkerRunning}
              onStopWorker={stopWorker}
              onResumeWorker={resumeWorker}
              onClearLogs={clearLogs}
              onReplenishStock={replenishStock}
              onAddProduct={addProduct}
            />
          </div>
        )}

      </main>

      {/* Footer info */}
      <footer className="border-t border-gray-900 bg-gray-950 py-6 mt-12 text-center text-xs text-gray-500">
        <p>© 2026 AeroCart Microservices. Pair Programmed with Antigravity AI.</p>
      </footer>

      {/* Global Modals & Sidebars */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        isAuthenticated={!!currentUser}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        currentUser={currentUser}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={createOrder}
      />

    </div>
  );
}
