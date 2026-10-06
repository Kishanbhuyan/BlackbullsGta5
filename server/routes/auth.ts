import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../types.js';

const router = Router();

function sanitizeUser(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { name, email, password } = parsed.data;
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      passwordHash,
      role: 'fan',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);
    const token = generateToken(newUser);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: sanitizeUser(newUser),
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email, password } = parsed.data;
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: sanitizeUser(user),
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({ user: sanitizeUser(req.user) });
});

// Kick Username Instant Sign In
router.post('/kick-login', async (req, res) => {
  try {
    const { kickUsername } = req.body;
    if (!kickUsername || typeof kickUsername !== 'string' || !kickUsername.trim()) {
      return res.status(400).json({ error: 'Please enter a valid Kick username' });
    }

    const cleanUsername = kickUsername.trim().replace(/^@/, '');
    if (cleanUsername.length < 2 || cleanUsername.length > 32) {
      return res.status(400).json({ error: 'Kick username must be between 2 and 32 characters' });
    }

    // Check if user with this kick username or name already exists
    const users = db.getUsers();
    let user = users.find(
      u => (u.kickUsername && u.kickUsername.toLowerCase() === cleanUsername.toLowerCase()) ||
           (u.name.toLowerCase() === cleanUsername.toLowerCase())
    );

    if (!user) {
      const passwordHash = await bcrypt.hash(`kick_auth_${Date.now()}`, 10);
      user = {
        id: `usr_kick_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: cleanUsername,
        email: `${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '_')}@kick.community`,
        passwordHash,
        role: 'fan',
        kickUsername: cleanUsername,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
        createdAt: new Date().toISOString()
      };
      db.createUser(user);
    } else if (!user.kickUsername) {
      // Link kick username if not linked
      user.kickUsername = cleanUsername;
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: sanitizeUser(user),
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Kick login failed' });
  }
});

// Demo accounts fast-switcher for testing
router.post('/demo-login', (req, res) => {
  const { demoType } = req.body;
  let targetEmail = 'fan@blackbulls.rp';

  if (demoType === 'admin') {
    targetEmail = 'admin@blackbulls.rp';
  } else if (demoType === 'streamer-mota') {
    targetEmail = 'motabhai@blackbulls.rp';
  } else if (demoType === 'streamer-kancha') {
    targetEmail = 'kancha@blackbulls.rp';
  } else if (demoType === 'fan') {
    targetEmail = 'fan@blackbulls.rp';
  }

  const user = db.getUserByEmail(targetEmail);
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = generateToken(user);
  setAuthCookie(res, token);

  return res.json({
    user: sanitizeUser(user),
    token
  });
});

export default router;
