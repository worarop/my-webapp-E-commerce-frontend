import React, { useState } from 'react';
import { Cpu, Play, Pause, ListCollapse, Plus, PlusCircle, Package, ArrowRight, ShieldAlert, CheckCircle, RefreshCcw } from 'lucide-react';
import { WorkerLogsView } from './WorkerLogsView';
import type { Product, PaymentJob, WorkerLog } from '../types';

interface AdminDashboardProps {
  products: Product[];
  paymentQueue: PaymentJob[];
  logs: WorkerLog[];
  isWorkerRunning: boolean;
  onStopWorker: () => void;
  onResumeWorker: () => void;
  onClearLogs: () => void;
  onReplenishStock: (productId: string, quantity: number) => void;
  onAddProduct: (product: any) => void;
}

export function AdminDashboard({
  products,
  paymentQueue,
  logs,
  isWorkerRunning,
  onStopWorker,
  onResumeWorker,
  onClearLogs,
  onReplenishStock,
  onAddProduct
}: AdminDashboardProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodCategory, setProdCategory] = useState('Keyboards');
  const [prodStock, setProdStock] = useState('10');

  const [replenishQty, setReplenishQty] = useState<Record<string, number>>({});

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) return;
    
    onAddProduct({
      name: prodName,
      description: prodDesc || 'No description provided.',
      price: Number(Number(prodPrice).toFixed(2)),
      image: prodImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
      category: prodCategory,
      stock: Number(prodStock)
    });

    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdImage('');
    setProdStock('10');
    setShowAddProduct(false);
  };

  const getJobStatusBadge = (status: PaymentJob['status']) => {
    switch (status) {
      case 'queued':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'processing':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20 animate-pulse';
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview stats and status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Worker Microservice Health Widget */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/10 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Async Services Daemon</span>
              <h3 className="text-sm font-extrabold text-white mt-1">Payment Queue Worker</h3>
            </div>
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isWorkerRunning 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              {isWorkerRunning ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Paused
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-gray-400 my-4">
            Processes queued payment transactions and coordinates inventory stock adjustments.
          </p>

          <div className="flex gap-2">
            {isWorkerRunning ? (
              <button
                onClick={onStopWorker}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Pause className="h-3.5 w-3.5" />
                Pause Worker
              </button>
            ) : (
              <button
                onClick={onResumeWorker}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Play className="h-3.5 w-3.5" />
                Resume Worker
              </button>
            )}
          </div>
        </div>

        {/* Transaction Queue Widget */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/10 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Job Queue Manager</span>
            <h3 className="text-sm font-extrabold text-white mt-1">Pending Transactions</h3>
          </div>
          
          <div className="text-center py-4 my-2">
            <span className="text-3xl font-black text-white font-mono">
              {paymentQueue.filter(j => j.status === 'queued').length}
            </span>
            <span className="text-xs text-gray-500 block font-semibold mt-1">Jobs Waiting in Line</span>
          </div>

          <div className="border-t border-gray-900 pt-3 flex justify-between text-[10px] text-gray-500">
            <span>Processed Jobs: {paymentQueue.filter(j => j.status === 'completed' || j.status === 'failed').length}</span>
            <span>Total Queued: {paymentQueue.length}</span>
          </div>
        </div>

        {/* System Catalog Metrics */}
        <div className="rounded-2xl border border-gray-900 bg-gray-900/10 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Catalog Microservice</span>
            <h3 className="text-sm font-extrabold text-white mt-1">Product Inventory Statistics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-4 my-2 text-center divide-x divide-gray-900">
            <div>
              <span className="text-2xl font-black text-white font-mono">
                {products.length}
              </span>
              <span className="text-[10px] text-gray-500 block font-semibold">Total SKUs</span>
            </div>
            <div>
              <span className="text-2xl font-black text-amber-500 font-mono">
                {products.filter(p => p.stock <= 5).length}
              </span>
              <span className="text-[10px] text-gray-500 block font-semibold">Low/Out of Stock</span>
            </div>
          </div>

          <button
            onClick={() => setShowAddProduct(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/15"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Product SKU
          </button>
        </div>
      </div>

      {/* Main Admin Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Logs and Jobs Queue (span 7) */}
        <div className="xl:col-span-7 space-y-8">
          {/* Real-time worker log traces */}
          <WorkerLogsView logs={logs} onClearLogs={onClearLogs} />

          {/* Payment Jobs Queue list */}
          <div className="rounded-2xl border border-gray-900 bg-gray-900/10 backdrop-blur-sm p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-indigo-400" />
              Async Payment Transaction Jobs Queue
            </h3>
            
            {paymentQueue.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">
                No jobs processed yet. Submit checkout carts to populate.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {paymentQueue.map(job => (
                  <div key={job.id} className="rounded-xl border border-gray-900 bg-gray-950 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white font-mono">{job.id}</span>
                        <span className="text-[10px] text-gray-500">• Order: {job.orderId}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Holder: {job.cardHolder} • Amount: <span className="text-indigo-400 font-bold">${job.amount.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${getJobStatusBadge(job.status)}`}>
                        {job.status.toUpperCase()}
                      </span>
                      {job.shouldFail && (
                        <span className="text-[9px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase">
                          Simulate Fail
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inventory Catalog Manager (span 5) */}
        <div className="xl:col-span-5 rounded-2xl border border-gray-900 bg-gray-900/10 backdrop-blur-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Package className="h-4.5 w-4.5 text-indigo-400" />
              Stock Replenishment Controller
            </h3>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {products.map(product => {
              const isLowStock = product.stock <= 5;
              const inputQty = replenishQty[product.id] || 10;
              
              return (
                <div key={product.id} className="rounded-xl border border-gray-900 bg-gray-950 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover flex-shrink-0 bg-gray-900" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                      <p className="text-[10px] text-gray-500">
                        SKU: {product.id} • Stock:{' '}
                        <span className={`font-bold ${isLowStock ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                          {product.stock}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={inputQty}
                      onChange={(e) => setReplenishQty({ ...replenishQty, [product.id]: parseInt(e.target.value) || 1 })}
                      className="w-12 rounded border border-gray-800 bg-gray-900 px-1.5 py-1 text-center text-xs text-white"
                    />
                    <button
                      onClick={() => onReplenishStock(product.id, inputQty)}
                      className="rounded bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-indigo-500 transition-colors"
                    >
                      Refill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Product Modal Drawer */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Create New Product SKU</h3>
            <p className="text-xs text-gray-400 mb-6">Manually introduce a new product record to the catalog database service.</p>
            
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Logitech MX Master 3"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full rounded-lg border border-gray-850 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-850 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Keyboards">Keyboards</option>
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Bags & Accessories">Bags & Accessories</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Office Accessories">Office Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                <textarea
                  placeholder="Technical specifications, features, and package contents..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full h-20 rounded-lg border border-gray-850 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="99.99"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-850 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="15"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full rounded-lg border border-gray-850 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full rounded-lg border border-gray-850 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 block mt-1">Leave empty to auto-assign a standard premium placeholder.</span>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-gray-400 hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
                >
                  Create SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
