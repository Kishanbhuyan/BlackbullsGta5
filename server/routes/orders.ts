import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { Order, OrderStatus } from '../types.js';

const router = Router();

const orderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(6),
  shippingAddress: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(3),
  }),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number().positive(),
    size: z.string().optional(),
    quantity: z.number().int().positive(),
    image: z.string(),
  })).min(1),
});

// Create Order (Fan or any authenticated user)
router.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { customerName, phone, shippingAddress, items } = parsed.data;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `BB-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      customerName,
      email: user.email,
      phone,
      shippingAddress,
      items,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const created = db.createOrder(newOrder);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

// Get current user's orders
router.get('/my', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const orders = db.getOrdersByUserId(user.id);
  return res.json(orders);
});

// Get all orders (Admin only)
router.get('/', requireRole(['admin']), (req, res) => {
  const orders = db.getOrders();
  return res.json(orders);
});

// Update order status (Admin only)
const statusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'])
});

router.put('/:id/status', requireRole(['admin']), (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const updated = db.updateOrderStatus(req.params.id, parsed.data.status as OrderStatus);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(updated);
});

export default router;
