import React, { useState, useRef } from 'react';
import { Play, ShoppingBag, Radio, Volume2, VolumeX, Video, Image as ImageIcon } from 'lucide-react';
import { Streamer, LiveStatus } from '../types.js';

interface HeroSectionProps {
  streamers: Streamer[];
  liveStreams: LiveStatus[];
  onWatchLive: () => void;
  onShopMerch: () => void;
}

interface BackgroundVideoOption {
  id: string;
  name: string;
  youtubeId: string;
}

const GTA_RP_VIDEOS: BackgroundVideoOption[] = [
  {
    id: 'los_santos_ambient_drone',
    name: 'Los Santos 4K Ambience',
    youtubeId: 'Me2ATrIklJA', // Official Requested Video: Cinematic Drone View of Los Santos - GTA 5 Ambience in 4K
  },
  {
    id: 'mota_bhai_rp_1',
    name: 'Mota Bhai RP',
    youtubeId: 'Vhw30Fj56oo',
  },
  {
    id: 'thunderbolt_kancha_1',
    name: 'Thunderbolt Gaming',
    youtubeId: '_fmk-NcPSZ8',
  },
];

export function HeroSection({ streamers, liveStreams, onWatchLive, onShopMerch }: HeroSectionProps) {
  const activeLiveCount = liveStreams.filter(s => s.isLive).length;
  const [selectedVideo, setSelectedVideo] = useState<BackgroundVideoOption>(GTA_RP_VIDEOS[0]);
  const [videoMode, setVideoMode] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-neutral-800">
      {/* Background Video & Scrim Container */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#08080a]">
        {/* Static high-res Los Santos poster (visible immediately and as underlay) */}
        <img
          src="/images/hero_gang_los_santos_1790601393984.jpg"
          alt="Los Santos night cityscape"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            videoMode && videoLoaded ? 'opacity-35' : 'opacity-65'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Ambient GTA 5 RP Cinematic Video in Background */}
        {videoMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=${
                isMuted ? '1' : '0'
              }&controls=0&loop=1&playlist=${selectedVideo.youtubeId}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&enablejsapi=1`}
              title="GTA 5 RP Background Video"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] h-[160vh] min-w-full min-h-full object-cover opacity-65 scale-125 filter contrast-110 brightness-95 transition-opacity duration-700"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={() => setVideoLoaded(true)}
            />
          </div>
        )}

        {/* Cinematic Scrims & Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/65 to-[#08080a]/40" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#08080a]/60 to-[#08080a]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Editorial Gang Indicator */}
        <div className="inline-flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/40 px-3.5 py-1 text-xs font-semibold tracking-wider text-red-400 backdrop-blur-sm mb-4">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span>GTA 5 ROLEPLAY PREMIER SYNDICATE</span>
          {activeLiveCount > 0 && (
            <>
              <span className="text-neutral-500">·</span>
              <span className="text-red-300 font-bold uppercase">{activeLiveCount} STREAMING NOW</span>
            </>
          )}
        </div>

        {/* Official Gang Emblem Logo */}
        <div className="mx-auto mb-4 flex justify-center">
          <img
            src="/images/black_bulls_emblem_1790605389270.jpg"
            alt="Black Bulls Los Santos Official Crest"
            className="h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-[0_10px_25px_rgba(220,38,38,0.5)] transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Hero Title & Skull Horns Wordmark */}
        <h1 className="font-display text-6xl tracking-tight text-white sm:text-8xl lg:text-9xl uppercase font-black leading-none drop-shadow-2xl">
          BLACK <span className="text-red-600 text-glow-red">BULLS</span>
        </h1>

        {/* Tagline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-neutral-300 font-normal leading-relaxed text-balance">
          The most feared and respected criminal royalty in Los Santos RP. Led by <span className="font-bold text-white">Mota Bhai</span> & <span className="font-bold text-white">Thunderbolt Gaming</span>.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onWatchLive}
            data-cursor-label="WATCH"
            className="group flex items-center gap-2.5 rounded-md bg-red-600 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/60 transition-all hover:bg-red-500 hover:shadow-red-600/40 active:scale-95 whitespace-nowrap"
          >
            <Play className="h-4 w-4 fill-white transition-transform group-hover:scale-110" />
            <span>Watch Live Broadcasts</span>
          </button>

          <button
            onClick={onShopMerch}
            data-cursor-label="MERCH"
            className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900/90 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-red-900/60 hover:bg-neutral-800 active:scale-95 whitespace-nowrap group"
          >
            <ShoppingBag className="h-4 w-4 text-red-500 transition-transform group-hover:scale-110" />
            <span>Merch Drop (Coming Soon)</span>
          </button>
        </div>

        {/* Live Streamers Quick Status Strip */}
        <div className="mt-14 inline-flex flex-wrap items-center justify-center gap-6 rounded-lg border border-neutral-800/90 bg-[#0e0e14]/80 p-3 sm:px-6 backdrop-blur-md">
          {streamers.map(s => {
            const isStreamerLive = liveStreams.some(l => l.streamerId === s.id && l.isLive);
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={s.photo}
                    alt={s.name}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-full border border-neutral-700 object-cover"
                  />
                  {isStreamerLive && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 ring-2 ring-[#0e0e14]">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white leading-tight">{s.name}</p>
                    {isStreamerLive ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-red-400">
                        <Radio className="h-3 w-3 animate-pulse" /> LIVE
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-500">Offline</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">{s.inGameCharacter}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Background Video Control Toolbar */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-lg border border-neutral-800/80 bg-black/75 p-1.5 backdrop-blur-md text-xs text-neutral-300">
        <button
          onClick={() => setVideoMode(!videoMode)}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-colors ${
            videoMode ? 'bg-red-600/30 text-red-300 border border-red-500/40' : 'text-neutral-400 hover:text-white'
          }`}
          title={videoMode ? 'Switch to static image poster' : 'Enable GTA 5 RP background video'}
        >
          {videoMode ? <Video className="h-3.5 w-3.5 text-red-400" /> : <ImageIcon className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{videoMode ? 'RP Video ON' : 'Static BG'}</span>
        </button>

        {videoMode && (
          <>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center gap-1 rounded px-2 py-1 text-neutral-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-red-400" />}
            </button>

            {/* Quick Switcher for GTA RP Background Scenes */}
            <div className="hidden md:flex items-center gap-1 border-l border-neutral-800 pl-2">
              {GTA_RP_VIDEOS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVideo(v)}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                    selectedVideo.id === v.id
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {v.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
