import React, { useState } from 'react';
import { StreamSlot } from '../../types/multistream.js';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCw,
  X,
  ExternalLink,
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';

interface StreamPlayerCellProps {
  slot: StreamSlot;
  isFocused: boolean;
  onToggleFocus: (id: string) => void;
  onToggleMute: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onOpenChat: (username: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (username: string) => void;
  isLive?: boolean;
}

export function StreamPlayerCell({
  slot,
  isFocused,
  onToggleFocus,
  onToggleMute,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onOpenChat,
  isFavorite,
  onToggleFavorite,
  isLive = false,
}: StreamPlayerCellProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const handleOpenKickPopout = (username: string) => {
    const width = 450;
    const height = 720;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    window.open(
      `https://kick.com/popout/${encodeURIComponent(username)}/chat`,
      `kick_chat_${username}`,
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes`
    );
  };

  return (
    <div
      className={`group relative flex flex-col h-full w-full bg-black rounded-xl overflow-hidden border transition-all duration-200 ${
        isFocused
          ? 'border-emerald-500 shadow-[0_0_20px_rgba(83,252,24,0.25)] ring-1 ring-emerald-500'
          : 'border-neutral-800/80 hover:border-neutral-700'
      }`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Top HUD Controls Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/90 via-black/60 to-transparent transition-opacity duration-200 ${
          showControls ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
        }`}
      >
        {/* Streamer Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-0.5 border border-neutral-700/80 backdrop-blur-md">
            <span className={`flex h-2 w-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
            <span className="font-mono text-xs font-bold text-white truncate max-w-[130px]">
              @{slot.username}
            </span>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
              isLive
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}>
              {isLive ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          <button
            onClick={() => onToggleFavorite(slot.username)}
            title={isFavorite ? 'Remove from favorites' : 'Favorite channel'}
            className="p-1 rounded-md bg-black/60 text-neutral-400 hover:text-amber-400 transition-colors border border-neutral-800"
          >
            <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-1.5">
          {/* Position Shifters */}
          {onMoveLeft && (
            <button
              onClick={onMoveLeft}
              title="Move stream left"
              className="p-1 rounded-md bg-black/70 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {onMoveRight && (
            <button
              onClick={onMoveRight}
              title="Move stream right"
              className="p-1 rounded-md bg-black/70 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Quick Chat Switcher */}
          <button
            onClick={() => onOpenChat(slot.username)}
            title="Open stream chat in side panel"
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 text-neutral-300 hover:text-emerald-400 hover:bg-neutral-800 border border-neutral-800 transition-colors text-xs font-medium"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-[10px]">Chat</span>
          </button>

          {/* Reload Stream */}
          <button
            onClick={() => setReloadKey(k => k + 1)}
            title="Reload video player"
            className="p-1.5 rounded-md bg-black/70 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          {/* Popout Window */}
          <button
            onClick={() => handleOpenKickPopout(slot.username)}
            title="Open popout chat window"
            className="p-1.5 rounded-md bg-black/70 text-neutral-300 hover:text-emerald-400 hover:bg-neutral-800 border border-neutral-800 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          {/* Focus / Solo Mode */}
          <button
            onClick={() => onToggleFocus(slot.id)}
            title={isFocused ? 'Restore grid view' : 'Focus this stream'}
            className={`p-1.5 rounded-md transition-colors border ${
              isFocused
                ? 'bg-emerald-500 text-black border-emerald-400'
                : 'bg-black/70 text-neutral-300 hover:text-emerald-400 hover:bg-neutral-800 border-neutral-800'
            }`}
          >
            {isFocused ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Close Stream */}
          <button
            onClick={() => onRemove(slot.id)}
            title="Remove stream from grid"
            className="p-1.5 rounded-md bg-black/70 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 border border-neutral-800 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Kick Video Player */}
      <div className="relative flex-1 w-full h-full min-h-[220px] bg-[#090b0e] stream-player-box" data-stream-player="true">
        <iframe
          key={`${slot.username}_${reloadKey}`}
          src={`https://player.kick.com/${encodeURIComponent(slot.username)}?autoplay=true&muted=${slot.isMuted}`}
          title={`Kick Stream - ${slot.username}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Bottom Sub-bar Indicator */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0d10] border-t border-neutral-900 text-[11px] text-neutral-400">
        <a
          href={`https://kick.com/${slot.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-400 flex items-center gap-1 truncate font-mono text-[10px]"
        >
          <span>kick.com/{slot.username}</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </a>

        <div className="flex items-center gap-2 text-[10px]">
          {isLive ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1 text-neutral-400 font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
              OFFLINE
            </span>
          )}
          <button
            onClick={() => onToggleMute(slot.id)}
            className="text-neutral-400 hover:text-white flex items-center gap-1"
          >
            {slot.isMuted ? (
              <span className="text-amber-400/90 flex items-center gap-0.5">
                <VolumeX className="h-3 w-3" /> Muted
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <Volume2 className="h-3 w-3" /> Audio On
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
