import React, { useState } from 'react';
import { Play, Youtube, Radio, X, Clock, Eye, Film } from 'lucide-react';
import { VideoClip, Streamer } from '../types.js';

interface ClipsSectionProps {
  videos: VideoClip[];
  streamers: Streamer[];
}

export function ClipsSection({ videos, streamers }: ClipsSectionProps) {
  const [filterStreamer, setFilterStreamer] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [activeModalVideo, setActiveModalVideo] = useState<VideoClip | null>(null);

  // Filter videos strictly by streamer, platform, and type
  const filtered = videos.filter(v => {
    const matchesStreamer = filterStreamer === 'all' || v.streamerId === filterStreamer;
    const matchesType = filterType === 'all' || v.type === filterType;
    const matchesPlatform = filterPlatform === 'all' || v.platform === filterPlatform;
    return matchesStreamer && matchesType && matchesPlatform;
  });

  return (
    <section id="clips" className="relative border-b border-neutral-800/80 py-24 bg-[#08080c]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">
              <Film className="h-4 w-4" />
              <span>Dedicated Syndicate Video Feed</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl text-white tracking-wide uppercase">
              Official YouTube & Stream Archive
            </h2>
          </div>
          <p className="max-w-md text-neutral-400 text-sm leading-relaxed">
            Live broadcasts, recent YouTube uploads, and roleplay highlights exclusively from <strong className="text-white font-medium">MOTA BHAI</strong> and <strong className="text-white font-medium">Thunderbolt Gaming</strong>.
          </p>
        </div>

        {/* Filter Controls (Functional Segmented Buttons adhering to design guidelines) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-6 mb-10">
          {/* Streamer Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-lg border border-neutral-800 overflow-x-auto">
            <button
              onClick={() => setFilterStreamer('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterStreamer === 'all'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Both Streamers
            </button>
            {streamers.map(s => (
              <button
                key={s.id}
                onClick={() => setFilterStreamer(s.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterStreamer === s.id
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Platform Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-lg border border-neutral-800">
              <button
                onClick={() => setFilterPlatform('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterPlatform === 'all'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Feeds
              </button>
              <button
                onClick={() => setFilterPlatform('youtube')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterPlatform === 'youtube'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Youtube className="h-3.5 w-3.5 text-red-400" />
                <span>YouTube Feed</span>
              </button>
              <button
                onClick={() => setFilterPlatform('kick')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterPlatform === 'kick'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Radio className="h-3.5 w-3.5 text-emerald-300" />
                <span>Kick</span>
              </button>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-lg border border-neutral-800">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Formats
              </button>
              <button
                onClick={() => setFilterType('clip')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterType === 'clip'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Clips
              </button>
              <button
                onClick={() => setFilterType('highlight')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterType === 'highlight'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Highlights
              </button>
              <button
                onClick={() => setFilterType('stream')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterType === 'stream'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                VODs
              </button>
            </div>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(video => (
            <div
              key={video.id}
              onClick={() => setActiveModalVideo(video)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-800 bg-[#0e0e14] transition-all hover:border-red-900/70 hover:shadow-xl hover:shadow-red-950/20"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-5 w-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Metadata overlay on image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                  <div className="flex items-center gap-1.5 bg-black/75 px-2 py-0.5 rounded">
                    {video.platform === 'youtube' ? (
                      <Youtube className="h-3 w-3 text-red-500" />
                    ) : (
                      <Radio className="h-3 w-3 text-emerald-400" />
                    )}
                    <span className="capitalize">{video.type}</span>
                  </div>

                  {video.duration && (
                    <div className="flex items-center gap-1 bg-black/75 px-2 py-0.5 rounded">
                      <Clock className="h-3 w-3 text-neutral-400" />
                      <span>{video.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
                  <span className="font-semibold text-red-400">{video.streamerName}</span>
                  {video.views && (
                    <>
                      <span>·</span>
                      <span className="tabular-nums">{video.views}</span>
                    </>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-red-300 transition-colors">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-neutral-400">
            <p className="text-base font-semibold">No videos match the selected filters.</p>
            <p className="text-xs text-neutral-500 mt-1">Try resetting the filter options above.</p>
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      {activeModalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-neutral-800 bg-[#0e0e14] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-500">
                  {activeModalVideo.streamerName}
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-xs text-neutral-400 capitalize">{activeModalVideo.type}</span>
              </div>
              <button
                onClick={() => setActiveModalVideo(null)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close video player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Embed Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={activeModalVideo.embedUrl}
                title={activeModalVideo.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                {activeModalVideo.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Published {new Date(activeModalVideo.publishedAt).toLocaleDateString()}</span>
                <a
                  href={activeModalVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:underline"
                >
                  Watch on {activeModalVideo.platform === 'youtube' ? 'YouTube' : 'Kick'} &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
