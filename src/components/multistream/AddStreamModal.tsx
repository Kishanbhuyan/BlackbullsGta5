import React, { useState } from 'react';
import { X, Plus, Radio, Star, Sparkles, Search, Check, ExternalLink, Zap } from 'lucide-react';
import { SUGGESTED_CHANNELS, DEFAULT_PRESETS } from '../../data/multistreamDefaults.js';
import { StreamPreset } from '../../types/multistream.js';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (username: string) => void;
  onApplyPreset: (preset: StreamPreset) => void;
  activeStreams: string[];
  favorites: string[];
  onToggleFavorite: (username: string) => void;
}

export function AddStreamModal({
  isOpen,
  onClose,
  onAddStream,
  onApplyPreset,
  activeStreams,
  favorites,
  onToggleFavorite,
}: AddStreamModalProps) {
  const [inputVal, setInputVal] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'presets' | 'favorites'>('quick');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // URL & Username Parser
  const parseAndAdd = (rawInput: string) => {
    setError(null);
    if (!rawInput.trim()) return;

    // Check if user pasted a multi-stream path e.g. "channel1/channel2" or "channel1,channel2"
    const cleaned = rawInput.trim().replace(/^https?:\/\/(www\.)?kick\.com\//i, '').replace(/^https?:\/\/player\.kick\.com\//i, '');
    const tokens = cleaned
      .split(/[\/,\s]+/)
      .map(t => t.trim().replace(/^@/, '').toLowerCase())
      .filter(t => t.length > 0 && t !== 'popout' && t !== 'chat');

    if (tokens.length === 0) {
      setError('Please enter a valid Kick channel name or URL');
      return;
    }

    tokens.forEach(tok => {
      onAddStream(tok);
    });

    setInputVal('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    parseAndAdd(inputVal);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-[#0b0e12] p-6 shadow-2xl shadow-emerald-950/20 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl uppercase tracking-wider text-white">
                Add Kick Stream
              </h3>
              <p className="text-xs text-neutral-400">
                Enter any Kick channel name, profile URL, or select from curated presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* URL / Username Input Form */}
        <form onSubmit={handleSubmit} className="mb-5">
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Kick Channel / Stream URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-emerald-400">@</span>
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="e.g. motabhai or kick.com/xqc"
                autoFocus
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900/90 pl-8 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        </form>

        {/* Navigation Tabs */}
        <div className="flex rounded-lg border border-neutral-800 bg-neutral-900/80 p-1 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'quick' ? 'bg-neutral-800 text-emerald-400 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Suggested</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'presets' ? 'bg-neutral-800 text-emerald-400 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Squad Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'favorites' ? 'bg-neutral-800 text-emerald-400 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            <span>Favorites ({favorites.length})</span>
          </button>
        </div>

        {/* TAB 1: Suggested Channels */}
        {activeTab === 'quick' && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
            {SUGGESTED_CHANNELS.map(ch => {
              const isAdded = activeStreams.includes(ch.username.toLowerCase());
              const isFav = favorites.includes(ch.username.toLowerCase());
              return (
                <div
                  key={ch.username}
                  className="flex items-center justify-between rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-2.5 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(ch.username)}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      className={`p-1 rounded hover:bg-neutral-800 transition-colors ${
                        isFav ? 'text-amber-400' : 'text-neutral-600 hover:text-neutral-400'
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{ch.name}</p>
                      <p className="text-[11px] font-mono text-emerald-400/90 truncate">@{ch.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                      {ch.tag}
                    </span>
                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => {
                        onAddStream(ch.username);
                        onClose();
                      }}
                      className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition-all ${
                        isAdded
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3 w-3" /> In Grid
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Multi-stream Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {DEFAULT_PRESETS.map(preset => (
              <div
                key={preset.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{preset.name}</span>
                    {preset.badge && (
                      <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-800/80">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onApplyPreset(preset);
                      onClose();
                    }}
                    className="flex items-center gap-1 rounded bg-emerald-500 px-2.5 py-1 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
                  >
                    <span>Load Grid ({preset.streams.length})</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mb-2">{preset.description}</p>
                <div className="flex flex-wrap gap-1">
                  {preset.streams.map(s => (
                    <span key={s} className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-neutral-800">
                      @{s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: User Favorites */}
        {activeTab === 'favorites' && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {favorites.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No favorite streamers saved yet.</p>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Star any streamer from the Suggested list or on active stream cards to save them here.
                </p>
              </div>
            ) : (
              favorites.map(fav => {
                const isAdded = activeStreams.includes(fav.toLowerCase());
                return (
                  <div
                    key={fav}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/40 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-mono text-xs font-bold text-emerald-400">@{fav}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleFavorite(fav)}
                        className="text-[11px] text-neutral-500 hover:text-red-400 px-1"
                      >
                        Remove
                      </button>
                      <button
                        disabled={isAdded}
                        onClick={() => {
                          onAddStream(fav);
                          onClose();
                        }}
                        className={`rounded px-2.5 py-1 text-xs font-bold ${
                          isAdded
                            ? 'bg-neutral-800 text-neutral-500'
                            : 'bg-emerald-500 text-black hover:bg-emerald-400'
                        }`}
                      >
                        {isAdded ? 'Added' : 'Add to Grid'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
