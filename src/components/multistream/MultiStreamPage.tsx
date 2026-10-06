import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StreamSlot, GridLayout, StreamPreset } from '../../types/multistream.js';
import { DEFAULT_PRESETS } from '../../data/multistreamDefaults.js';
import { StreamPlayerCell } from './StreamPlayerCell.js';
import { MultiChatPanel } from './MultiChatPanel.js';
import { AddStreamModal } from './AddStreamModal.js';
import { LiveStatus } from '../../types.js';
import {
  Plus,
  LayoutGrid,
  Grid,
  Columns,
  Rows,
  Maximize2,
  Share2,
  VolumeX,
  Volume2,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Check,
  Radio,
  Tv,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';

interface MultiStreamPageProps {
  onBackToHome: () => void;
  liveStreams?: LiveStatus[];
}

export function MultiStreamPage({ onBackToHome, liveStreams = [] }: MultiStreamPageProps) {
  // Active streams list
  const [slots, setSlots] = useState<StreamSlot[]>(() => {
    // 1. Check URL hash/query first
    try {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      let streamsFromUrl: string[] = [];

      if (urlParams.get('streams')) {
        streamsFromUrl = urlParams.get('streams')!.split(',').filter(Boolean);
      } else if (hash.includes('/')) {
        // e.g. #multistream/motabhai/thunderboltgaming
        const parts = hash.replace(/^#\/?(multistream)?\/?/, '').split('/').filter(Boolean);
        if (parts.length > 0) streamsFromUrl = parts;
      }

      if (streamsFromUrl.length > 0) {
        return streamsFromUrl.map((u, i) => ({
          id: `slot_${Date.now()}_${i}`,
          username: u.trim().toLowerCase(),
          isMuted: i > 0, // mute all except first to avoid sound clashing
          isFocused: false,
          addedAt: Date.now(),
        }));
      }

      // 2. Check localStorage
      const saved = localStorage.getItem('bb_multistream_active');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse streams from URL/storage', err);
    }

    // 3. Default Black Bulls multi-view
    return [
      { id: 'slot_1', username: 'motabhai', isMuted: false, isFocused: false, addedAt: Date.now() },
      { id: 'slot_2', username: 'thunderboltgaming', isMuted: true, isFocused: false, addedAt: Date.now() + 1 },
    ];
  });

  // Favorite streamers
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bb_multistream_favorites');
      return saved ? JSON.parse(saved) : ['motabhai', 'thunderboltgaming'];
    } catch {
      return ['motabhai', 'thunderboltgaming'];
    }
  });

  // Layout & UI States
  const [layout, setLayout] = useState<GridLayout>('auto');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [selectedChatStreamer, setSelectedChatStreamer] = useState<string>('motabhai');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [areAllMuted, setAreAllMuted] = useState(false);

  // Sync to localStorage & URL
  useEffect(() => {
    localStorage.setItem('bb_multistream_active', JSON.stringify(slots));
    // Update hash for shareable URL without reload
    if (slots.length > 0) {
      const path = slots.map(s => s.username).join('/');
      window.history.replaceState(null, '', `#multistream/${path}`);
    } else {
      window.history.replaceState(null, '', '#multistream');
    }
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('bb_multistream_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Keep selectedChatStreamer valid
  useEffect(() => {
    if (slots.length > 0 && !slots.some(s => s.username.toLowerCase() === selectedChatStreamer.toLowerCase())) {
      setSelectedChatStreamer(slots[0].username);
    }
  }, [slots, selectedChatStreamer]);

  // Add Stream
  const handleAddStream = useCallback((username: string) => {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return;

    setSlots(prev => {
      if (prev.some(s => s.username.toLowerCase() === clean)) {
        return prev; // already exists
      }
      return [
        ...prev,
        {
          id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          username: clean,
          isMuted: prev.length > 0, // mute subsequent streams
          isFocused: false,
          addedAt: Date.now(),
        }
      ];
    });
    setSelectedChatStreamer(clean);
  }, []);

  // Remove Stream
  const handleRemoveStream = useCallback((id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
  }, []);

  // Toggle Mute
  const handleToggleMute = useCallback((id: string) => {
    setSlots(prev =>
      prev.map(s => s.id === id ? { ...s, isMuted: !s.isMuted } : s)
    );
  }, []);

  // Mute All / Unmute All
  const handleToggleMuteAll = () => {
    const nextState = !areAllMuted;
    setAreAllMuted(nextState);
    setSlots(prev => prev.map((s, idx) => ({ ...s, isMuted: nextState ? true : idx > 0 })));
  };

  // Toggle Focus Mode
  const handleToggleFocus = useCallback((id: string) => {
    setSlots(prev =>
      prev.map(s => s.id === id ? { ...s, isFocused: !s.isFocused } : { ...s, isFocused: false })
    );
  }, []);

  // Move stream position
  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    setSlots(prev => {
      const copy = [...prev];
      const item = copy.splice(fromIndex, 1)[0];
      copy.splice(toIndex, 0, item);
      return copy;
    });
  }, []);

  // Apply Preset
  const handleApplyPreset = (preset: StreamPreset) => {
    setSlots(
      preset.streams.map((name, idx) => ({
        id: `slot_${preset.id}_${idx}`,
        username: name.toLowerCase(),
        isMuted: idx > 0,
        isFocused: false,
        addedAt: Date.now() + idx,
      }))
    );
    if (preset.streams[0]) {
      setSelectedChatStreamer(preset.streams[0]);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (username: string) => {
    const clean = username.toLowerCase();
    setFavorites(prev =>
      prev.includes(clean) ? prev.filter(f => f !== clean) : [...prev, clean]
    );
  };

  // Share Grid Link
  const handleShareGrid = () => {
    const path = slots.map(s => s.username).join('/');
    const url = `${window.location.origin}${window.location.pathname}#multistream/${path}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    });
  };

  // Check if any slot is currently focused
  const focusedSlot = useMemo(() => slots.find(s => s.isFocused), [slots]);

  // Determine grid container CSS based on layout and slot count
  const gridLayoutClass = useMemo(() => {
    if (focusedSlot) {
      return 'grid-cols-1';
    }

    const count = slots.length;
    if (layout === 'grid-2') return 'grid-cols-1 md:grid-cols-2';
    if (layout === 'grid-3') return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (layout === 'grid-4') return 'grid-cols-1 md:grid-cols-2';
    if (layout === 'vertical') return 'grid-cols-1';
    if (layout === 'horizontal') return 'grid-flow-col auto-cols-fr';

    // Auto Layout Calculation
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (count === 4) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  }, [layout, slots.length, focusedSlot]);

  return (
    <div className="relative flex flex-col h-screen w-full bg-[#07080a] text-white overflow-hidden select-none">
      {/* Glow Ambient Highlights */}
      <div className="absolute top-0 left-1/4 h-64 w-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-64 w-96 rounded-full bg-red-600/5 blur-3xl pointer-events-none" />

      {/* TOP COMMAND BAR */}
      <header className="relative z-30 flex h-14 items-center justify-between border-b border-neutral-800/80 bg-[#0a0d10]/95 px-3 sm:px-4 backdrop-blur-md shrink-0">
        {/* Left: Brand & Return */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
            title="Return to Black Bulls Syndicate Portal"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Main Site</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-display text-lg tracking-wider text-white">
              MULTI<span className="text-emerald-400">KICK</span>
            </span>
            <span className="rounded bg-emerald-950/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-800/60 hidden md:inline">
              LIVE GRID
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-xs text-neutral-400 pl-2 font-mono">
            <span className="text-white font-bold">{slots.length}</span>
            <span>{slots.length === 1 ? 'stream active' : 'streams active'}</span>
          </div>
        </div>

        {/* Center: Controls Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Add Stream Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Stream</span>
          </button>

          {/* Quick Presets Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
              title="Select squad presets"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">Presets</span>
            </button>
            <div className="absolute left-0 top-full mt-1.5 hidden group-hover:block w-56 rounded-xl border border-neutral-800 bg-[#0e1217] p-2 shadow-2xl z-50">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Squad Presets
              </p>
              {DEFAULT_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-800/80 transition-colors text-xs"
                >
                  <p className="font-bold text-white flex items-center justify-between">
                    <span>{preset.name}</span>
                    <span className="text-[9px] text-emerald-400 font-mono">({preset.streams.length})</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Selector */}
          <div className="hidden sm:flex items-center rounded-lg border border-neutral-800 bg-neutral-900/80 p-0.5 text-xs">
            <button
              onClick={() => setLayout('auto')}
              className={`p-1.5 rounded ${layout === 'auto' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-white'}`}
              title="Auto Grid Layout"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayout('grid-2')}
              className={`p-1.5 rounded ${layout === 'grid-2' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-white'}`}
              title="Dual 2-Column Split"
            >
              <Columns className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayout('grid-4')}
              className={`p-1.5 rounded ${layout === 'grid-4' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-white'}`}
              title="Quad 2x2 Grid"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Audio Master Mute/Unmute */}
          <button
            onClick={handleToggleMuteAll}
            className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            title={areAllMuted ? 'Restore audio' : 'Mute all streams'}
          >
            {areAllMuted ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden md:inline">Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">Audio</span>
              </>
            )}
          </button>

          {/* Share Grid Button */}
          <button
            onClick={handleShareGrid}
            className="relative flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            title="Copy shareable link for this multi-stream layout"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">Share</span>

            {shareToast && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xl flex items-center gap-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <Check className="h-3.5 w-3.5" />
                <span>Grid link copied!</span>
              </div>
            )}
          </button>
        </div>

        {/* Right: Chat Toggle & Theater Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatOpen(prev => !prev)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
              isChatOpen
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={isChatOpen ? 'Hide chat (Theater mode)' : 'Show unified chat'}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat</span>
            {isChatOpen ? <EyeOff className="h-3 w-3 ml-0.5 opacity-70" /> : <Eye className="h-3 w-3 ml-0.5 opacity-70" />}
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT: Video Grid + Unified Chat Drawer */}
      <div className="relative flex flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* VIDEO GRID AREA */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-2 sm:p-3 bg-[#07090c] scrollbar-thin scrollbar-thumb-neutral-800">
          {slots.length === 0 ? (
            /* Empty Grid State */
            <div className="flex flex-1 flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-950/40 m-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                <Tv className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl uppercase tracking-wider text-white">
                No Active Streams in Grid
              </h3>
              <p className="mt-1 max-w-md text-xs text-neutral-400 leading-relaxed">
                Add Kick streamers to build your custom multi-view layout, or load one of the Black Bulls Syndicate presets.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add First Stream</span>
                </button>

                <button
                  onClick={() => handleApplyPreset(DEFAULT_PRESETS[0])}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-200 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Load Black Bulls Duo</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Video Player Grid */
            <div className={`grid gap-2 sm:gap-3 flex-1 h-full min-h-0 ${gridLayoutClass}`}>
              {(focusedSlot ? [focusedSlot] : slots).map((slot, index) => {
                const streamMatch = liveStreams.find(l =>
                  l.platform === 'kick' &&
                  (l.streamUrl?.toLowerCase().includes(`kick.com/${slot.username.toLowerCase()}`) ||
                   l.streamerName?.toLowerCase().includes(slot.username.toLowerCase()) ||
                   l.streamerId?.toLowerCase().includes(slot.username.toLowerCase()))
                );
                const isSlotLive = streamMatch ? streamMatch.isLive : false;

                return (
                  <div
                    key={slot.id}
                    className="relative w-full h-full min-h-[260px] sm:min-h-[320px] flex flex-col"
                  >
                    <StreamPlayerCell
                      slot={slot}
                      isFocused={slot.isFocused}
                      onToggleFocus={handleToggleFocus}
                      onToggleMute={handleToggleMute}
                      onRemove={handleRemoveStream}
                      onMoveLeft={index > 0 ? () => handleMove(index, index - 1) : undefined}
                      onMoveRight={index < slots.length - 1 ? () => handleMove(index, index + 1) : undefined}
                      onOpenChat={streamer => {
                        setSelectedChatStreamer(streamer);
                        setIsChatOpen(true);
                      }}
                      isFavorite={favorites.includes(slot.username.toLowerCase())}
                      onToggleFavorite={handleToggleFavorite}
                      isLive={isSlotLive}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* UNIFIED CHAT SIDE PANEL */}
        {isChatOpen && (
          <div className="w-80 sm:w-96 lg:w-[400px] h-full shrink-0 transition-all duration-300">
            <MultiChatPanel
              activeStreamers={slots.map(s => s.username)}
              selectedStreamer={selectedChatStreamer}
              onSelectStreamer={setSelectedChatStreamer}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>

      {/* ADD STREAM MODAL */}
      <AddStreamModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStream={handleAddStream}
        onApplyPreset={handleApplyPreset}
        activeStreams={slots.map(s => s.username)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
