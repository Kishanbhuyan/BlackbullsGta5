import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Radio,
  ExternalLink,
  RefreshCw,
  Send,
  Smile,
  X,
  Columns,
  ChevronRight,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { EmotePicker } from './EmotePicker.js';
import { useAuth } from '../../context/AuthContext.js';
import { LiveChatMessage } from '../../types.js';

interface MultiChatPanelProps {
  activeStreamers: string[];
  selectedStreamer: string;
  onSelectStreamer: (streamer: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MultiChatPanel({
  activeStreamers,
  selectedStreamer,
  onSelectStreamer,
  isOpen,
  onClose,
}: MultiChatPanelProps) {
  const { user } = useAuth();
  const [chatMode, setChatMode] = useState<'site' | 'kick'>('site');
  const [isEmotePickerOpen, setIsEmotePickerOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [localKickHandle, setLocalKickHandle] = useState<string>(() => {
    return localStorage.getItem('bb_kick_username') || '';
  });
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [tempHandleInput, setTempHandleInput] = useState('');

  // Live messages state for active streamer
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Fallback streamer if selected is no longer in active
  const currentStreamer = activeStreamers.includes(selectedStreamer)
    ? selectedStreamer
    : activeStreamers[0] || 'motabhai';

  // Fetch real chat messages
  useEffect(() => {
    if (!currentStreamer) return;
    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/live-chat?streamerId=${encodeURIComponent(currentStreamer)}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.warn('Chat fetch error', err);
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 2500);
    return () => clearInterval(interval);
  }, [currentStreamer]);

  // Autoscroll
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, chatMode]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    setIsSending(true);
    const text = chatInput.trim();
    setChatInput('');

    const activeKick = user?.kickUsername || localKickHandle || undefined;
    const activeUsername = user?.name || (activeKick ? `@${activeKick}` : undefined) || `Bull_${Math.floor(100 + Math.random() * 900)}`;

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
          streamerId: currentStreamer,
          message: text,
          username: activeUsername,
          kickUsername: activeKick,
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setMessages(prev => [...prev, saved]);
      }
    } catch (err) {
      console.warn('Error sending chat', err);
    } finally {
      setIsSending(false);
    }
  };

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

  const handleInsertEmote = (emoteName: string) => {
    setChatInput(prev => `${prev ? prev + ' ' : ''}${emoteName} `);
  };

  if (!isOpen) return null;

  return (
    <div className="relative flex flex-col h-full w-full bg-[#0c0f14] border-l border-neutral-800/80 shadow-2xl z-20">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 bg-[#090b0e] px-3.5 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <span className="font-display text-sm uppercase tracking-wider text-white">
            Unified Live Chat
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mode Switcher */}
          <div className="flex rounded-md border border-neutral-800 bg-neutral-900/80 p-0.5 text-[10px]">
            <button
              onClick={() => setChatMode('site')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                chatMode === 'site'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Direct site chat with 7TV emotes and Kick identity"
            >
              Live Feed
            </button>
            <button
              onClick={() => setChatMode('kick')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                chatMode === 'kick'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Official Kick embed chat"
            >
              Kick Native
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Collapse chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stream Tabs Bar */}
      {activeStreamers.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 bg-[#080a0c] border-b border-neutral-900 scrollbar-none shrink-0">
          {activeStreamers.map(s => {
            const isSel = s.toLowerCase() === currentStreamer.toLowerCase();
            return (
              <button
                key={s}
                onClick={() => onSelectStreamer(s)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-mono font-bold transition-all whitespace-nowrap ${
                  isSel
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm'
                    : 'bg-neutral-900/80 text-neutral-400 border border-neutral-800/80 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isSel ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                <span>@{s}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* CHAT BODY */}
      {chatMode === 'site' ? (
        /* MODE 1: Direct Site Chat with 7TV Emote Support */
        <div className="flex-1 flex flex-col bg-[#0b0e12] overflow-hidden min-h-0">
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 text-xs scrollbar-thin scrollbar-thumb-neutral-800"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4 text-neutral-500">
                <MessageSquare className="h-8 w-8 text-neutral-700 mb-2" />
                <p className="font-bold text-white text-xs">Chatting with @{currentStreamer}</p>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
                  Be the first to post using 7TV emotes and your Kick callsign!
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className="rounded-lg border border-neutral-800/60 bg-neutral-900/40 p-2 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-[11px]">{msg.username}</span>

                      {msg.kickUsername && (
                        <span className="rounded bg-emerald-950/90 border border-emerald-500/50 px-1 py-0.2 text-[9px] font-mono font-bold text-emerald-400 inline-flex items-center gap-0.5">
                          <Radio className="h-2 w-2" /> @{msg.kickUsername}
                        </span>
                      )}

                      {msg.role === 'admin' && (
                        <span className="rounded bg-red-600/30 border border-red-500/50 px-1 py-0.2 text-[9px] font-bold text-red-300">
                          HIGH CMD
                        </span>
                      )}
                      {msg.role === 'streamer' && (
                        <span className="rounded bg-amber-600/30 border border-amber-500/50 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                          STREAMER
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 tabular-nums">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-neutral-200 text-xs break-words leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* MODE 2: Native Kick Chat Embed */
        <div className="flex-1 flex flex-col bg-[#090b0e] overflow-hidden min-h-0 stream-player-box" data-stream-player="true">
          <div className="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950 px-3 py-1.5 text-[11px] text-neutral-400 shrink-0">
            <span className="font-mono text-emerald-400 font-bold">kick.com/{currentStreamer}/chat</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="hover:text-white p-1"
                title="Refresh chat frame"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleOpenKickPopout(currentStreamer)}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                title="Popout chat window (Fixed Kick Login)"
              >
                <span>Popout</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          <iframe
            key={`${currentStreamer}_${refreshKey}`}
            src={`https://kick.com/popout/${encodeURIComponent(currentStreamer)}/chat`}
            title={`Kick Chat - ${currentStreamer}`}
            className="flex-1 w-full border-0 bg-transparent min-h-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals"
            allow="autoplay; encrypted-media; clipboard-write; fullscreen"
          />

          <div className="px-2.5 py-1 bg-black/90 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between shrink-0">
            <span>Login blocked in frame?</span>
            <button
              onClick={() => handleOpenKickPopout(currentStreamer)}
              className="text-emerald-400 hover:underline font-bold"
            >
              Open Popout Window &rarr;
            </button>
          </div>
        </div>
      )}

      {/* UNIFIED CHAT INPUT FOOTER (Available in both modes) */}
      <form onSubmit={handleSendMessage} className="border-t border-neutral-800/80 bg-[#090c0f] p-3 space-y-2 shrink-0">
        {/* Callsign / Identity Strip */}
        <div className="flex items-center justify-between text-[11px] bg-neutral-900/90 px-2 py-1 rounded-md border border-neutral-800">
          <div className="flex items-center gap-1.5 min-w-0">
            <Radio className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="text-neutral-400 shrink-0">Chatting as:</span>

            {user?.kickUsername ? (
              <span className="font-mono font-bold text-emerald-400 truncate">
                @{user.kickUsername}
              </span>
            ) : localKickHandle && !isEditingHandle ? (
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono font-bold text-emerald-400 truncate">
                  @{localKickHandle}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempHandleInput(localKickHandle);
                    setIsEditingHandle(true);
                  }}
                  className="text-[10px] text-neutral-500 hover:text-white underline ml-1"
                >
                  edit
                </button>
              </div>
            ) : isEditingHandle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempHandleInput}
                  onChange={e => setTempHandleInput(e.target.value)}
                  placeholder="Kick Username"
                  className="rounded border border-neutral-700 bg-black px-1.5 py-0.5 text-[10px] text-white focus:border-emerald-500 focus:outline-none w-24"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const clean = tempHandleInput.trim().replace(/^@/, '');
                      if (clean) {
                        setLocalKickHandle(clean);
                        localStorage.setItem('bb_kick_username', clean);
                      }
                      setIsEditingHandle(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = tempHandleInput.trim().replace(/^@/, '');
                    if (clean) {
                      setLocalKickHandle(clean);
                      localStorage.setItem('bb_kick_username', clean);
                    }
                    setIsEditingHandle(false);
                  }}
                  className="rounded bg-emerald-500 px-1 py-0.5 text-[10px] font-bold text-black"
                >
                  Set
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempHandleInput('');
                  setIsEditingHandle(true);
                }}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-[10px]"
              >
                + Set Kick Handle
              </button>
            )}
          </div>

          <span className="text-[10px] text-neutral-500 font-mono">
            to @{currentStreamer}
          </span>
        </div>

        {/* Input Field with 7TV Emote Trigger */}
        <div className="relative flex items-center gap-1.5">
          <input
            type="text"
            required
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder={`Send message to @${currentStreamer}...`}
            maxLength={280}
            className="flex-1 rounded-md border border-neutral-800 bg-neutral-900/90 pl-3 pr-9 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
          />

          {/* 7TV Emote Picker Popover Button */}
          <button
            type="button"
            onClick={() => setIsEmotePickerOpen(prev => !prev)}
            title="Open 7TV Emote Menu"
            className={`absolute right-12 top-2 p-1 rounded hover:bg-neutral-800 transition-colors ${
              isEmotePickerOpen ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smile className="h-4 w-4" />
          </button>

          <button
            type="submit"
            disabled={isSending || !chatInput.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 transition-colors shadow-lg shadow-emerald-500/20 shrink-0"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>

          {/* 7TV Emote Popover */}
          <EmotePicker
            isOpen={isEmotePickerOpen}
            onClose={() => setIsEmotePickerOpen(false)}
            onInsertEmote={handleInsertEmote}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-neutral-500 px-0.5">
          <span className="text-emerald-400/80">⚡ 7TV Emotes Enabled</span>
          <span>Press Enter to send</span>
        </div>
      </form>
    </div>
  );
}
