import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Shield, Radio, ChevronDown, LogOut, Package, Flame, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenStreamerDashboard: () => void;
  onOpenAdminDashboard: () => void;
  onOpenUserOrders: () => void;
  currentPage?: 'home' | 'multistream';
  onNavigateToPage?: (page: 'home' | 'multistream') => void;
}

export function Navbar({
  onOpenAuth,
  onOpenStreamerDashboard,
  onOpenAdminDashboard,
  onOpenUserOrders,
  currentPage = 'home',
  onNavigateToPage,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-[#08080a]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="group flex items-center gap-3 font-display text-2xl tracking-wider text-white transition-transform hover:scale-[1.02]"
        >
          <img
            src="/images/black_bulls_emblem_1790605389270.jpg"
            alt="Black Bulls Syndicate Emblem"
            className="h-10 w-10 rounded-md object-contain drop-shadow-[0_0_12px_rgba(220,38,38,0.4)] transition-transform duration-300 group-hover:scale-110"
          />
          <span className="glitch-hover tracking-widest text-white">
            BLACK <span className="text-red-500">BULLS</span>
          </span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden items-center gap-7 md:flex text-sm font-medium text-neutral-300">
          <a
            href="#story"
            className="transition-colors hover:text-white hover:underline underline-offset-8 decoration-red-600 decoration-2"
          >
            Story
          </a>
          <a
            href="#streamers"
            className="transition-colors hover:text-white hover:underline underline-offset-8 decoration-red-600 decoration-2"
          >
            Streamers
          </a>
          <a
            href="#live"
            className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline underline-offset-8 decoration-red-600 decoration-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
            </span>
            Live
          </a>
          <a
            href="#clips"
            className="transition-colors hover:text-white hover:underline underline-offset-8 decoration-red-600 decoration-2"
          >
            Clips
          </a>
          <a
            href="#merch"
            className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline underline-offset-8 decoration-red-600 decoration-2"
          >
            <span>Merch</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900/60">Soon</span>
          </a>
          <button
            type="button"
            onClick={() => onNavigateToPage?.('multistream')}
            className={`flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
              currentPage === 'multistream'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_12px_rgba(83,252,24,0.3)]'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400">MultiStream</span>
            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded border border-emerald-800/80">
              KICK
            </span>
          </button>
          <a
            href="#fan-wall"
            onClick={() => currentPage === 'multistream' && onNavigateToPage?.('home')}
            className="transition-colors hover:text-white hover:underline underline-offset-8 decoration-red-600 decoration-2"
          >
            Fan Wall
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* VIP Drop Alerts button */}
          <a
            href="#merch"
            aria-label="Merch Drop VIP Alert"
            className="relative flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/80 px-3 text-sm font-medium text-neutral-200 transition-colors hover:border-red-900/60 hover:bg-neutral-800 hover:text-white"
          >
            <Bell className="h-4 w-4 text-red-500" />
            <span className="hidden sm:inline">Drop Alert</span>
            <span className="flex items-center justify-center rounded bg-red-950 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-900/60">
              VIP
            </span>
          </a>

          {/* User Auth / Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex h-10 items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/80 px-3 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="h-6 w-6 rounded-full border border-neutral-700 bg-neutral-800 object-cover"
                />
                <span className="max-w-[110px] truncate text-xs">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-md border border-neutral-800 bg-[#0e0e13] p-1.5 shadow-xl shadow-black/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="border-b border-neutral-800 px-3 py-2">
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Signed in as</p>
                    <p className="truncate text-sm font-bold text-white">{user.name}</p>
                    <span className="mt-1 inline-block text-[11px] font-mono text-red-400 uppercase">
                      Role: {user.role}
                    </span>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      onClick={onOpenAdminDashboard}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-neutral-800/80 hover:text-red-300"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Control Center
                    </button>
                  )}

                  {(user.role === 'streamer' || user.role === 'admin') && (
                    <button
                      onClick={onOpenStreamerDashboard}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-800/80 hover:text-white"
                    >
                      <Radio className="h-4 w-4 text-red-500" />
                      Streamer Dashboard
                    </button>
                  )}

                  <button
                    onClick={onOpenUserOrders}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-800/80 hover:text-white"
                  >
                    <Package className="h-4 w-4 text-neutral-400" />
                    My Orders
                  </button>

                  <div className="my-1 border-t border-neutral-800" />

                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800/80 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex h-10 items-center gap-1.5 rounded-md bg-red-600 px-4 text-xs font-semibold tracking-wide text-white uppercase transition-all hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/30 whitespace-nowrap active:scale-95"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 md:hidden text-neutral-300"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-neutral-800 bg-[#0c0c10] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-neutral-300">
            <a
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-white"
            >
              Our Story
            </a>
            <a
              href="#streamers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-white"
            >
              Streamers
            </a>
            <a
              href="#live"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 hover:text-white"
            >
              <span className="h-2 w-2 rounded-full bg-red-600"></span>
              Live Broadcasts
            </a>
            <a
              href="#clips"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-white"
            >
              Clips & Highlights
            </a>
            <a
              href="#merch"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-2 py-1.5 hover:text-white"
            >
              <span>Syndicate Merch</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-900/60">Coming Soon</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToPage?.('multistream');
              }}
              className="flex items-center justify-between px-2 py-2 text-emerald-400 font-bold bg-emerald-950/40 rounded-lg border border-emerald-800/60"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>MultiStream (MultiKick Grid)</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black">
                LIVE
              </span>
            </button>
            <a
              href="#fan-wall"
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentPage === 'multistream') onNavigateToPage?.('home');
              }}
              className="px-2 py-1.5 hover:text-white"
            >
              Fan Wall
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
