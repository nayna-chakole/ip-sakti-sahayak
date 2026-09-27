import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGetMe,
  handleUpdateLanguage,
  requireAuth,
  optionalAuth
} from './auth.js';
import { apiRouter } from './routes.js';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export async function createServer() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.APP_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'IP-SAKTI Sahayak API (Python RAG & AI Engine)',
      version: '3.0.0',
      timestamp: new Date().toISOString()
    });
  });

  app.post('/api/auth/register', handleRegister);
  app.post('/api/auth/login', handleLogin);
  app.post('/api/auth/logout', handleLogout);
  app.get('/api/auth/me', optionalAuth, handleGetMe);
  app.patch('/api/auth/language', requireAuth, handleUpdateLanguage);

  app.use('/api', apiRouter);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

export async function start() {
  const app = await createServer();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IP-SAKTI Sahayak] Server running on http://0.0.0.0:${PORT} (Python RAG Engine Active)`);
  });
}