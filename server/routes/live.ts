import { Router } from 'express';
import { db } from '../db.js';
import { getYouTubeLiveStatus } from '../services/youtube.js';
import { getKickLiveStatus } from '../services/kick.js';
import { LiveStatus } from '../types.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const streamers = db.getStreamers().filter(s => s.isActive);
    const mockStates = db.getMockLiveStates();

    const liveStatuses: LiveStatus[] = [];

    for (const streamer of streamers) {
      // 1. YouTube Live Status
      const ytStatus = await getYouTubeLiveStatus(
        streamer.youtubeHandle,
        streamer.id,
        streamer.name,
        streamer.inGameCharacter,
        streamer.youtubeChannelId
      );

      // Check if manual mock override is set
      if (mockStates[streamer.id]?.youtubeLive !== undefined) {
        ytStatus.isLive = mockStates[streamer.id].youtubeLive;
        if (!ytStatus.isLive) {
          ytStatus.viewerCount = 0;
        } else if (ytStatus.viewerCount === 0) {
          ytStatus.viewerCount = 3840;
        }
      }

      // 2. Kick Live Status
      const kickStatus = await getKickLiveStatus(
        streamer.kickUsername,
        streamer.id,
        streamer.name,
        streamer.inGameCharacter
      );

      // Check if manual mock override is set
      if (mockStates[streamer.id]?.kickLive !== undefined) {
        kickStatus.isLive = mockStates[streamer.id].kickLive;
        if (!kickStatus.isLive) {
          kickStatus.viewerCount = 0;
        } else if (kickStatus.viewerCount === 0) {
          kickStatus.viewerCount = 2150;
        }
      }

      liveStatuses.push(ytStatus);
      liveStatuses.push(kickStatus);
    }

    return res.json({
      timestamp: new Date().toISOString(),
      cachedUntil: new Date(Date.now() + 60000).toISOString(),
      streams: liveStatuses,
      streamers: streamers.map(s => ({
        id: s.id,
        name: s.name,
        character: s.inGameCharacter,
        photo: s.photo,
        hasLiveStream: liveStatuses.some(l => l.streamerId === s.id && l.isLive)
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch live streams' });
  }
});

// Admin toggle to simulate live broadcast for any streamer
router.post('/toggle', requireRole(['admin']), (req: AuthenticatedRequest, res) => {
  const { streamerId, platform, isLive } = req.body;
  if (!streamerId || !platform || isLive === undefined) {
    return res.status(400).json({ error: 'streamerId, platform and isLive are required' });
  }

  const updatedState = db.setMockLiveState(streamerId, platform, isLive);
  return res.json({
    success: true,
    streamerId,
    state: updatedState
  });
});

export default router;
