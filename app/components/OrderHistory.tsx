import React from 'react';
import { Calendar, Package, ArrowRight, Truck, CheckCircle2, ShieldAlert, RefreshCw, HelpCircle } from 'lucide-react';
import type { Order, OrderStatus } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onDeposit: () => void;
}

export function OrderHistory({ orders, onDeposit }: OrderHistoryProps) {
  
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return {
          label: 'Pending Payment',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          description: 'Waiting to queue transaction',
          step: 0,
        };
      case 'payment_processing':
        return {
          label: 'Processing Payment',
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20 animate-pulse',
          description: 'Gateway validating card details...',
          step: 1,
        };
      case 'paid':
        return {
          label: 'Payment Success',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          description: 'Transaction approved. Preparing items.',
          step: 2,
        };
      case 'failed':
        return {
          label: 'Payment Failed',
          color: 'text-red-400 bg-red-500/10 border-red-500/20',
          description: 'Transaction declined. Stock released to inventory.',
          step: -1,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
          description: 'Order cancelled. Inventory replenished.',
          step: -1,
        };
      case 'shipping':
        return {
          label: 'In Transit',
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          description: 'Dispatched via courier delivery.',
          step: 3,
        };
      case 'completed':
        return {
          label: 'Delivered',
          color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
          description: 'Delivered successfully. Order completed.',
          step: 4,
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
          description: 'Unknown status',
          step: 0,
        };
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
           ' ' + new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Order History</h2>
          <p className="text-xs text-gray-500">Track and manage your order payments and microservice delivery updates.</p>
        </div>
        <div className="text-[10px] font-semibold text-gray-400 flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1">
          <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
          <span>Polling logs in real-time</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-850 p-12 text-center bg-gray-900/5">
          <Package className="h-10 w-10 text-gray-700 mb-2" />
          <p className="text-sm font-semibold text-gray-400">No orders found</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">Place an order in the Storefront and watch the simulated background payment queue execute your request.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const isErrorState = order.status === 'failed' || order.status === 'cancelled';
            
            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-gray-900 bg-gray-900/10 backdrop-blur-sm hover:border-gray-850 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-900 bg-gray-950 px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Order ID</p>
                      <p className="text-xs font-bold text-white font-mono">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Date & Time</p>
                      <p className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-right text-[10px] text-gray-500 uppercase font-black tracking-wider">Total amount</p>
                      <p className="text-sm font-extrabold text-indigo-400">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <span className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Body: Items and Pipeline Details */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Order Items */}
                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Purchased Products</h3>
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between gap-4 rounded-xl border border-gray-900 bg-gray-900/20 p-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover bg-gray-950"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                            <p className="text-[10px] text-gray-500">Qty: {item.quantity} • ${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-white font-mono">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Processing Pipeline Tracker */}
                  <div className="lg:col-span-5 rounded-2xl bg-gray-950/50 border border-gray-900 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Microservice Lifecycle</h3>
                      <p className="text-xs font-bold text-white mb-1">{statusConfig.label}</p>
                      <p className="text-xs text-gray-400 mb-4">{statusConfig.description}</p>
                    </div>

                    {/* Timeline Tracker UI */}
                    {!isErrorState ? (
                      <div className="flex items-center justify-between pt-2">
                        {/* Step 1: Created */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                            statusConfig.step >= 0 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-800 bg-gray-900 text-gray-500'
                          }`}>
                            1
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 mt-1">Pending</span>
                        </div>

                        <ArrowRight className={`h-4 w-4 ${statusConfig.step >= 1 ? 'text-indigo-500' : 'text-gray-800'}`} />

                        {/* Step 2: Payment Processing */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                            statusConfig.step >= 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-800 bg-gray-900 text-gray-500'
                          }`}>
                            2
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 mt-1">Gateway</span>
                        </div>

                        <ArrowRight className={`h-4 w-4 ${statusConfig.step >= 2 ? 'text-indigo-500' : 'text-gray-800'}`} />

                        {/* Step 3: Paid */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                            statusConfig.step >= 2 ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-gray-800 bg-gray-900 text-gray-500'
                          }`}>
                            3
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 mt-1">Paid</span>
                        </div>

                        <ArrowRight className={`h-4 w-4 ${statusConfig.step >= 3 ? 'text-indigo-500' : 'text-gray-800'}`} />

                        {/* Step 4: Shipping / Completed */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                            statusConfig.step >= 4 ? 'bg-teal-600 border-teal-500 text-white' : 
                            statusConfig.step === 3 ? 'bg-indigo-600 border-indigo-500 text-white animate-pulse' :
                            'border-gray-800 bg-gray-900 text-gray-500'
                          }`}>
                            {statusConfig.step === 3 ? <Truck className="h-3 w-3" /> : '4'}
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 mt-1">
                            {statusConfig.step === 3 ? 'In Transit' : 'Delivered'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3 flex gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-red-400">Compensation Event Triggered</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {order.status === 'failed' 
                              ? `Gateway: "${order.paymentDetails?.errorMessage || 'Declined'}"`
                              : 'Order cancelled.'}
                          </p>
                          <p className="text-[10px] text-emerald-400/90 font-semibold mt-1.5 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Inventory reserved stock successfully returned to Product Catalog Service.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Transaction metadata */}
                    {order.paymentDetails?.transactionId && (
                      <div className="mt-4 pt-3 border-t border-gray-900 text-[10px] text-gray-500 flex justify-between font-mono">
                        <span>TXN GATEWAY ID:</span>
                        <span className="text-gray-300 font-bold">{order.paymentDetails.transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
