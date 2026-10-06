import React from 'react';
import { GangStory } from '../types.js';
import { BookOpen, Shield, Flame } from 'lucide-react';

interface StorySectionProps {
  story: GangStory | null;
}

export function StorySection({ story }: StorySectionProps) {
  if (!story) {
    return null;
  }

  return (
    <section id="story" className="relative border-b border-neutral-800/80 py-24 bg-[#0a0a0e]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">
              <Flame className="h-4 w-4" />
              <span>Origins & Syndicate History</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl text-white tracking-wide uppercase">
              {story.title}
            </h2>
          </div>
          <p className="max-w-xl text-neutral-400 text-sm sm:text-base leading-relaxed">
            {story.tagline}
          </p>
        </div>

        {/* Narrative Bento Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual & Lead Story */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-lg border border-neutral-800 group aspect-video">
              <img
                src={story.heroImage || '/src/assets/images/black_bulls_emblem_1790605389270.jpg'}
                alt="Black Bulls Syndicate Emblem"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <span className="text-xs font-mono uppercase tracking-wider text-red-400 mb-1 block">
                  Los Santos Syndicate Archives
                </span>
                <p className="text-base sm:text-lg font-medium text-white leading-snug">
                  {story.leadParagraph}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-[#0e0e14] p-6 sm:p-8">
              <h3 className="font-display text-2xl text-white tracking-wide uppercase mb-3">
                The Rise of the Syndicate
              </h3>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {story.fullLore}
              </p>
            </div>
          </div>

          {/* Chapters Column */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="border-b border-neutral-800 pb-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Key Chronicles
              </span>
            </div>

            {story.chapters.map((chap, idx) => (
              <div
                key={chap.id || idx}
                className="group rounded-lg border border-neutral-800 bg-[#0e0e14]/70 p-6 transition-all hover:border-red-900/60 hover:bg-[#12121a]"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {chap.title}
                  </h4>
                  <span className="text-xs font-mono text-neutral-500">
                    CH.0{idx + 1}
                  </span>
                </div>
                <p className="text-xs font-medium text-red-400/90 mb-2">
                  {chap.summary}
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {chap.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
