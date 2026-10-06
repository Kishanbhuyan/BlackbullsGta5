import { LiveStatus, VideoClip } from '../types.js';

interface CacheItem<T> {
  data: T;
  cachedAt: number;
}

const CACHE_TTL_MS = 60 * 1000;
const kickLiveCache = new Map<string, CacheItem<Partial<LiveStatus>>>();

const MOCK_KICK_CLIPS: Record<string, VideoClip[]> = {
  'motabhai': [
    {
      id: 'kick_mota_01',
      streamerId: 'streamer_motabhai',
      streamerName: 'MOTA BHAI',
      title: 'Mota Bhai Kick Exclusive: 6-Gang Summit Meeting [UNCUT]',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://kick.com/motabhai',
      embedUrl: 'https://player.kick.com/motabhai?autoplay=true',
      platform: 'kick',
      type: 'clip',
      duration: '0:58',
      views: '45K views',
      publishedAt: '2026-03-26T21:00:00Z'
    }
  ],
  'thunderboltgaming': [
    {
      id: 'kick_tb_01',
      streamerId: 'streamer_thunderbolt',
      streamerName: 'Thunderbolt Gaming',
      title: 'Kancha Bhau 360 Spin Escaping Police Helicopter! Clip of the Week',
      thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://kick.com/thunderboltgaming',
      embedUrl: 'https://player.kick.com/thunderboltgaming?autoplay=true',
      platform: 'kick',
      type: 'clip',
      duration: '1:12',
      views: '58K views',
      publishedAt: '2026-03-27T10:30:00Z'
    }
  ]
};

export async function getKickLiveStatus(
  kickUsername: string,
  streamerId: string,
  streamerName: string,
  inGameCharacter: string
): Promise<LiveStatus> {
  const cached = kickLiveCache.get(kickUsername);
  const now = Date.now();

  let liveData: Partial<LiveStatus> | null = null;

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    liveData = cached.data;
  } else {
    try {
      // Try public Kick API v2 channel livestream
      const res = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(kickUsername)}/livestream`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BlackBullsFanHub/1.0'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.id) {
          liveData = {
            isLive: true,
            title: json.data.session_title || `${streamerName} on Kick Live`,
            viewerCount: json.data.viewers || 1200,
            thumbnailUrl: json.data.thumbnail?.url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
            streamUrl: `https://kick.com/${kickUsername}`,
            embedUrl: `https://player.kick.com/${kickUsername}?autoplay=true`,
            startedAt: json.data.created_at
          };
          kickLiveCache.set(kickUsername, { data: liveData, cachedAt: now });
        } else {
          liveData = { isLive: false };
          kickLiveCache.set(kickUsername, { data: liveData, cachedAt: now });
        }
      }
    } catch (err) {
      // Kick might return Cloudflare challenge; fallback gracefully
    }
  }

  // Fallback demo state: Thunderbolt gaming active on Kick
  const isLive = liveData?.isLive ?? (kickUsername === 'thunderboltgaming');
  const title = liveData?.title || (isLive ? `${streamerName} [Kick Live] Late Night Gang Patrols & Custom Car Meets` : 'Kick Stream Offline');
  const embedUrl = `https://player.kick.com/${kickUsername}?autoplay=true`;
  const streamUrl = `https://kick.com/${kickUsername}`;
  const thumbnailUrl = liveData?.thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
  const viewerCount = isLive ? (liveData?.viewerCount || 2150) : 0;

  const fallbackClips = MOCK_KICK_CLIPS[kickUsername] || [];
  const latestClip = fallbackClips[0];

  return {
    streamerId,
    streamerName,
    inGameCharacter,
    platform: 'kick',
    isLive,
    title,
    viewerCount,
    thumbnailUrl,
    streamUrl,
    embedUrl,
    gameName: 'Grand Theft Auto V',
    lastOfflineVideo: latestClip ? {
      title: latestClip.title,
      embedUrl: latestClip.embedUrl,
      thumbnailUrl: latestClip.thumbnail,
      publishedAt: latestClip.publishedAt
    } : undefined
  };
}

export function getKickClips(kickUsername: string, streamerId: string, streamerName: string): VideoClip[] {
  return MOCK_KICK_CLIPS[kickUsername] || [];
}
