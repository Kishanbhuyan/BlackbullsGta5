import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireRole } from '../middleware/auth.js';
import { Product } from '../types.js';

const router = Router();

router.get('/', (req, res) => {
  const products = db.getProducts();
  return res.json(products);
});

router.post('/notify', (req, res) => {
  try {
    const { emailOrDiscord } = req.body;
    if (!emailOrDiscord || typeof emailOrDiscord !== 'string' || !emailOrDiscord.trim()) {
      return res.status(400).json({ error: 'Please enter a valid email address or Discord username.' });
    }
    const vipCode = `BULLS-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
    return res.json({
      success: true,
      message: 'You have been added to the Black Bulls Drop 01 VIP Priority List!',
      vipCode
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to register notification' });
  }
});

router.get('/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  category: z.enum(['Hoodies', 'T-Shirts', 'Caps', 'Mugs', 'Accessories']),
  images: z.array(z.string()).min(1),
  sizes: z.array(z.string()),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().nonnegative().default(10),
  featured: z.boolean().optional(),
});

router.post('/', requireRole(['admin']), (req, res) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      ...parsed.data,
      rating: 5.0,
    };

    const created = db.createProduct(newProduct);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

router.put('/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const existing = db.getProductById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updated = db.updateProduct(id, req.body);
  return res.json(updated);
});

router.delete('/:id', requireRole(['admin']), (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ success: true, message: 'Product deleted' });
});

export default router;
