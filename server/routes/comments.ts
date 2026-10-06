import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { Comment, CommentStatus } from '../types.js';

const router = Router();

// GET public approved comments
router.get('/', (req, res) => {
  const { streamerId } = req.query;
  let comments = db.getApprovedComments();
  if (streamerId && streamerId !== 'all') {
    comments = comments.filter(c => c.streamerId === streamerId);
  }
  return res.json(comments);
});

// POST new comment (Logged in fan or user)
const commentSchema = z.object({
  streamerId: z.string().min(1),
  content: z.string().min(3, 'Comment must be at least 3 characters').max(500, 'Comment max 500 characters'),
});

router.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const streamer = db.getStreamerById(parsed.data.streamerId);
    if (!streamer) {
      return res.status(400).json({ error: 'Streamer not found' });
    }

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      streamerId: streamer.id,
      streamerName: streamer.name,
      content: parsed.data.content,
      // Auto-approved for fan engagement or marked approved
      status: 'approved',
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    const created = db.createComment(newComment);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit comment' });
  }
});

// GET streamer dashboard comments (addressed to logged-in streamer)
router.get('/streamer', requireRole(['streamer', 'admin']), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const streamerId = user.role === 'admin' ? (req.query.streamerId as string) : user.streamerId;

  if (!streamerId) {
    return res.status(400).json({ error: 'No streamer ID associated with this account' });
  }

  const comments = db.getCommentsByStreamer(streamerId);
  return res.json(comments);
});

// Streamer toggle favorite
router.put('/:id/favorite', requireRole(['streamer', 'admin']), (req: AuthenticatedRequest, res) => {
  const updated = db.toggleFavoriteComment(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  return res.json(updated);
});

// Admin: get all comments
router.get('/all', requireRole(['admin']), (req, res) => {
  const comments = db.getAllComments();
  return res.json(comments);
});

// Admin: moderate comment (status)
router.put('/:id/moderate', requireRole(['admin']), (req, res) => {
  const { status } = req.body;
  if (!['approved', 'pending', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = db.updateCommentStatus(req.params.id, status as CommentStatus);
  if (!updated) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  return res.json(updated);
});

// Admin: delete comment
router.delete('/:id', requireRole(['admin']), (req, res) => {
  const success = db.deleteComment(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  return res.json({ success: true, message: 'Comment deleted' });
});

export default router;
