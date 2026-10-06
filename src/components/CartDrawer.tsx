import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Order } from '../types.js';

interface CartDrawerProps {
  onOpenAuth: () => void;
  onOpenUserOrders: () => void;
}

export function CartDrawer({ onOpenAuth, onOpenUserOrders }: CartDrawerProps) {
  const { cart, totalItems, subtotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Checkout form state
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  if (!isCartOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!phone || !street || !city || !state || !pincode) {
      setError('Please fill in all delivery address fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('bb_token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          customerName: customerName || user.name,
          phone,
          shippingAddress: {
            street,
            city,
            state,
            pincode
          },
          items: cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            size: item.size,
            quantity: item.quantity,
            image: item.product.images[0]
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setConfirmedOrder(data);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Error processing order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setIsCheckingOut(false);
    setConfirmedOrder(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-[#0e0e14] border-l border-neutral-800 shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-red-500" />
            <h3 className="font-display text-xl uppercase tracking-wider text-white">
              {confirmedOrder ? 'Order Confirmed' : isCheckingOut ? 'Syndicate Checkout' : `Your Bag (${totalItems})`}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. Order Confirmation Screen */}
          {confirmedOrder ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 mb-4 shadow-lg shadow-emerald-950">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
                Order Received
              </span>
              <h4 className="font-display text-3xl uppercase tracking-wider text-white mt-1 mb-2">
                Order #{confirmedOrder.orderNumber}
              </h4>
              <p className="text-xs text-neutral-300 max-w-xs mb-6">
                Thank you, {confirmedOrder.customerName}! Your order has been placed into our fulfillment queue. You will receive dispatch updates shortly.
              </p>

              <div className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 p-4 text-left text-xs mb-6 space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span>Status:</span>
                  <span className="font-bold text-amber-400 uppercase">{confirmedOrder.status}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Total Paid:</span>
                  <span className="font-bold text-white tabular-nums">${confirmedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping To:</span>
                  <span className="text-neutral-200 truncate max-w-[180px]">
                    {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state}
                  </span>
                </div>
              </div>

              <div className="flex flex-col w-full gap-2">
                <button
                  onClick={() => {
                    handleClose();
                    onOpenUserOrders();
                  }}
                  className="w-full py-2.5 rounded-md bg-neutral-800 border border-neutral-700 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-700"
                >
                  View My Orders
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-md bg-red-600 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500"
                >
                  Back to Hub
                </button>
              </div>
            </div>
          ) : isCheckingOut ? (
            /* 2. Checkout Form */
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {error && (
                <div className="rounded border border-red-800/80 bg-red-950/60 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Aryan Verma"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Flat 101, Vinewood Boulevard"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Postal PIN Code
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="400050"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 mt-4">
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>Worldwide Shipping:</span>
                  <span className="text-emerald-400 uppercase font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Total Amount:</span>
                  <span className="text-red-400 font-display text-xl tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="w-1/3 py-3 rounded-md border border-neutral-700 bg-neutral-900 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-3 rounded-md bg-red-600 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Place Order'}
                </button>
              </div>
            </form>
          ) : (
            /* 3. Normal Cart List */
            <>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingBag className="h-12 w-12 text-neutral-600 mb-3" />
                  <p className="font-display text-xl uppercase tracking-wider text-white">
                    Your Bag is Empty
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                    Grab exclusive Black Bulls streetwear from our merchandise catalog.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div
                      key={`${item.product.id}_${item.size}`}
                      className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-md object-cover bg-neutral-800"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                          <span>Size: {item.size}</span>
                          <span>·</span>
                          <span className="font-mono text-white font-medium">${item.product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-neutral-800 rounded bg-neutral-950">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, -1)}
                              className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, 1)}
                              className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="text-neutral-500 hover:text-red-400 text-xs"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer (Subtotal & Checkout Trigger) */}
        {!confirmedOrder && !isCheckingOut && cart.length > 0 && (
          <div className="border-t border-neutral-800 p-6 bg-[#0a0a0e]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                Estimated Total:
              </span>
              <span className="font-display text-2xl text-white tabular-nums">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {user ? (
              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-red-500 shadow-lg shadow-red-950/60 active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={onOpenAuth}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-red-500 shadow-lg shadow-red-950/60"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Sign In To Order</span>
                </button>
                <p className="text-[11px] text-center text-neutral-500">
                  Account required to save delivery tracking and order history.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
