import React, { useState } from 'react';
import { ShoppingBag, Bell, Sparkles, ShieldCheck, Flame, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Product } from '../types.js';

interface MerchSectionProps {
  products?: Product[];
}

interface UpcomingDropItem {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
  image: string;
  features: string[];
}

const UPCOMING_DROP_ITEMS: UpcomingDropItem[] = [
  {
    id: 'drop_hoodie_01',
    name: 'Black Bulls "Crimson Horns" Heavyweight Hoodie',
    category: 'Outerwear',
    status: 'In Final Production',
    description: 'Custom 450 GSM French Terry cotton in washed obsidian black. Oversized gothic bull horns screenprint across the back with embroidered crimson crest on the left chest.',
    image: '/images/merch_hoodie_black_bulls_1790601418612.jpg',
    features: ['450 GSM French Terry', '3D Metallic Horns Embroidery', 'Double-Lined Hood', 'Custom Syndicate Woven Labels']
  },
  {
    id: 'drop_tee_01',
    name: 'Black Bulls "Los Santos Criminal Royalty" Vintage Tee',
    category: 'T-Shirts',
    status: 'Fabric Dyeing & Printing',
    description: '260 GSM heavy combed cotton with relaxed drop-shoulder cut. Features the official Black Bulls seal and Los Santos territory coordinates.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    features: ['260 GSM Combed Cotton', 'Vintage Acid Wash Finish', 'Pre-shrunk Heavyweight', 'Reinforced Collar']
  },
  {
    id: 'drop_cap_01',
    name: 'Tactical Syndicate 3D Embroidered Snapback',
    category: 'Headwear',
    status: 'Packaging & Tagging',
    description: 'Structured 6-panel silhouette in matte black with raised 3D crimson bull horns embroidery and custom Black Bulls laser-etched metal buckle.',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    features: ['Structured 6-Panel Crown', 'Raised 3D Bull Embroidery', 'Laser-Etched Metal Buckle', 'Breathable Eyelets']
  },
  {
    id: 'drop_mug_01',
    name: 'Syndicate Matte Black Ceramic Heist Mug',
    category: 'Accessories',
    status: 'Quality Verification',
    description: '15 oz oversized ceramic mug with double-sided matte black and gloss crimson glaze. Dishwasher safe, microwave safe, and ready for all-night RP grinds.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    features: ['15 oz Heavy Ceramic', 'Scratch-Resistant Matte Finish', 'Dishwasher & Microwave Safe', 'Ergonomic Grip Handle']
  }
];

export function MerchSection({}: MerchSectionProps) {
  const [emailOrContact, setEmailOrContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [vipCode, setVipCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if previously subscribed in localStorage
  React.useEffect(() => {
    const savedVip = localStorage.getItem('bb_vip_drop_code');
    if (savedVip) {
      setSubscribed(true);
      setVipCode(savedVip);
    }
  }, []);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrContact.trim()) {
      setErrorMessage('Please enter your email or Discord username.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/products/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrDiscord: emailOrContact.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register notification');
      }

      const generatedCode = data.vipCode || `BULLS-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
      setVipCode(generatedCode);
      setSubscribed(true);
      localStorage.setItem('bb_vip_drop_code', generatedCode);
    } catch {
      // Fallback local registration
      const generatedCode = `BULLS-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
      setVipCode(generatedCode);
      setSubscribed(true);
      localStorage.setItem('bb_vip_drop_code', generatedCode);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="merch" className="relative border-b border-neutral-800/80 py-24 bg-[#0a0a0e]/60 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/40 px-3.5 py-1 text-xs font-semibold tracking-wider text-red-400 backdrop-blur-sm mb-3">
              <Flame className="h-3.5 w-3.5 text-red-500" />
              <span>DROP 01 • IN PRODUCTION</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl text-white tracking-wide uppercase">
              Official Syndicate Merch
            </h2>
          </div>
          <div className="max-w-md">
            <span className="inline-block rounded border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-400 mb-2">
              Coming Soon
            </span>
            <p className="text-neutral-400 text-sm leading-relaxed">
              The official Black Bulls apparel line is currently in physical production. Drop date will be revealed live on stream by <strong className="text-neutral-200">Mota Bhai</strong> and <strong className="text-neutral-200">Thunderbolt Gaming</strong>.
            </p>
          </div>
        </div>

        {/* Drop 01 VIP Launch Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-red-900/50 bg-gradient-to-r from-red-950/40 via-neutral-950/80 to-black p-8 sm:p-12 mb-16 shadow-2xl">
          <div className="absolute right-0 top-0 -bottom-10 w-1/3 bg-radial from-red-600/10 to-transparent pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 mb-3">
                <Sparkles className="h-4 w-4" />
                <span>Priority Gang Roster</span>
              </div>
              <h3 className="font-display text-3xl sm:text-5xl text-white tracking-tight uppercase leading-tight mb-4">
                Get 1-Hour Early Access to Drop 01
              </h3>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
                Only <strong className="text-white">500 total numbered pieces</strong> will be manufactured for Drop 01. Register your email or Discord handle below to secure your priority access pass before the public release sells out.
              </p>

              {/* VIP Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-2.5 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-3 text-xs text-neutral-300">
                  <Clock className="h-4 w-4 text-red-500 shrink-0" />
                  <span>1-Hour Early Cart Access</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-3 text-xs text-neutral-300">
                  <Flame className="h-4 w-4 text-red-500 shrink-0" />
                  <span>Exclusive 15% Launch Code</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-3 text-xs text-neutral-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Signed Sticker Pack</span>
                </div>
              </div>

              {/* VIP Form / Confirmed State */}
              {subscribed ? (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">VIP Drop Priority Registered!</p>
                      <p className="text-xs text-neutral-300 mt-0.5">
                        Your Black Bulls Early Access Code is active:{' '}
                        <span className="font-mono font-bold text-emerald-400 text-sm ml-1 bg-black/50 px-2 py-0.5 rounded border border-emerald-500/30">
                          {vipCode}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={emailOrContact}
                      onChange={e => setEmailOrContact(e.target.value)}
                      placeholder="Enter email or Discord (e.g. user#1234)"
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900/90 px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/60 transition-all hover:bg-red-500 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Bell className="h-4 w-4" />
                    <span>{isSubmitting ? 'Registering...' : 'Get VIP Drop Alert'}</span>
                  </button>
                </form>
              )}

              {errorMessage && (
                <p className="text-xs text-red-400 mt-2">{errorMessage}</p>
              )}
            </div>

            {/* Visual Teaser Badge */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-xl border border-neutral-800 bg-[#0e0e14] p-6 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-950/60 border border-red-900/60 text-red-500">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h4 className="font-display text-2xl text-white uppercase tracking-wider mb-2">
                  Drop Phase 1
                </h4>
                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-mono text-neutral-300 border border-neutral-800 mb-4">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>STATUS: FINAL SAMPLES & PACKAGING</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Every order includes authentic Los Santos custom dustbag and numbered holographic Black Bulls authenticity certificate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Pieces Lookbook Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-8">
            <h3 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-wide">
              Drop 01 Preview Lookbook
            </h3>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
              4 Signature Pieces
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {UPCOMING_DROP_ITEMS.map(item => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-neutral-800 bg-[#0e0e14] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-red-900/60 hover:shadow-xl hover:shadow-red-950/20"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center filter grayscale-[25%] transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

                    {/* Coming Soon overlay pill */}
                    <div className="absolute top-3 left-3">
                      <span className="rounded bg-red-600/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                        Coming Soon
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                      <span className="bg-black/75 px-2 py-0.5 rounded text-neutral-400">
                        {item.category}
                      </span>
                      <span className="bg-black/75 px-2 py-0.5 rounded text-amber-400 text-[10px]">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h4 className="text-base font-bold text-white group-hover:text-red-300 transition-colors leading-snug mb-2">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Specifications List */}
                    <ul className="space-y-1.5 border-t border-neutral-800/80 pt-3">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[11px] text-neutral-400">
                          <span className="h-1 w-1 rounded-full bg-red-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer status button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      const inputElem = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (inputElem) {
                        inputElem.focus();
                        inputElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 transition-colors hover:border-red-900/60 hover:bg-neutral-800 hover:text-white"
                  >
                    <span>Notify Me On Drop</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
