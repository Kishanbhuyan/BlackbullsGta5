import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { Order } from '../types.js';
import { useAuth } from '../context/AuthContext.js';

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserOrdersModal({ isOpen, onClose }: UserOrdersModalProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      const token = localStorage.getItem('bb_token');
      fetch('/api/orders/my', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch(err => console.warn('Failed to load user orders', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e0e14] shadow-2xl flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Package className="h-5 w-5 text-red-500" />
            <h3 className="font-display text-xl uppercase tracking-wider text-white">
              My Merch Orders
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="h-10 w-10 text-neutral-600 mx-auto mb-2" />
              <p className="font-display text-lg text-white uppercase tracking-wider">No Orders Yet</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Official Syndicate Merch Drop 01 is currently in production. Check the Merch section to register for VIP drop access.
              </p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <div>
                    <span className="font-mono font-bold text-white text-xs">{order.orderNumber}</span>
                    <span className="text-[11px] text-neutral-500 ml-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : order.status === 'Cancelled'
                        ? 'bg-red-950 text-red-400 border border-red-800/50'
                        : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-neutral-300">
                      <div className="flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-[10px] text-neutral-400">Qty: {item.quantity} · Size: {item.size}</p>
                        </div>
                      </div>
                      <span className="font-mono text-white tabular-nums">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800/80 pt-2.5 text-xs">
                  <span className="text-neutral-400">Total Paid:</span>
                  <span className="font-display text-base text-white tabular-nums">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
