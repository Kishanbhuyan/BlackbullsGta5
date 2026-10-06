import { Router } from 'express';
import { db } from '../db.js';
import { getYouTubeVideos } from '../services/youtube.js';
import { getKickClips } from '../services/kick.js';
import { VideoClip } from '../types.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { streamerId, type, platform } = req.query;
    const streamers = db.getStreamers().filter(s => s.isActive);

    let allVideos: VideoClip[] = [];

    for (const s of streamers) {
      // YouTube videos
      const ytVideos = await getYouTubeVideos(s.youtubeHandle, s.id, s.name);
      allVideos.push(...ytVideos);

      // Kick clips
      const kickClips = getKickClips(s.kickUsername, s.id, s.name);
      allVideos.push(...kickClips);
    }

    // Apply filters
    if (streamerId && streamerId !== 'all') {
      allVideos = allVideos.filter(v => v.streamerId === streamerId);
    }

    if (platform && platform !== 'all') {
      allVideos = allVideos.filter(v => v.platform === platform);
    }

    if (type && type !== 'all') {
      allVideos = allVideos.filter(v => v.type === type);
    }

    // Sort by published date descending
    allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return res.json({
      count: allVideos.length,
      videos: allVideos
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch videos' });
  }
});

export default router;
