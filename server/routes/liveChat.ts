import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { LiveChatMessage } from '../types.js';

const router = Router();

// GET live chat messages
router.get('/', (req, res) => {
  const { streamerId, limit } = req.query;
  const maxLimit = limit ? Math.min(parseInt(limit as string, 10), 100) : 60;
  const messages = db.getLiveMessages(streamerId as string, maxLimit);
  return res.json({
    messages,
    count: messages.length,
    timestamp: new Date().toISOString()
  });
});

const postMessageSchema = z.object({
  streamerId: z.string().min(1),
  message: z.string().min(1, 'Message cannot be empty').max(300, 'Message cannot exceed 300 characters'),
  username: z.string().optional(),
  kickUsername: z.string().optional(),
});

// POST new live chat message
router.post('/', (req: AuthenticatedRequest, res) => {
  try {
    const parsed = postMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { streamerId, message } = parsed.data;

    let username = 'Gang Member';
    let role: LiveChatMessage['role'] = 'guest';
    let avatar: string | undefined = undefined;
    let userId: string | undefined = undefined;
    let kickUsername: string | undefined = undefined;

    if (req.user) {
      username = req.user.name;
      role = req.user.role;
      avatar = req.user.avatar;
      userId = req.user.id;
      kickUsername = req.user.kickUsername;
    } else if (parsed.data.kickUsername && parsed.data.kickUsername.trim()) {
      const cleanKick = parsed.data.kickUsername.trim().replace(/^@/, '').slice(0, 24);
      kickUsername = cleanKick;
      username = parsed.data.username && parsed.data.username.trim()
        ? parsed.data.username.trim().slice(0, 24)
        : cleanKick;
      role = 'fan';
      avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanKick)}`;
    } else if (parsed.data.username && parsed.data.username.trim()) {
      username = parsed.data.username.trim().slice(0, 24);
      avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
    } else {
      username = `Bull_${Math.floor(100 + Math.random() * 900)}`;
      avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
    }

    const newMessage: LiveChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      streamerId,
      userId,
      username,
      role,
      message: message.trim(),
      avatar,
      kickUsername,
      createdAt: new Date().toISOString(),
    };

    const saved = db.addLiveMessage(newMessage);
    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to post message' });
  }
});

// DELETE live chat message (Admin or Streamer)
router.delete('/:id', requireRole(['admin', 'streamer']), (req: AuthenticatedRequest, res) => {
  const success = db.deleteLiveMessage(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Message not found' });
  }
  return res.json({ success: true, message: 'Message removed' });
});

// GET kick channel & chatroom info proxy
router.get('/kick-info/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(username)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return res.json({
        slug: data.slug,
        chatroomId: data.chatroom?.id,
        isLive: Boolean(data.livestream),
        sessionTitle: data.livestream?.session_title,
        viewers: data.livestream?.viewers || 0,
      });
    }
    return res.json({
      slug: username,
      chatroomId: username === 'motabhai' ? 111515218 : (username === 'thunderboltgaming' ? 111521085 : null),
      isLive: false,
    });
  } catch (err) {
    return res.json({
      slug: username,
      chatroomId: username === 'motabhai' ? 111515218 : (username === 'thunderboltgaming' ? 111521085 : null),
      isLive: false,
    });
  }
});

export default router;
