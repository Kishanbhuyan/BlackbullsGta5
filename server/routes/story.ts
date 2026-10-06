import { Router } from 'express';
import { db } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const story = db.getStory();
  return res.json(story);
});

router.put('/', requireRole(['admin']), (req, res) => {
  const updated = db.updateStory(req.body);
  return res.json(updated);
});

export default router;
