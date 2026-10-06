import React from 'react';
import { Youtube, Radio, Instagram, ExternalLink, Flame, Sparkles } from 'lucide-react';
import { Streamer, LiveStatus } from '../types.js';

interface StreamersSectionProps {
  streamers: Streamer[];
  liveStreams: LiveStatus[];
  onSelectStreamerForLive: (streamerId: string) => void;
}

export function StreamersSection({ streamers, liveStreams, onSelectStreamerForLive }: StreamersSectionProps) {
  return (
    <section id="streamers" className="relative border-b border-neutral-800/80 py-24 bg-[#08080c]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">
              <Flame className="h-4 w-4" />
              <span>Gang High Command</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl text-white tracking-wide uppercase">
              Meet The Leaders
            </h2>
          </div>
          <p className="max-w-md text-neutral-400 text-sm leading-relaxed">
            The masterminds behind the Black Bulls. High-stakes roleplay creators streaming daily across YouTube and Kick.
          </p>
        </div>

        {/* Streamers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {streamers.map(streamer => {
            const isYTLive = liveStreams.some(l => l.streamerId === streamer.id && l.platform === 'youtube' && l.isLive === true);
            const isKickLive = liveStreams.some(l => l.streamerId === streamer.id && l.platform === 'kick' && l.isLive === true);
            const isLiveAnywhere = isYTLive || isKickLive;

            return (
              <div
                key={streamer.id}
                className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-[#0e0e14] transition-all hover:border-red-900/60 hover:shadow-2xl hover:shadow-red-950/30"
              >
                {/* Accent Top Bar */}
                <div className={`h-1.5 w-full ${isLiveAnywhere ? 'bg-gradient-to-r from-red-600 via-red-800 to-neutral-900' : 'bg-neutral-800'}`} />

                <div className="p-6 sm:p-8">
                  {/* Avatar & Live Status Header */}
                  <div className="flex items-start gap-5 mb-6">
                    <div className="relative shrink-0">
                      <img
                        src={streamer.photo}
                        alt={streamer.name}
                        referrerPolicy="no-referrer"
                        className={`h-24 w-24 sm:h-28 sm:w-28 rounded-xl border-2 object-cover object-center shadow-lg transition-transform duration-300 group-hover:scale-105 ${
                          isLiveAnywhere ? 'border-red-600' : 'border-neutral-700 opacity-80'
                        }`}
                      />
                      {isLiveAnywhere ? (
                        <span className="absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md ring-2 ring-[#0e0e14]">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          LIVE
                        </span>
                      ) : (
                        <span className="absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400 shadow-md ring-2 ring-[#0e0e14]">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                          OFFLINE
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-2xl sm:text-3xl text-white tracking-wide uppercase">
                          {streamer.name}
                        </h3>
                        {isLiveAnywhere ? (
                          <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            LIVE
                          </span>
                        ) : (
                          <span className="rounded bg-neutral-800 border border-neutral-700/80 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                            OFFLINE
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-col gap-0.5 text-xs">
                        <p className="text-neutral-400">
                          Role: <span className="font-semibold text-neutral-200">{streamer.inGameCharacter}</span>
                        </p>
                        <p className="text-neutral-500">
                          Played by: <span className="text-neutral-400">{streamer.realName}</span>
                        </p>
                      </div>

                      {/* Live Badges for Platforms */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {isYTLive && (
                          <span className="inline-flex items-center gap-1 rounded bg-red-950/80 px-2 py-0.5 text-[11px] font-semibold text-red-300 border border-red-800/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                            YouTube Live
                          </span>
                        )}
                        {isKickLive && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Kick Live
                          </span>
                        )}
                        {!isLiveAnywhere && (
                          <span className="inline-flex items-center gap-1.5 rounded bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 text-[11px] font-bold text-neutral-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                            Currently Offline
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                    {streamer.bio}
                  </p>

                  {/* Social & Channel Links */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-5">
                    <div className="flex items-center gap-3">
                      {streamer.youtubeUrl && (
                        <a
                          href={streamer.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-300 transition-colors hover:border-red-600/50 hover:bg-red-600 hover:text-white"
                          title="YouTube Channel"
                        >
                          <Youtube className="h-4 w-4" />
                        </a>
                      )}
                      {streamer.kickUrl && (
                        <a
                          href={streamer.kickUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-300 transition-colors hover:border-emerald-600/50 hover:bg-emerald-600 hover:text-white"
                          title="Kick Channel"
                        >
                          <Radio className="h-4 w-4" />
                        </a>
                      )}
                      {streamer.instagramUrl && (
                        <a
                          href={streamer.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-300 transition-colors hover:border-pink-600/50 hover:bg-pink-600 hover:text-white"
                          title="Instagram"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectStreamerForLive(streamer.id)}
                      className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors active:scale-95 whitespace-nowrap ${
                        isLiveAnywhere
                          ? 'border border-red-600 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white shadow-sm'
                          : 'border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      {isLiveAnywhere ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span>Watch Live</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                          <span>View Profile & VOD</span>
                        </>
                      )}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
