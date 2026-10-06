import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Radio, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, kickLogin, demoLogin } = useAuth();
  const [tab, setTab] = useState<'kick' | 'login' | 'register'>('kick');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kickUsernameInput, setKickUsernameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === 'kick') {
        if (!kickUsernameInput.trim()) {
          throw new Error('Please enter your Kick username');
        }
        await kickLogin(kickUsernameInput.trim());
      } else if (tab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (type: 'fan' | 'streamer-mota' | 'streamer-kancha' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(type);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e0e14] p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
          <div>
            <h3 className="font-display text-2xl uppercase tracking-wider text-white">
              Syndicate Portal
            </h3>
            <p className="text-xs text-neutral-400">
              {tab === 'kick'
                ? 'Sign in instantly with your Kick channel username'
                : tab === 'login'
                ? 'Access your Black Bulls account'
                : 'Register a new gang soldier profile'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg border border-neutral-800 bg-neutral-900 p-1 mb-5">
          <button
            type="button"
            onClick={() => setTab('kick')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'kick' ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="h-3 w-3" />
            <span>Kick Login</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
              tab === 'login' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
              tab === 'register' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-800/80 bg-red-950/60 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'kick' ? (
            <div>
              <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-3 mb-3 text-xs text-emerald-200">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Instant Kick Viewer Sign-In</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Enter your Kick username to immediately link your identity, join the Syndicate live chat, and interact across Los Santos RP streams.
                </p>
              </div>

              <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
                Your Kick Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-emerald-400">@</span>
                <input
                  type="text"
                  required
                  value={kickUsernameInput}
                  onChange={e => setKickUsernameInput(e.target.value)}
                  placeholder="e.g. kancha_fan_99"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-8 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="text-neutral-500">Need to log into Kick.com itself?</span>
                <a
                  href="https://kick.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Kick.com Login</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <>
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Aryan Verma"
                      className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-md py-3 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md disabled:opacity-50 ${
              tab === 'kick'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60'
                : 'bg-red-600 hover:bg-red-500 shadow-red-950/60'
            }`}
          >
            {loading
              ? 'Authenticating...'
              : tab === 'kick'
              ? 'Sign In with Kick Identity'
              : tab === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* 1-Click Demo Accounts Selector */}
        <div className="mt-6 border-t border-neutral-800 pt-5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Instant Role Testing (1-Click Login)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemo('fan')}
              disabled={loading}
              className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900/80 p-2 text-left hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              <User className="h-4 w-4 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-white truncate text-[11px]">Fan Account</p>
                <p className="text-[10px] text-neutral-500 truncate">Aryan Verma</p>
              </div>
            </button>

            <button
              onClick={() => handleDemo('admin')}
              disabled={loading}
              className="flex items-center gap-2 rounded border border-red-900/40 bg-red-950/20 p-2 text-left hover:border-red-700 hover:bg-red-950/40 transition-colors"
            >
              <Shield className="h-4 w-4 text-red-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-red-300 truncate text-[11px]">Admin High Cmd</p>
                <p className="text-[10px] text-neutral-400 truncate">Full Control</p>
              </div>
            </button>

            <button
              onClick={() => handleDemo('streamer-mota')}
              disabled={loading}
              className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900/80 p-2 text-left hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              <Radio className="h-4 w-4 text-red-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-white truncate text-[11px]">Streamer: Mota</p>
                <p className="text-[10px] text-neutral-500 truncate">Krish Malik</p>
              </div>
            </button>

            <button
              onClick={() => handleDemo('streamer-kancha')}
              disabled={loading}
              className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900/80 p-2 text-left hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              <Radio className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-white truncate text-[11px]">Streamer: Kancha</p>
                <p className="text-[10px] text-neutral-500 truncate">Thunderbolt</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
