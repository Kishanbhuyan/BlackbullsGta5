import React from 'react';
import { Youtube, Radio, Instagram, ShieldAlert, Flame } from 'lucide-react';
import { Streamer } from '../types.js';

interface FooterProps {
  streamers: Streamer[];
}

export function Footer({ streamers }: FooterProps) {
  return (
    <footer className="border-t border-neutral-800 bg-[#060608] text-neutral-400 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-3 font-display text-3xl tracking-wider text-white mb-4 group">
              <img
                src="/src/assets/images/black_bulls_emblem_1790605389270.jpg"
                alt="Black Bulls Syndicate Emblem"
                className="h-9 w-9 rounded-md object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.4)] transition-transform duration-300 group-hover:scale-105"
              />
              <span>
                BLACK <span className="text-red-500">BULLS</span>
              </span>
            </a>
            <p className="max-w-md text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
              The premier GTA 5 Roleplay syndicate community hub. Dedicated to supporting Mota Bhai and Thunderbolt Gaming with live streams, highlight vaults, official merchandise drops, and community engagement.
            </p>

            <div className="flex items-center gap-3">
              {streamers.map(s => (
                <div key={s.id} className="flex items-center gap-1.5 text-xs text-neutral-400 border border-neutral-800 rounded-md px-2.5 py-1 bg-neutral-900/60">
                  <span className="font-semibold text-white">{s.name}:</span>
                  {s.youtubeUrl && (
                    <a
                      href={s.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-400"
                      title="YouTube"
                    >
                      <Youtube className="h-3.5 w-3.5 inline" />
                    </a>
                  )}
                  {s.kickUrl && (
                    <a
                      href={s.kickUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400"
                      title="Kick"
                    >
                      <Radio className="h-3.5 w-3.5 inline" />
                    </a>
                  )}
                  {s.instagramUrl && (
                    <a
                      href={s.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-pink-400"
                      title="Instagram"
                    >
                      <Instagram className="h-3.5 w-3.5 inline" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base uppercase tracking-wider text-white mb-4">
              Syndicate Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#story" className="hover:text-white transition-colors">
                  Origins & Story
                </a>
              </li>
              <li>
                <a href="#streamers" className="hover:text-white transition-colors">
                  High Command Streamers
                </a>
              </li>
              <li>
                <a href="#live" className="hover:text-white transition-colors">
                  Live Broadcast Feeds
                </a>
              </li>
              <li>
                <a href="#clips" className="hover:text-white transition-colors">
                  Highlights & Clips Vault
                </a>
              </li>
              <li>
                <a href="#merch" className="hover:text-white transition-colors">
                  Official Merch Store
                </a>
              </li>
              <li>
                <a href="#fan-wall" className="hover:text-white transition-colors">
                  Fan Wall Community
                </a>
              </li>
            </ul>
          </div>

          {/* Roleplay Context */}
          <div>
            <h4 className="font-display text-base uppercase tracking-wider text-white mb-4">
              Los Santos RP
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Black Bulls is a fictional roleplay gang operating exclusively inside modded multiplayer servers. All criminal storylines, heists, and shootouts are strictly in-game roleplay fiction.
            </p>
          </div>
        </div>

        {/* Mandatory Exact Legal Disclaimer */}
        <div className="border-t border-neutral-800/80 pt-8 text-center text-xs text-neutral-400">
          <p className="leading-relaxed font-normal">
            Fan site — not affiliated with Rockstar Games or Take-Two Interactive.
          </p>
          <p className="leading-relaxed font-normal mt-0.5">
            Grand Theft Auto™ is a trademark of Take-Two Interactive Software, Inc.
          </p>
          <p className="mt-4 text-[11px] text-neutral-500">
            &copy; {new Date().getFullYear()} BLACK BULLS Gang Fan Hub. Built for the community.
          </p>
        </div>
      </div>
    </footer>
  );
}
