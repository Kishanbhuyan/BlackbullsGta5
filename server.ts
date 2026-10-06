import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authMiddleware } from './server/middleware/auth.js';

// Route imports
import authRouter from './server/routes/auth.js';
import streamersRouter from './server/routes/streamers.js';
import liveRouter from './server/routes/live.js';
import videosRouter from './server/routes/videos.js';
import productsRouter from './server/routes/products.js';
import ordersRouter from './server/routes/orders.js';
import commentsRouter from './server/routes/comments.js';
import storyRouter from './server/routes/story.js';
import adminRouter from './server/routes/admin.js';
import liveChatRouter from './server/routes/liveChat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp() {
  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Core Middlewares
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(authMiddleware);

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/streamers', streamersRouter);
  app.use('/api/live', liveRouter);
  app.use('/api/videos', videosRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/comments', commentsRouter);
  app.use('/api/story', storyRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/live-chat', liveChatRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (!isProduction) {
    // Development mode with Vite Middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Centralized Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error'
    });
  });

  return app;
}

async function startServer() {
  const app = await createApp();
  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Black Bulls Server] Running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
