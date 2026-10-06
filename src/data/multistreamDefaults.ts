import { EmoteItem, StreamPreset } from '../types/multistream.js';

export const POPULAR_7TV_EMOTES: EmoteItem[] = [
  {
    id: '7tv-pepehands',
    name: 'PepeHands',
    url: 'https://cdn.7tv.app/emote/60ae3ecaf39a75510d320bea/2x.webp',
    category: 'pepe',
  },
  {
    id: '7tv-omegalul',
    name: 'OMEGALUL',
    url: 'https://cdn.7tv.app/emote/60ae3ab4f39a75510d320be6/2x.webp',
    category: 'popular',
  },
  {
    id: '7tv-kekw',
    name: 'KEKW',
    url: 'https://cdn.7tv.app/emote/60ae396ff39a75510d320be4/2x.webp',
    category: 'popular',
  },
  {
    id: '7tv-catjam',
    name: 'CatJAM',
    url: 'https://cdn.7tv.app/emote/60ae34f4f39a75510d320bd9/2x.webp',
    category: 'reactions',
  },
  {
    id: '7tv-gigachad',
    name: 'GIGACHAD',
    url: 'https://cdn.7tv.app/emote/60b64be8624be20ec50b86a4/2x.webp',
    category: 'popular',
  },
  {
    id: '7tv-pog',
    name: 'Pog',
    url: 'https://cdn.7tv.app/emote/60ae408df39a75510d320bee/2x.webp',
    category: 'classic',
  },
  {
    id: '7tv-monkas',
    name: 'monkaS',
    url: 'https://cdn.7tv.app/emote/60ae43f8f39a75510d320bf4/2x.webp',
    category: 'pepe',
  },
  {
    id: '7tv-wideharden',
    name: 'WideHarden',
    url: 'https://cdn.7tv.app/emote/60ae39a3f39a75510d320be5/2x.webp',
    category: 'popular',
  },
  {
    id: '7tv-ez',
    name: 'EZ',
    url: 'https://cdn.7tv.app/emote/60ae456cf39a75510d320bf7/2x.webp',
    category: 'classic',
  },
  {
    id: '7tv-clap',
    name: 'Clap',
    url: 'https://cdn.7tv.app/emote/60ae48c5f39a75510d320c04/2x.webp',
    category: 'reactions',
  },
  {
    id: '7tv-sadge',
    name: 'Sadge',
    url: 'https://cdn.7tv.app/emote/60ae41d0f39a75510d320bf0/2x.webp',
    category: 'pepe',
  },
  {
    id: '7tv-nodders',
    name: 'NODDERS',
    url: 'https://cdn.7tv.app/emote/60ae4224f39a75510d320bf1/2x.webp',
    category: 'reactions',
  },
  {
    id: '7tv-pausechamp',
    name: 'PauseChamp',
    url: 'https://cdn.7tv.app/emote/60ae491cf39a75510d320c05/2x.webp',
    category: 'reactions',
  },
  {
    id: '7tv-pepela',
    name: 'PepeLa',
    url: 'https://cdn.7tv.app/emote/60ae3e51f39a75510d320be7/2x.webp',
    category: 'pepe',
  },
  {
    id: '7tv-ayaya',
    name: 'AYAYA',
    url: 'https://cdn.7tv.app/emote/60ae3cbef39a75510d320be8/2x.webp',
    category: 'classic',
  },
  {
    id: '7tv-smoge',
    name: 'Smoge',
    url: 'https://cdn.7tv.app/emote/612fb8ebfcb87d605c6c22a3/2x.webp',
    category: 'pepe',
  },
];

export const DEFAULT_PRESETS: StreamPreset[] = [
  {
    id: 'preset-blackbulls-duo',
    name: 'Black Bulls Syndicate Duo',
    description: 'Mota Bhai & Thunderbolt Gaming live RP multi-cam view',
    streams: ['motabhai', 'thunderboltgaming'],
    badge: 'SYNDICATE',
  },
  {
    id: 'preset-top-kick',
    name: 'Top Kick Streamers',
    description: 'Watch xQc, Adin Ross & Westcol in one unified grid',
    streams: ['xqc', 'adinross', 'westcol'],
    badge: 'TRENDING',
  },
  {
    id: 'preset-quad-rp',
    name: 'Grand Theft Auto RP Squad',
    description: '4-perspective multi-view for high-stakes Los Santos operations',
    streams: ['motabhai', 'thunderboltgaming', 'adinross', 'xqc'],
    badge: '4-WAY',
  },
];

export const SUGGESTED_CHANNELS = [
  { username: 'motabhai', name: 'Mota Bhai (Krish Malik)', tag: 'Syndicate Boss' },
  { username: 'thunderboltgaming', name: 'Thunderbolt (Kancha Bhau)', tag: 'Lead Enforcer' },
  { username: 'xqc', name: 'xQc', tag: 'Kick Ambassador' },
  { username: 'adinross', name: 'Adin Ross', tag: 'Kick Partner' },
  { username: 'westcol', name: 'Westcol', tag: 'Kick LATAM' },
  { username: 'n3on', name: 'N3on', tag: 'IRL / Gaming' },
  { username: 'roshtein', name: 'Roshtein', tag: 'Slots / Live' },
  { username: 'trainwreckstv', name: 'Trainwreckstv', tag: 'Kick Founder' },
];
