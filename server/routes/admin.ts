import { Router } from 'express';
import { db } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireRole(['admin']), (req, res) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const comments = db.getAllComments();
  const users = db.getUsers();
  const streamers = db.getStreamers();

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const pendingComments = comments.filter(c => c.status === 'pending').length;

  return res.json({
    totalOrders: orders.length,
    pendingOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProducts: products.length,
    totalComments: comments.length,
    pendingComments,
    totalUsers: users.length,
    totalStreamers: streamers.length,
  });
});

export default router;
