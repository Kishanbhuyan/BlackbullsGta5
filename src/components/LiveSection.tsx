import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Youtube, Users, ExternalLink, RefreshCw, MessageSquare, Send, Trash2, Shield, User, Flame } from 'lucide-react';
import { Streamer, LiveStatus, LiveChatMessage } from '../types.js';
import { useAuth } from '../context/AuthContext.js';

interface LiveSectionProps {
  streamers: Streamer[];
  liveStreams: LiveStatus[];
  selectedStreamerId: string;
  onSelectStreamer: (id: string) => void;
  onRefreshLive: () => void;
  isRefreshing: boolean;
  onOpenAuth?: () => void;
}

export function LiveSection({
  streamers,
  liveStreams,
  selectedStreamerId,
  onSelectStreamer,
  onRefreshLive,
  isRefreshing,
  onOpenAuth,
}: LiveSectionProps) {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<'youtube' | 'kick'>('youtube');
  const [chatMode, setChatMode] = useState<'live' | 'kick'>('live');
  const [localKickHandle, setLocalKickHandle] = useState<string>(() => {
    return localStorage.getItem('bb_kick_username') || '';
  });
  const [isEditingKickHandle, setIsEditingKickHandle] = useState(false);
  const [tempKickInput, setTempKickInput] = useState('');

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

  const handleOpenKickLogin = () => {
    const width = 500;
    const height = 700;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    window.open(
      'https://kick.com/login',
      'kick_login_tab',
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes`
    );
  };

  // Real Syndicate Live Chat State (Zero Dummy Messages)
  const [realMessages, setRealMessages] = useState<LiveChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatRefreshKey, setChatRefreshKey] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const currentStreamer = streamers.find(s => s.id === selectedStreamerId) || streamers[0];
  const streamerId = currentStreamer?.id;

  // Fetch real syndicate chat messages
  const fetchRealMessages = useCallback(async () => {
    if (!streamerId) return;
    try {
      const res = await fetch(`/api/live-chat?streamerId=${streamerId}`);
      if (res.ok) {
        const data = await res.json();
        setRealMessages(data.messages || []);
      }
    } catch (err) {
      console.warn('Failed to fetch real live chat', err);
    }
  }, [streamerId]);

  useEffect(() => {
    if (!streamerId) return;
    fetchRealMessages();
    // Poll real chat every 2.5 seconds
    const interval = setInterval(fetchRealMessages, 2500);
    return () => clearInterval(interval);
  }, [streamerId, fetchRealMessages]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [realMessages, chatMode]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending || !currentStreamer) return;

    setIsSending(true);
    const messageText = chatInput.trim();
    setChatInput('');

    const activeKickHandle = user?.kickUsername || localKickHandle || (guestName.startsWith('@') ? guestName.slice(1) : undefined);
    const activeUsername = user?.name || (activeKickHandle ? `@${activeKickHandle}` : undefined) || guestName || `Bull_${Math.floor(100 + Math.random() * 900)}`;

    try {
      const token = localStorage.getItem('bb_token');
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          streamerId: currentStreamer.id,
          message: messageText,
          username: activeUsername,
          kickUsername: activeKickHandle,
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setRealMessages(prev => [...prev, saved]);
      }
    } catch (err) {
      console.warn('Failed to send live message', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      const token = localStorage.getItem('bb_token');
      const res = await fetch(`/api/live-chat/${msgId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        setRealMessages(prev => prev.filter(m => m.id !== msgId));
      }
    } catch (err) {
      console.warn('Failed to delete live message', err);
    }
  };

  // If streamers are still loading on initial render, safely render after all hooks
  if (!currentStreamer) {
    return null;
  }

  // Find stream matching current streamer and platform
  const currentStream = liveStreams.find(
    s => s.streamerId === currentStreamer.id && s.platform === selectedPlatform
  );

  const isLive = Boolean(currentStream && currentStream.isLive === true);

  // Helper to ensure YouTube feeds and VODs start paused after refreshing the website
  const getPausedEmbedUrl = (rawUrl?: string): string => {
    if (!rawUrl) return '';
    try {
      const urlObj = new URL(rawUrl);
      urlObj.searchParams.set('autoplay', '0');
      return urlObj.toString();
    } catch {
      return rawUrl.replace(/([?&])autoplay=[^&]+/g, '$1autoplay=0');
    }
  };

  return (
    <section id="live" className="relative border-b border-neutral-800/80 py-24 bg-[#0a0a0e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3">
              {liveStreams.some(l => l.isLive === true) ? (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
                  <span className="text-red-500">Live Broadcast Command Center</span>
                </>
              ) : (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-neutral-500" />
                  <span className="text-neutral-400">Broadcast Command Center · Offline</span>
                </>
              )}
            </div>
            <h2 className="font-display text-4xl sm:text-6xl text-white tracking-wide uppercase">
              Live Broadcasts
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshLive}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Streamer Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {streamers.map(s => {
            const hasActiveStream = liveStreams.some(l => l.streamerId === s.id && l.isLive === true);
            const isSelected = s.id === currentStreamer.id;

            return (
              <button
                key={s.id}
                onClick={() => onSelectStreamer(s.id)}
                className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-neutral-800 text-white border border-neutral-700 shadow-md'
                    : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <img
                  src={s.photo}
                  alt={s.name}
                  referrerPolicy="no-referrer"
                  className={`h-6 w-6 rounded-full object-cover border ${hasActiveStream ? 'border-red-600' : 'border-neutral-700 opacity-70'}`}
                />
                <span className={hasActiveStream ? 'text-white' : 'text-neutral-300'}>{s.name}</span>
                {hasActiveStream ? (
                  <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-neutral-800/90 border border-neutral-700/80 px-2 py-0.5 text-[9px] font-bold uppercase text-neutral-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                    OFFLINE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPlatform('youtube')}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedPlatform === 'youtube'
                  ? 'bg-red-600/20 text-red-400 border border-red-600/50 shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <Youtube className="h-4 w-4 text-red-500" />
              <span>YouTube Feed</span>
              {liveStreams.some(l => l.streamerId === currentStreamer.id && l.platform === 'youtube' && l.isLive === true) ? (
                <span className="flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.2 text-[8px] font-extrabold uppercase text-white ml-1">
                  <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 px-1.5 py-0.2 text-[8px] font-bold uppercase ml-1">
                  <span className="h-1 w-1 rounded-full bg-neutral-500" />
                  OFFLINE
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedPlatform('kick')}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedPlatform === 'kick'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <Radio className="h-4 w-4 text-emerald-400" />
              <span>Kick Live</span>
              {liveStreams.some(l => l.streamerId === currentStreamer.id && l.platform === 'kick' && l.isLive === true) ? (
                <span className="flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.2 text-[8px] font-extrabold uppercase text-white ml-1">
                  <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 px-1.5 py-0.2 text-[8px] font-bold uppercase ml-1">
                  <span className="h-1 w-1 rounded-full bg-neutral-500" />
                  OFFLINE
                </span>
              )}
            </button>
          </div>

          {isLive && currentStream ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-red-400 font-bold uppercase bg-red-950/60 border border-red-800/60 px-2.5 py-1 rounded-md">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                LIVE NOW
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300 font-mono">
                <Users className="h-3.5 w-3.5 text-neutral-400" />
                {currentStream.viewerCount.toLocaleString()} Viewers
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-400 font-bold uppercase bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md">
                <span className="h-2 w-2 rounded-full bg-neutral-500" />
                OFFLINE
              </span>
              <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
                Channel offline on {selectedPlatform === 'youtube' ? 'YouTube' : 'Kick'}
              </span>
            </div>
          )}
        </div>

        {/* Main Broadcast Player Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Video Player Box */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-2xl stream-player-box" data-stream-player="true">
              {isLive && currentStream?.embedUrl ? (
                <iframe
                  src={getPausedEmbedUrl(currentStream.embedUrl)}
                  title={`${currentStreamer.name} Live Stream`}
                  className="h-full w-full border-0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : currentStream?.lastOfflineVideo?.embedUrl ? (
                <div className="relative h-full w-full">
                  <iframe
                    src={getPausedEmbedUrl(currentStream.lastOfflineVideo.embedUrl)}
                    title={`${currentStreamer.name} Past Stream`}
                    className="h-full w-full border-0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute top-3 left-3 rounded bg-black/80 px-2.5 py-1 text-[11px] font-mono font-medium text-neutral-300 border border-neutral-700">
                    Offline · Recent Stream VOD (Paused)
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-[#0d0d12]">
                  <Radio className="h-12 w-12 text-neutral-600 mb-3" />
                  <p className="font-display text-2xl uppercase tracking-wider text-white">
                    {currentStreamer.name} is Currently Offline
                  </p>
                  <p className="mt-2 max-w-md text-xs text-neutral-400">
                    Tune in during Los Santos RP prime time hours or watch highlights below.
                  </p>
                </div>
              )}
            </div>

            {/* Broadcast Details Bar */}
            <div className="rounded-xl border border-neutral-800 bg-[#0e0e14] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-red-500">
                      {currentStreamer.inGameCharacter}
                    </span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-xs font-mono text-neutral-400">Grand Theft Auto V</span>
                    <span className="text-neutral-600">·</span>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        LIVE NOW
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 border border-neutral-700 px-2.5 py-0.5 text-[10px] font-bold uppercase text-neutral-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {currentStream?.title || `${currentStreamer.name} GTA 5 Roleplay Broadcast`}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={selectedPlatform === 'youtube' ? currentStreamer.youtubeUrl : currentStreamer.kickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-white uppercase tracking-wider hover:bg-neutral-700 transition-colors whitespace-nowrap"
                  >
                    <span>Open in {selectedPlatform === 'youtube' ? 'YouTube' : 'Kick'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* REAL LIVE CHAT PANEL: Direct Site Chat (Chattable with Kick Identity) & Kick Native Embed */}
          <div className="lg:col-span-4 rounded-xl border border-neutral-800 bg-[#0e0e14] flex flex-col h-[540px] overflow-hidden shadow-xl">
            {/* Live Feed Header & Chat Mode Switcher */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-[#0c0c10] px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'}`} />
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  Live Stream Chat
                </h4>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                  isLive
                    ? 'bg-red-950/80 text-red-400 border-red-800/60'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700/60'
                }`}>
                  {isLive ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>

              {/* Mode Toggle: Direct Site Chat vs Native Kick Iframe */}
              <div className="flex rounded-md border border-neutral-800 bg-neutral-900 p-0.5 text-[11px]">
                <button
                  onClick={() => setChatMode('live')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                    chatMode === 'live'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Chat directly from this site with your Kick identity"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Live Chat</span>
                </button>
                <button
                  onClick={() => setChatMode('kick')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                    chatMode === 'kick'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Kick.com native embed view"
                >
                  <Radio className="h-3 w-3" />
                  <span>Kick Embed</span>
                </button>
              </div>
            </div>

            {/* CHAT BODY: Mode 1 = Live Site Chat Feed (Default) | Mode 2 = Kick Native Iframe */}
            {chatMode === 'live' ? (
              <div className="flex-1 flex flex-col bg-[#0b0b0f] overflow-hidden min-h-0">
                {/* Real Messages Feed */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs"
                >
                  {realMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 text-neutral-500">
                      <MessageSquare className="h-8 w-8 text-neutral-700 mb-2" />
                      <p className="font-semibold text-neutral-400 text-xs">Live Chat Ready</p>
                      <p className="text-[11px] text-neutral-500 mt-1 max-w-[220px]">
                        Type below to chat directly with {currentStreamer.name} and the Black Bulls community from this site!
                      </p>
                    </div>
                  ) : (
                    realMessages.map(msg => {
                      const isHighCommand = msg.role === 'admin';
                      const isStreamerMsg = msg.role === 'streamer';
                      const canDelete = user?.role === 'admin' || user?.role === 'streamer';

                      return (
                        <div
                          key={msg.id}
                          className="group rounded-md border border-neutral-800/80 bg-neutral-900/50 p-2.5 transition-colors hover:border-neutral-700"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-[11px] truncate max-w-[120px]">
                                {msg.username}
                              </span>

                              {/* Kick Badge */}
                              {msg.kickUsername && (
                                <span className="rounded bg-emerald-950/90 border border-emerald-500/50 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400 inline-flex items-center gap-1 shadow-sm">
                                  <Radio className="h-2 w-2" />
                                  <span>@{msg.kickUsername}</span>
                                </span>
                              )}

                              {/* Role Badges */}
                              {isHighCommand && (
                                <span className="rounded bg-red-600/30 border border-red-500/50 px-1 py-0.2 text-[9px] font-extrabold uppercase text-red-300">
                                  HIGH CMD
                                </span>
                              )}
                              {isStreamerMsg && (
                                <span className="rounded bg-amber-600/30 border border-amber-500/50 px-1 py-0.2 text-[9px] font-extrabold uppercase text-amber-300">
                                  STREAMER
                                </span>
                              )}
                              {!msg.kickUsername && msg.role === 'fan' && (
                                <span className="rounded bg-neutral-800 border border-neutral-700 px-1 py-0.2 text-[9px] font-semibold text-neutral-300">
                                  SOLDIER
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-neutral-500 tabular-nums">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>

                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity p-0.5"
                                  title="Delete message"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-neutral-200 text-xs break-words leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* Mode 2: Kick Native Popout Chat View */
              <div className="flex-1 flex flex-col bg-[#0b0e0f] overflow-hidden min-h-0 stream-player-box" data-stream-player="true">
                {/* Kick Chat Info Bar */}
                <div className="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/80 px-3 py-1.5 text-[11px] text-neutral-400 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                    <span>Kick: <strong className="text-emerald-400 font-mono">@{currentStreamer.kickUsername}</strong></span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                      isLive ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}>
                      {isLive ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatRefreshKey(k => k + 1)}
                      className="hover:text-white transition-colors"
                      title="Reload Kick chat"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleOpenKickPopout(currentStreamer.kickUsername)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      title="Open Popout Chat on Kick.com"
                    >
                      <span>Popout</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Embedded Kick Popout Chat iframe */}
                <iframe
                  key={`${currentStreamer.kickUsername}_${chatRefreshKey}`}
                  src={`https://kick.com/popout/${currentStreamer.kickUsername}/chat`}
                  title={`Kick Live Chat for ${currentStreamer.name}`}
                  className="flex-1 w-full border-0 bg-transparent min-h-0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals"
                  allow="autoplay; encrypted-media; clipboard-write; fullscreen"
                />

                {/* Kick Login helper note */}
                <div className="border-t border-neutral-800/80 bg-[#090b0d] px-3 py-1.5 flex items-center justify-between text-[10px] text-neutral-400 shrink-0">
                  <span>Chat typing inside frames blocked by Kick?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenKickPopout(currentStreamer.kickUsername)}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      Popout on Kick
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setChatMode('live')}
                      className="text-red-400 hover:underline font-bold"
                    >
                      Use Site Chat
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* UNIFIED CHAT INPUT BAR: Allows viewers to chat directly from this site in BOTH views */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-neutral-800 bg-[#0e0e14] p-3 space-y-2 shrink-0"
            >
              {/* Identity & Kick Handle Bar */}
              <div className="flex items-center justify-between text-[11px] bg-neutral-900/80 px-2.5 py-1.5 rounded-md border border-neutral-800">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Radio className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="text-neutral-400 shrink-0">Sender:</span>

                  {user ? (
                    <span className="font-bold text-white truncate flex items-center gap-1">
                      {user.kickUsername ? (
                        <span className="text-emerald-400 font-mono">@{user.kickUsername}</span>
                      ) : (
                        user.name
                      )}
                    </span>
                  ) : localKickHandle && !isEditingKickHandle ? (
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-bold font-mono text-emerald-400 truncate">
                        @{localKickHandle}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempKickInput(localKickHandle);
                          setIsEditingKickHandle(true);
                        }}
                        className="text-[10px] text-neutral-500 hover:text-white underline ml-1"
                      >
                        edit
                      </button>
                    </div>
                  ) : isEditingKickHandle ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tempKickInput}
                        onChange={e => setTempKickInput(e.target.value)}
                        placeholder="Kick Username"
                        className="rounded border border-neutral-700 bg-black px-1.5 py-0.5 text-[11px] text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none w-28"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const clean = tempKickInput.trim().replace(/^@/, '');
                            if (clean) {
                              setLocalKickHandle(clean);
                              localStorage.setItem('bb_kick_username', clean);
                            }
                            setIsEditingKickHandle(false);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const clean = tempKickInput.trim().replace(/^@/, '');
                          if (clean) {
                            setLocalKickHandle(clean);
                            localStorage.setItem('bb_kick_username', clean);
                          }
                          setIsEditingKickHandle(false);
                        }}
                        className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-500"
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-400">Guest</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempKickInput('');
                          setIsEditingKickHandle(true);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-[10px]"
                      >
                        + Set Kick Username
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!user && onOpenAuth && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      Kick Sign-In
                    </button>
                  )}
                </div>
              </div>

              {/* Message Input & Send Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`Chat live with ${currentStreamer.name}...`}
                  maxLength={280}
                  className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-red-600 px-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500 disabled:opacity-50 transition-colors shadow-md shadow-red-950/40"
                  title="Send message to live stream chat"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-500 px-0.5">
                <span className="text-emerald-400/90 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Chat directly from this site</span>
                </span>
                <span>Press Enter to send</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
