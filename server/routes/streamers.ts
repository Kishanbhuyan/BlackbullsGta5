import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { Streamer } from '../types.js';

const router = Router();

// GET all streamers
router.get('/', (req: AuthenticatedRequest, res) => {
  const streamers = db.getStreamers();
  // If not admin, return only active
  if (req.user?.role !== 'admin') {
    return res.json(streamers.filter(s => s.isActive));
  }
  return res.json(streamers);
});

// GET single streamer
router.get('/:id', (req, res) => {
  const streamer = db.getStreamerById(req.params.id);
  if (!streamer) {
    return res.status(404).json({ error: 'Streamer not found' });
  }
  return res.json(streamer);
});

const streamerSchema = z.object({
  name: z.string().min(2),
  inGameCharacter: z.string().min(1),
  realName: z.string().min(1),
  bio: z.string().min(5),
  youtubeUrl: z.string().url(),
  youtubeHandle: z.string(),
  kickUrl: z.string().url(),
  kickUsername: z.string().min(1),
  instagramUrl: z.string().url(),
  photo: z.string().url(),
  coverImage: z.string().optional(),
  isActive: z.boolean().default(true),
});

// POST new streamer (Admin only)
router.post('/', requireRole(['admin']), (req, res) => {
  try {
    const parsed = streamerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const streamers = db.getStreamers();
    const newStreamer: Streamer = {
      id: `streamer_${Date.now()}`,
      ...parsed.data,
      order: streamers.length + 1
    };

    const created = db.createStreamer(newStreamer);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create streamer' });
  }
});

// PUT update streamer (Admin or the Streamer themself)
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const streamer = db.getStreamerById(id);
  if (!streamer) {
    return res.status(404).json({ error: 'Streamer not found' });
  }

  // If user is a streamer, they can only edit their own profile
  if (req.user?.role === 'streamer') {
    if (req.user.streamerId !== id) {
      return res.status(403).json({ error: 'You can only edit your own streamer profile' });
    }
  } else if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updated = db.updateStreamer(id, req.body);
  return res.json(updated);
});

// DELETE streamer (Admin only)
router.delete('/:id', requireRole(['admin']), (req, res) => {
  const success = db.deleteStreamer(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Streamer not found' });
  }
  return res.json({ success: true, message: 'Streamer deleted successfully' });
});

export default router;
