import React, { useState } from 'react';
import { POPULAR_7TV_EMOTES } from '../../data/multistreamDefaults.js';
import { EmoteItem } from '../../types/multistream.js';
import { Search, Sparkles, Check, Smile } from 'lucide-react';

interface EmotePickerProps {
  onInsertEmote: (emoteName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function EmotePicker({ onInsertEmote, isOpen, onClose }: EmotePickerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedEmote, setCopiedEmote] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = POPULAR_7TV_EMOTES.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelect = (emote: EmoteItem) => {
    onInsertEmote(emote.name);
    setCopiedEmote(emote.name);
    setTimeout(() => setCopiedEmote(null), 1200);
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 w-80 sm:w-96 rounded-xl border border-neutral-800 bg-[#0c0f12] p-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>7TV & Kick Emote Matrix</span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-white text-xs px-1"
        >
          ✕
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search 7TV emotes (e.g. KEKW, Pepe)..."
          className="w-full rounded-md border border-neutral-800 bg-neutral-900/90 pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 scrollbar-none text-[10px]">
        {['all', 'popular', 'reactions', 'pepe', 'classic'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50'
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emotes Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-neutral-800">
        {filtered.map(emote => (
          <button
            key={emote.id}
            onClick={() => handleSelect(emote)}
            title={emote.name}
            className="group relative flex flex-col items-center justify-center p-2 rounded-lg border border-neutral-800/80 bg-neutral-900/60 hover:bg-neutral-800 hover:border-emerald-500/60 transition-all hover:scale-105"
          >
            <img
              src={emote.url}
              alt={emote.name}
              className="h-8 w-8 object-contain transition-transform group-hover:scale-110"
              loading="lazy"
              onError={e => {
                // Graceful fallback text if 7tv cdn has local connection blip
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.parentElement) {
                  const fallback = document.createElement('span');
                  fallback.className = 'text-[9px] font-bold text-emerald-400';
                  fallback.innerText = emote.name.slice(0, 4);
                  target.parentElement.appendChild(fallback);
                }
              }}
            />
            <span className="mt-1 text-[9px] font-mono text-neutral-400 group-hover:text-emerald-300 truncate w-full text-center">
              {emote.name}
            </span>

            {copiedEmote === emote.name && (
              <div className="absolute inset-0 rounded-lg bg-emerald-600/90 flex items-center justify-center text-white text-[10px] font-bold animate-in fade-in">
                <Check className="h-3 w-3 mr-0.5" /> Added!
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 px-1">
        <span>Click emote to insert into active chat</span>
        <span className="text-emerald-500 font-mono">7TV Active</span>
      </div>
    </div>
  );
}
