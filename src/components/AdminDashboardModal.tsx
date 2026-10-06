import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Radio,
  BookOpen,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Save,
  Check,
  Flame,
} from 'lucide-react';
import { AdminStats, Order, Product, Streamer, Comment, GangStory, OrderStatus } from '../types.js';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamers: Streamer[];
  products: Product[];
  story: GangStory | null;
  onRefreshAllData: () => void;
}

export function AdminDashboardModal({
  isOpen,
  onClose,
  streamers,
  products,
  story,
  onRefreshAllData,
}: AdminDashboardModalProps) {
  const [tab, setTab] = useState<'overview' | 'orders' | 'merch' | 'streamers' | 'story' | 'comments' | 'live-toggle'>('overview');

  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // New Streamer Form State
  const [isAddingStreamer, setIsAddingStreamer] = useState(false);
  const [newStreamer, setNewStreamer] = useState({
    name: '',
    inGameCharacter: '',
    realName: '',
    bio: '',
    youtubeUrl: '',
    youtubeHandle: '',
    kickUrl: '',
    kickUsername: '',
    instagramUrl: '',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  });

  // New Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 39.99,
    category: 'Hoodies' as Product['category'],
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'],
    sizes: 'S, M, L, XL',
    stockQuantity: 50,
  });

  // Story Edit State
  const [storyTitle, setStoryTitle] = useState(story?.title || '');
  const [storyTagline, setStoryTagline] = useState(story?.tagline || '');
  const [storyLead, setStoryLead] = useState(story?.leadParagraph || '');
  const [storyLore, setStoryLore] = useState(story?.fullLore || '');
  const [storySaved, setStorySaved] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('bb_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', { headers: getHeaders(), credentials: 'include' });
      if (statsRes.ok) setStats(await statsRes.json());

      // 2. Orders
      const ordersRes = await fetch('/api/orders', { headers: getHeaders(), credentials: 'include' });
      if (ordersRes.ok) setOrders(await ordersRes.json());

      // 3. Comments
      const commentsRes = await fetch('/api/comments/all', { headers: getHeaders(), credentials: 'include' });
      if (commentsRes.ok) setComments(await commentsRes.json());
    } catch (err) {
      console.warn('Failed to load admin panel data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (story) {
      setStoryTitle(story.title);
      setStoryTagline(story.tagline);
      setStoryLead(story.leadParagraph);
      setStoryLore(story.fullLore);
    }
  }, [story]);

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.warn('Failed to update status', err);
    }
  };

  // Handle Add Streamer
  const handleAddStreamerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/streamers', {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(newStreamer)
      });
      if (res.ok) {
        setIsAddingStreamer(false);
        setNewStreamer({
          name: '',
          inGameCharacter: '',
          realName: '',
          bio: '',
          youtubeUrl: '',
          youtubeHandle: '',
          kickUrl: '',
          kickUsername: '',
          instagramUrl: '',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        });
        onRefreshAllData();
      }
    } catch (err) {
      console.warn('Failed to add streamer', err);
    }
  };

  // Handle Delete Streamer
  const handleDeleteStreamer = async (id: string) => {
    if (!confirm('Are you sure you want to remove this streamer? They will be removed from all sections.')) return;
    try {
      const res = await fetch(`/api/streamers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        onRefreshAllData();
      }
    } catch (err) {
      console.warn('Failed to delete streamer', err);
    }
  };

  // Handle Add Merch
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sizesArray = newProduct.sizes.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          ...newProduct,
          sizes: sizesArray,
          inStock: true
        })
      });
      if (res.ok) {
        setIsAddingProduct(false);
        onRefreshAllData();
      }
    } catch (err) {
      console.warn('Failed to add product', err);
    }
  };

  // Handle Delete Merch
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product from the merchandise store?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        onRefreshAllData();
      }
    } catch (err) {
      console.warn('Failed to delete product', err);
    }
  };

  // Handle Save Story
  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/story', {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: storyTitle,
          tagline: storyTagline,
          leadParagraph: storyLead,
          fullLore: storyLore,
        })
      });
      if (res.ok) {
        setStorySaved(true);
        setTimeout(() => setStorySaved(false), 3000);
        onRefreshAllData();
      }
    } catch (err) {
      console.warn('Failed to save story', err);
    }
  };

  // Handle Moderate Comment
  const handleModerateComment = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/comments/${id}/moderate`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        onRefreshAllData();
      }
    } catch (err) {
      console.warn('Failed to moderate comment', err);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== id));
        onRefreshAllData();
      }
    } catch (err) {
      console.warn('Failed to delete comment', err);
    }
  };

  // Handle Live Broadcast State Toggle
  const handleToggleLiveState = async (streamerId: string, platform: 'youtube' | 'kick', isLive: boolean) => {
    try {
      const res = await fetch('/api/live/toggle', {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ streamerId, platform, isLive })
      });
      if (res.ok) {
        onRefreshAllData();
      }
    } catch (err) {
      console.warn('Failed to toggle live state', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e0e14] shadow-2xl flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-md shadow-red-950">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-xl uppercase tracking-wider text-white">
                Black Bulls Admin Control Center
              </h3>
              <p className="text-xs text-neutral-400">
                High Command Management · Role-Based Administration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/70 px-6 overflow-x-auto gap-4 scrollbar-none">
          <button
            onClick={() => setTab('overview')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              tab === 'overview' ? 'border-red-600 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setTab('orders')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              tab === 'orders' ? 'border-red-600 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setTab('merch')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              tab === 'merch' ? 'border-red-600 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Merchandise ({products.length})</span>
          </button>

          <button
            onClick={() => setTab('streamers')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              tab === 'streamers' ? 'border-red-600 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Streamers ({streamers.length})</span>
          </button>

          <button
            onClick={() => setTab('comments')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              tab === 'comments' ? 'border-red-600 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Fan Wall ({comments.length})</span>
          </button>

          <button
            onClick={() => setTab('story')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              tab === 'story' ? 'border-red-600 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Story Lore</span>
          </button>

          <button
            onClick={() => setTab('live-toggle')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              tab === 'live-toggle' ? 'border-red-600 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Radio className="h-4 w-4 text-red-500" />
            <span>Live Broadcast Sim</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. OVERVIEW STATS */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <span className="text-[11px] font-mono uppercase text-neutral-400">Total Merch Revenue</span>
                  <p className="font-display text-3xl text-white mt-1 tabular-nums">
                    ${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <span className="text-[11px] font-mono uppercase text-neutral-400">Orders Processed</span>
                  <p className="font-display text-3xl text-white mt-1 tabular-nums">
                    {stats?.totalOrders || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <span className="text-[11px] font-mono uppercase text-neutral-400">Pending Deliveries</span>
                  <p className="font-display text-3xl text-amber-400 mt-1 tabular-nums">
                    {stats?.pendingOrders || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <span className="text-[11px] font-mono uppercase text-neutral-400">Registered Fans & Streamers</span>
                  <p className="font-display text-3xl text-red-400 mt-1 tabular-nums">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">Recent Customer Orders</h4>
                  <button onClick={() => setTab('orders')} className="text-xs text-red-400 hover:underline">
                    View All Orders &rarr;
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {orders.slice(0, 4).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-900/60">
                      <div>
                        <span className="font-bold text-white font-mono">{o.orderNumber}</span>
                        <span className="text-neutral-500 ml-2">by {o.customerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium tabular-nums">${o.totalAmount.toFixed(2)}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDERS MANAGEMENT */}
          {tab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                  Manage Customer Orders
                </h4>
                <span className="text-xs text-neutral-400">
                  Total: {orders.length} orders
                </span>
              </div>

              <div className="space-y-3">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 text-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div>
                        <span className="font-bold text-white font-mono text-sm">{order.orderNumber}</span>
                        <span className="text-neutral-400 ml-2">({order.customerName} · {order.email} · {order.phone})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-lg text-white tabular-nums">${order.totalAmount.toFixed(2)}</span>
                        <select
                          value={order.status}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-white focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-semibold text-neutral-400 uppercase mb-1">Items Ordered:</p>
                        <div className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-neutral-300">
                              <span>{item.quantity}x {item.name} ({item.size})</span>
                              <span className="tabular-nums">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-neutral-400 uppercase mb-1">Shipping Address:</p>
                        <p className="text-neutral-300 leading-relaxed">
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <p className="text-center py-12 text-neutral-500">No orders placed yet.</p>
                )}
              </div>
            </div>
          )}

          {/* 3. MERCHANDISE CRUD */}
          {tab === 'merch' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                  Merchandise Catalog
                </h4>
                <button
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-red-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAddingProduct ? 'Cancel' : 'Add New Product'}</span>
                </button>
              </div>

              {/* Add Product Form */}
              {isAddingProduct && (
                <form onSubmit={handleAddProductSubmit} className="rounded-xl border border-neutral-700 bg-neutral-900/80 p-5 space-y-3">
                  <h5 className="font-bold text-xs text-white uppercase">New Product Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Product Name</label>
                      <input
                        type="text"
                        required
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g. Syndicate Bomber Jacket"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value as Product['category'] })}
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      >
                        <option value="Hoodies">Hoodies</option>
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Caps">Caps</option>
                        <option value="Mugs">Mugs</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newProduct.price}
                        onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        required
                        value={newProduct.stockQuantity}
                        onChange={e => setNewProduct({ ...newProduct, stockQuantity: parseInt(e.target.value, 10) })}
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Sizes (comma separated)</label>
                      <input
                        type="text"
                        required
                        value={newProduct.sizes}
                        onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })}
                        placeholder="S, M, L, XL"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Product Description</label>
                    <textarea
                      rows={2}
                      required
                      value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-red-500"
                  >
                    Save & Publish Product
                  </button>
                </form>
              )}

              {/* Product List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="flex gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
                    <img src={product.images[0]} alt={product.name} className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-white text-xs truncate">{product.name}</h5>
                      <p className="text-[11px] text-neutral-400">${product.price.toFixed(2)} · {product.category}</p>
                      <p className="text-[10px] text-neutral-500">{product.stockQuantity} in stock</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-neutral-500 hover:text-red-400 self-start"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. STREAMERS CRUD */}
          {tab === 'streamers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                    Gang Streamers Management
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Adding a streamer automatically integrates them into Streamers, Live Feeds, and Clips.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingStreamer(!isAddingStreamer)}
                  className="flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-red-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAddingStreamer ? 'Cancel' : 'Add Streamer'}</span>
                </button>
              </div>

              {/* Add Streamer Form */}
              {isAddingStreamer && (
                <form onSubmit={handleAddStreamerSubmit} className="rounded-xl border border-neutral-700 bg-neutral-900/80 p-5 space-y-3">
                  <h5 className="font-bold text-xs text-white uppercase">New Streamer Profile</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Streamer Name</label>
                      <input
                        type="text"
                        required
                        value={newStreamer.name}
                        onChange={e => setNewStreamer({ ...newStreamer, name: e.target.value })}
                        placeholder="e.g. VIPER RP"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">In-Game Character</label>
                      <input
                        type="text"
                        required
                        value={newStreamer.inGameCharacter}
                        onChange={e => setNewStreamer({ ...newStreamer, inGameCharacter: e.target.value })}
                        placeholder="e.g. Jaggu Seth"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Real Name</label>
                      <input
                        type="text"
                        required
                        value={newStreamer.realName}
                        onChange={e => setNewStreamer({ ...newStreamer, realName: e.target.value })}
                        placeholder="e.g. Rohit Roy"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">YouTube Channel URL</label>
                      <input
                        type="url"
                        required
                        value={newStreamer.youtubeUrl}
                        onChange={e => setNewStreamer({ ...newStreamer, youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/@handle"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">YouTube Handle</label>
                      <input
                        type="text"
                        required
                        value={newStreamer.youtubeHandle}
                        onChange={e => setNewStreamer({ ...newStreamer, youtubeHandle: e.target.value })}
                        placeholder="@handle"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Kick Channel URL</label>
                      <input
                        type="url"
                        required
                        value={newStreamer.kickUrl}
                        onChange={e => setNewStreamer({ ...newStreamer, kickUrl: e.target.value })}
                        placeholder="https://kick.com/username"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Kick Username</label>
                      <input
                        type="text"
                        required
                        value={newStreamer.kickUsername}
                        onChange={e => setNewStreamer({ ...newStreamer, kickUsername: e.target.value })}
                        placeholder="username"
                        className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Streamer Bio</label>
                    <textarea
                      rows={2}
                      required
                      value={newStreamer.bio}
                      onChange={e => setNewStreamer({ ...newStreamer, bio: e.target.value })}
                      className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-red-500"
                  >
                    Save & Add Streamer
                  </button>
                </form>
              )}

              {/* Streamers List */}
              <div className="space-y-3">
                {streamers.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
                    <div className="flex items-center gap-3">
                      <img src={s.photo} alt={s.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <h5 className="font-bold text-white text-xs">{s.name}</h5>
                        <p className="text-[11px] text-neutral-400">{s.inGameCharacter} ({s.realName})</p>
                        <p className="text-[10px] text-neutral-500">{s.youtubeHandle} · Kick: {s.kickUsername}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteStreamer(s.id)}
                        className="p-2 rounded hover:bg-red-950 text-neutral-400 hover:text-red-400"
                        title="Delete Streamer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. COMMENTS MODERATION */}
          {tab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                  Fan Wall Moderation
                </h4>
                <span className="text-xs text-neutral-400">{comments.length} total comments</span>
              </div>

              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white">{c.userName}</span>
                        <span className="text-neutral-500">for</span>
                        <span className="text-red-400 font-semibold">{c.streamerName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {c.status}
                        </span>

                        {c.status !== 'approved' && (
                          <button
                            onClick={() => handleModerateComment(c.id, 'approved')}
                            className="text-xs text-emerald-400 hover:underline"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-neutral-500 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. STORY EDITOR */}
          {tab === 'story' && (
            <form onSubmit={handleSaveStory} className="space-y-4 max-w-2xl">
              {storySaved && (
                <div className="flex items-center gap-2 rounded border border-emerald-800/80 bg-emerald-950/60 p-3 text-xs text-emerald-300">
                  <Check className="h-4 w-4" />
                  <span>Story text updated and published live to the homepage!</span>
                </div>
              )}

              <div>
                <label className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Story Title</label>
                <input
                  type="text"
                  required
                  value={storyTitle}
                  onChange={e => setStoryTitle(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-900 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={storyTagline}
                  onChange={e => setStoryTagline(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-900 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Lead Highlight</label>
                <textarea
                  rows={2}
                  required
                  value={storyLead}
                  onChange={e => setStoryLead(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-900 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Full Syndicate Lore</label>
                <textarea
                  rows={5}
                  required
                  value={storyLore}
                  onChange={e => setStoryLore(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-900 p-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 rounded bg-red-600 px-5 py-2.5 text-xs font-bold uppercase text-white hover:bg-red-500 shadow"
              >
                <Save className="h-4 w-4" />
                <span>Save Story Section</span>
              </button>
            </form>
          )}

          {/* 7. LIVE BROADCAST SIMULATION TOGGLE */}
          {tab === 'live-toggle' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                  Live Stream Simulation Testing
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Toggle live broadcast state for testing the "LIVE NOW" badge, viewer count tickers, and responsive player embeds on either YouTube or Kick.
                </p>
              </div>

              <div className="space-y-4">
                {streamers.map(s => (
                  <div key={s.id} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={s.photo} alt={s.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <h5 className="font-bold text-xs text-white">{s.name}</h5>
                        <p className="text-[11px] text-neutral-400">{s.inGameCharacter}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                      <span className="text-xs text-neutral-300 font-medium">YouTube Live State:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleLiveState(s.id, 'youtube', true)}
                          className="px-3 py-1 rounded bg-red-600/20 border border-red-500 text-red-300 text-xs font-bold hover:bg-red-600 hover:text-white"
                        >
                          Simulate LIVE
                        </button>
                        <button
                          onClick={() => handleToggleLiveState(s.id, 'youtube', false)}
                          className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs hover:text-white"
                        >
                          Set Offline
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                      <span className="text-xs text-neutral-300 font-medium">Kick Live State:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleLiveState(s.id, 'kick', true)}
                          className="px-3 py-1 rounded bg-emerald-600/20 border border-emerald-500 text-emerald-300 text-xs font-bold hover:bg-emerald-600 hover:text-white"
                        >
                          Simulate LIVE
                        </button>
                        <button
                          onClick={() => handleToggleLiveState(s.id, 'kick', false)}
                          className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs hover:text-white"
                        >
                          Set Offline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
