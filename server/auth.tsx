import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ayush-sakti-sahayak-jwt-secret-key-2026';
const TOKEN_COOKIE_NAME = 'ip_sakti_token';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

export function signToken(user: UserRecord): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/'
  });
}

/**
 * Authentication Middleware: protects routes and attaches verified user record.
 * Accepts token from EITHER the Authorization: Bearer <token> header OR the cookie.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.[TOKEN_COOKIE_NAME];

  const authHeader = req.headers.authorization || req.headers['authorization'];
  if (!token && authHeader) {
    const authStr = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (authStr.startsWith('Bearer ')) {
      token = authStr.slice(7).trim();
    } else {
      token = authStr.trim();
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to analyze formulations.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = db.findUserById(payload.sub);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'User account not found. Please sign in again.' });
    }
    req.user = user;
    next();
  } catch {
    clearAuthCookie(res);
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
}

/**
 * Optional Authentication Middleware:
 * Checks Authorization header or cookie. If valid, attaches verified user to req.user.
 * If not provided or invalid, leaves req.user undefined and continues without returning 401.
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.[TOKEN_COOKIE_NAME];

  const authHeader = req.headers.authorization || req.headers['authorization'];
  if (!token && authHeader) {
    const authStr = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (authStr.startsWith('Bearer ')) {
      token = authStr.slice(7).trim();
    } else {
      token = authStr.trim();
    }
  }

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
      const user = db.findUserById(payload.sub);
      if (user) {
        req.user = user;
      }
    } catch {
      clearAuthCookie(res);
    }
  }

  next();
}

// Controller handlers
export async function handleRegister(req: Request, res: Response) {
  const { name, email, password, confirmPassword, role, consent, preferredLanguage } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 8 || !/\d/.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and contain at least one number' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const validRoles = ['Student', 'Researcher', 'Ayurvedic Practitioner', 'Manufacturer/Startup', 'IP Professional'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Please select a valid professional role' });
  }

  if (!consent) {
    return res.status(400).json({ error: 'You must agree to data processing under the Digital Personal Data Protection Act, 2023' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.findUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    preferredLanguage: preferredLanguage === 'hi' || preferredLanguage === 'mr' ? preferredLanguage : 'en',
    createdAt: new Date().toISOString()
  };

  db.createUser(user);

  const token = signToken(user);
  setAuthCookie(res, token);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage
    }
  });
}

export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const attemptInfo = db.getLoginAttempts(normalizedEmail);

  const now = Date.now();
  if (attemptInfo.lockedUntil && attemptInfo.lockedUntil > now) {
    const minutesLeft = Math.ceil((attemptInfo.lockedUntil - now) / 60000);
    return res.status(429).json({
      error: `Too many failed attempts. This account is temporarily locked. Please try again in ${minutesLeft} minute(s).`
    });
  }

  const user = db.findUserByEmail(normalizedEmail);
  if (!user) {
    const updated = db.recordFailedLogin(normalizedEmail);
    if (updated.lockedUntil) {
      return res.status(429).json({
        error: 'Too many failed attempts. This account is temporarily locked for 15 minutes.'
      });
    }
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const updated = db.recordFailedLogin(normalizedEmail);
    if (updated.lockedUntil) {
      return res.status(429).json({
        error: 'Too many failed attempts. This account is temporarily locked for 15 minutes.'
      });
    }
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Clear failed attempts on valid login
  db.clearFailedLogins(normalizedEmail);

  const token = signToken(user);
  setAuthCookie(res, token);

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage
    }
  });
}

export function handleLogout(req: Request, res: Response) {
  clearAuthCookie(res);
  return res.json({ message: 'Successfully logged out' });
}

export function handleGetMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.json({ user: null });
  }

  const token = signToken(req.user);
  return res.json({
    token,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      preferredLanguage: req.user.preferredLanguage
    }
  });
}

export function handleUpdateLanguage(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { language } = req.body;
  if (language !== 'en' && language !== 'hi' && language !== 'mr') {
    return res.status(400).json({ error: 'Supported languages are en, hi, mr' });
  }

  db.updateUserLanguage(req.user.id, language);
  req.user.preferredLanguage = language;

  return res.json({
    message: 'Language preference updated',
    preferredLanguage: language
  });
}
